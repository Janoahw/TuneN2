import { prisma } from '../config/database.js';
import { BadRequestError, NotFoundError } from '../utils/errors.js';
import { sanitizeMarkdown } from '../utils/sanitizeMarkdown.js';
import type { LegalDocumentType } from '../schemas/legal.js';

/** Shape returned to unauthenticated callers — never exposes drafts or history. */
export interface PublicLegalDocument {
  type: string;
  version: number;
  title: string;
  content: string;
  publishedAt: Date | null;
}

export interface LegalDocumentSummary {
  id: string;
  version: number;
  title: string;
  isPublished: boolean;
  publishedAt: Date | null;
  updatedAt: Date;
  updatedBy: { id: string; displayName: string } | null;
}

export interface AdminLegalDocument {
  type: string;
  published: (PublicLegalDocument & { id: string }) | null;
  draft: { id: string; version: number; title: string; content: string; updatedAt: Date } | null;
  history: LegalDocumentSummary[];
}

export interface AcceptanceStatus {
  currentVersion: number | null;
  acceptedVersion: number | null;
  needsAcceptance: boolean;
}

const PUBLIC_SELECT = {
  type: true,
  version: true,
  title: true,
  content: true,
  publishedAt: true,
} as const;

const EDITOR_SELECT = {
  id: true,
  displayName: true,
} as const;

export class LegalService {
  /**
   * The live document for a type. Public endpoint — drafts and version history
   * must never be reachable from here.
   */
  async getPublished(type: LegalDocumentType): Promise<PublicLegalDocument> {
    const doc = await prisma.legalDocument.findFirst({
      where: { type, isPublished: true },
      orderBy: { version: 'desc' },
      select: PUBLIC_SELECT,
    });

    if (!doc) {
      throw new NotFoundError(`No published ${type} document`);
    }

    return doc;
  }

  /**
   * Everything the admin editor needs: the live document, the working draft, and
   * the full version history.
   */
  async getForAdmin(type: LegalDocumentType): Promise<AdminLegalDocument> {
    const [published, draft, history] = await Promise.all([
      prisma.legalDocument.findFirst({
        where: { type, isPublished: true },
        orderBy: { version: 'desc' },
        select: { id: true, ...PUBLIC_SELECT },
      }),
      this.findDraft(type),
      prisma.legalDocument.findMany({
        where: { type },
        orderBy: { version: 'desc' },
        select: {
          id: true,
          version: true,
          title: true,
          isPublished: true,
          publishedAt: true,
          updatedAt: true,
          updatedBy: { select: EDITOR_SELECT },
        },
      }),
    ]);

    return { type, published, draft, history };
  }

  /** Admin overview across every document type. */
  async getAllForAdmin(types: readonly LegalDocumentType[]): Promise<AdminLegalDocument[]> {
    return Promise.all(types.map((type) => this.getForAdmin(type)));
  }

  /**
   * Create or update the working draft for a type. Repeated saves update the same
   * row — a new version number is only minted when there is no open draft, which
   * keeps the live document immutable while it is being revised.
   */
  async saveDraft(
    type: LegalDocumentType,
    data: { title: string; content: string },
    adminId: string,
  ) {
    const content = sanitizeMarkdown(data.content);
    if (!content) {
      throw new BadRequestError('Content is empty after sanitization');
    }

    const existingDraft = await this.findDraft(type);

    if (existingDraft) {
      return prisma.legalDocument.update({
        where: { id: existingDraft.id },
        data: { title: data.title, content, updatedById: adminId },
      });
    }

    const latest = await prisma.legalDocument.findFirst({
      where: { type },
      orderBy: { version: 'desc' },
      select: { version: true },
    });

    return prisma.legalDocument.create({
      data: {
        type,
        version: (latest?.version ?? 0) + 1,
        title: data.title,
        content,
        isPublished: false,
        updatedById: adminId,
      },
    });
  }

  /**
   * Publish the working draft. Unpublishing the previous version and publishing the
   * draft happen in one transaction so there is never a window with two live
   * documents — or none.
   */
  async publish(type: LegalDocumentType, adminId: string) {
    const draft = await this.findDraft(type);
    if (!draft) {
      throw new BadRequestError(`No draft ${type} document to publish`);
    }

    const [, published] = await prisma.$transaction([
      prisma.legalDocument.updateMany({
        where: { type, isPublished: true },
        data: { isPublished: false },
      }),
      prisma.legalDocument.update({
        where: { id: draft.id },
        data: { isPublished: true, publishedAt: new Date(), updatedById: adminId },
      }),
    ]);

    return published;
  }

  /**
   * Whether the user has accepted the live Terms. Acceptance is tracked for terms
   * only — the privacy policy is informational and does not gate the app.
   */
  async getAcceptanceStatus(userId: string): Promise<AcceptanceStatus> {
    const [current, user] = await Promise.all([
      prisma.legalDocument.findFirst({
        where: { type: 'terms', isPublished: true },
        orderBy: { version: 'desc' },
        select: { version: true },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { acceptedTermsVersion: true },
      }),
    ]);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const currentVersion = current?.version ?? null;
    const acceptedVersion = user.acceptedTermsVersion;

    return {
      currentVersion,
      acceptedVersion,
      // Nothing published means nothing to accept — the app must not be blocked by
      // an empty legal table.
      needsAcceptance:
        currentVersion !== null && (acceptedVersion === null || acceptedVersion < currentVersion),
    };
  }

  /**
   * Record acceptance of a specific version. The version is checked against the live
   * document so a client cannot accept a version it never saw, or replay an old one.
   */
  async recordAcceptance(userId: string, version: number): Promise<AcceptanceStatus> {
    const current = await prisma.legalDocument.findFirst({
      where: { type: 'terms', isPublished: true },
      orderBy: { version: 'desc' },
      select: { version: true },
    });

    if (!current) {
      throw new BadRequestError('No published terms document to accept');
    }

    if (version !== current.version) {
      throw new BadRequestError(
        `Terms version mismatch — current published version is ${current.version}`,
      );
    }

    await prisma.user.update({
      where: { id: userId },
      data: { acceptedTermsVersion: current.version, acceptedTermsAt: new Date() },
    });

    return {
      currentVersion: current.version,
      acceptedVersion: current.version,
      needsAcceptance: false,
    };
  }

  /**
   * Version of the live Terms, or null when none is published. Used at signup so a
   * brand-new account is never immediately re-prompted for terms it just agreed to.
   */
  async getCurrentTermsVersion(): Promise<number | null> {
    const current = await prisma.legalDocument.findFirst({
      where: { type: 'terms', isPublished: true },
      orderBy: { version: 'desc' },
      select: { version: true },
    });

    return current?.version ?? null;
  }

  /**
   * The working draft for a type: the highest-versioned row, and only if it is
   * unpublished. Superseded versions are also `isPublished: false`, so filtering on
   * that flag alone would resurrect an old version as the draft.
   */
  private async findDraft(type: LegalDocumentType) {
    const latest = await prisma.legalDocument.findFirst({
      where: { type },
      orderBy: { version: 'desc' },
      select: {
        id: true,
        version: true,
        title: true,
        content: true,
        updatedAt: true,
        isPublished: true,
      },
    });

    if (!latest || latest.isPublished) return null;

    const { isPublished: _isPublished, ...draft } = latest;
    return draft;
  }
}
