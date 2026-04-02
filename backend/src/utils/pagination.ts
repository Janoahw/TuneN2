export interface CursorPaginationParams {
  cursor?: string;
  limit: number;
}

export interface CursorPaginationResult<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface OffsetPaginationParams {
  page: number;
  limit: number;
}

export interface OffsetPaginationResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function buildCursorPaginationResult<T extends Record<string, unknown>>(
  items: T[],
  limit: number,
  cursorField: keyof T = "id" as keyof T,
): CursorPaginationResult<T> {
  const hasMore = items.length > limit;
  const sliced = hasMore ? items.slice(0, limit) : items;
  const lastItem = sliced[sliced.length - 1];
  const nextCursor = hasMore && lastItem
    ? String(lastItem[cursorField])
    : null;

  return { items: sliced, nextCursor, hasMore };
}

export function buildOffsetPaginationResult<T>(
  items: T[],
  total: number,
  page: number,
  limit: number,
): OffsetPaginationResult<T> {
  const totalPages = Math.ceil(total / limit);

  return {
    items,
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

export function parsePaginationParams(query: {
  page?: string;
  limit?: string;
  cursor?: string;
}): { page: number; limit: number; cursor?: string } {
  const page = Math.max(1, parseInt(query.page ?? "1", 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? "20", 10) || 20));
  const cursor = query.cursor || undefined;

  return { page, limit, cursor };
}
