import type { DatabasePost } from "@/lib/post-types";

export const DEFAULT_CARD_LIMIT = 50;
export const MAX_CARD_LIMIT = 100;

export type CardQueryResult = {
  results?: DatabasePost[];
  success: boolean;
  meta: {
    rows_read: number;
    rows_written: number;
  };
};

export function normalizeCardLimit(value: string | number | null | undefined): number {
  const parsed = typeof value === "number" ? value : Number.parseInt(value || "", 10);
  if (!Number.isFinite(parsed)) return DEFAULT_CARD_LIMIT;
  return Math.min(Math.max(Math.trunc(parsed), 1), MAX_CARD_LIMIT);
}
