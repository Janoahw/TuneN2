/**
 * Markdown sanitization for admin-authored legal documents.
 *
 * Legal content is written by admins but rendered inside the mobile app, so it is
 * treated as untrusted input regardless of who wrote it. Sanitization happens on
 * write so that whatever is persisted is already safe for every consumer.
 *
 * Guarantees:
 *  - No raw HTML survives (tags, comments, and the contents of script-like blocks)
 *  - Link and image destinations are limited to an allowlist of URI schemes
 *  - Control characters that can be used to smuggle a scheme past a filter are removed
 */

/** URI schemes a legal document is allowed to link to. Everything else is neutralized. */
const ALLOWED_SCHEMES = new Set(['http', 'https', 'mailto', 'tel']);

/** Destination substituted in when a link points somewhere disallowed. */
const NEUTRALIZED_URL = '#';

/** Elements whose *contents* must go, not just their tags. */
const RAW_BLOCK_ELEMENTS = ['script', 'style', 'iframe', 'object', 'embed', 'svg', 'math'];

/** C0/C1 controls plus whitespace — stripped before a URL's scheme is inspected. */
const URL_NOISE = /[\u0000-\u0020\u007F-\u00A0\u2028\u2029]/g;

/** C0 controls except tab, newline and carriage return, which are legitimate in markdown. */
const ILLEGAL_CONTROLS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  colon: ':',
  tab: '\t',
  newline: '\n',
};

/**
 * Decode HTML entities well enough to see through obfuscated schemes such as
 * `java&#115;cript:` or `javascript&colon;`. Only used for inspection, never for output.
 */
function decodeEntities(input: string): string {
  return input
    .replace(/&#[xX]([0-9a-fA-F]+);?/g, (_m, hex: string) =>
      String.fromCodePoint(parseInt(hex, 16)),
    )
    .replace(/&#(\d+);?/g, (_m, dec: string) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&([a-zA-Z]+);?/g, (m, name: string) => NAMED_ENTITIES[name.toLowerCase()] ?? m);
}

/**
 * True when a markdown link destination resolves to an allowed scheme, or to no
 * scheme at all (relative and fragment links are fine).
 */
export function isSafeUrl(rawUrl: string): boolean {
  // `java\nscript:` and `java\0script:` are both read as `javascript:` downstream,
  // so the scheme is inspected only after whitespace and controls are removed.
  const normalized = decodeEntities(rawUrl).replace(URL_NOISE, '');

  const schemeMatch = /^([a-zA-Z][a-zA-Z0-9+.-]*):/.exec(normalized);
  if (!schemeMatch) return true; // relative, anchor, or protocol-relative — no scheme to abuse

  return ALLOWED_SCHEMES.has(schemeMatch[1].toLowerCase());
}

/** Remove raw HTML while leaving markdown autolinks (`<https://…>`, `<a@b.com>`) intact. */
function stripHtml(input: string): string {
  let out = input;

  // HTML comments — including the unterminated form, which some parsers still honor.
  out = out.replace(/<!--[\s\S]*?-->/g, '').replace(/<!--[\s\S]*$/g, '');

  // Script-like elements: drop the whole block, contents included.
  for (const tag of RAW_BLOCK_ELEMENTS) {
    out = out.replace(new RegExp(`<${tag}\\b[\\s\\S]*?<\\/${tag}\\s*>`, 'gi'), '');
    // Unclosed opener — everything after it is suspect.
    out = out.replace(new RegExp(`<${tag}\\b[\\s\\S]*$`, 'gi'), '');
  }

  // CDATA and processing/declaration blocks.
  out = out.replace(/<!\[CDATA\[[\s\S]*?\]\]>/gi, '').replace(/<[!?][^>]*>/g, '');

  // Remaining tags. A name of `[a-zA-Z][a-zA-Z0-9-]*` followed by whitespace, `/`, or `>`
  // is what separates a real tag from an autolink like `<https://example.com>`, whose
  // "name" is followed by `:`.
  out = out.replace(/<\/?[a-zA-Z][a-zA-Z0-9-]*(?:\s[^<>]*)?\/?>/g, '');

  return out;
}

/**
 * Split the inside of a markdown link's parentheses into its destination and its
 * optional title. Whitespace only ends the destination when what follows actually
 * opens a title — otherwise `[x](java\nscript:…)` would yield a harmless-looking
 * destination of `java` and let the rest through.
 */
function splitDestination(body: string): { dest: string; title: string } {
  const trimmed = body.trim();

  if (trimmed.startsWith('<')) {
    const close = trimmed.indexOf('>');
    if (close !== -1) {
      return { dest: trimmed.slice(1, close), title: trimmed.slice(close + 1) };
    }
  }

  const titleMatch = /\s+(?:"[^"]*"|'[^']*'|\([^)]*\))\s*$/.exec(trimmed);
  if (titleMatch) {
    return { dest: trimmed.slice(0, titleMatch.index), title: titleMatch[0] };
  }

  return { dest: trimmed, title: '' };
}

/** Replace disallowed destinations in every markdown construct that carries a URL. */
function sanitizeUrls(input: string): string {
  let out = input;

  // Inline links and images: [text](url "title") / ![alt](<url>). The body pattern
  // tolerates one level of nested parens so URLs like `…/Foo_(bar)` survive intact.
  out = out.replace(
    /(!?\[(?:[^\]\\]|\\.)*\])\(((?:[^()\\]|\\.|\([^()]*\))*)\)/g,
    (match, label: string, body: string) => {
      const { dest, title } = splitDestination(body);
      return isSafeUrl(dest) ? match : `${label}(${NEUTRALIZED_URL}${title})`;
    },
  );

  // Reference definitions: [id]: url "title"
  out = out.replace(
    /^([ \t]{0,3}\[(?:[^\]\\]|\\.)+\]:[ \t]*)(<[^>]*>|\S+)/gm,
    (match, prefix: string, dest: string) => {
      const bare = dest.startsWith('<') && dest.endsWith('>') ? dest.slice(1, -1) : dest;
      return isSafeUrl(bare) ? match : `${prefix}${NEUTRALIZED_URL}`;
    },
  );

  // Autolinks: <scheme:rest>
  out = out.replace(/<([a-zA-Z][a-zA-Z0-9+.-]*:[^<>\s]*)>/g, (match, url: string) =>
    isSafeUrl(url) ? match : NEUTRALIZED_URL,
  );

  return out;
}

/**
 * Sanitize admin-authored markdown before it is persisted.
 *
 * @param input Raw markdown from the admin editor.
 * @returns Markdown safe to store and render.
 */
export function sanitizeMarkdown(input: string): string {
  if (!input) return '';

  return sanitizeUrls(stripHtml(input.replace(ILLEGAL_CONTROLS, ''))).trim();
}
