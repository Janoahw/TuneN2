import { z } from 'zod';

/** The only document types the platform publishes. Never interpolate a raw value into a query. */
export const LEGAL_DOCUMENT_TYPES = ['terms', 'privacy'] as const;
export type LegalDocumentType = (typeof LEGAL_DOCUMENT_TYPES)[number];

export const legalTypeParamSchema = z.object({
  type: z.enum(LEGAL_DOCUMENT_TYPES),
});

/** Draft payload from the admin editor. `content` is sanitized in the service before storage. */
export const legalSaveDraftSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(200_000),
});

export const legalAcceptSchema = z.object({
  version: z.number().int().min(1),
});

export type LegalTypeParam = z.infer<typeof legalTypeParamSchema>;
export type LegalSaveDraft = z.infer<typeof legalSaveDraftSchema>;
export type LegalAccept = z.infer<typeof legalAcceptSchema>;
