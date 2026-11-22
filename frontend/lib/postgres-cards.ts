import "server-only";

import { Pool } from "pg";
import type { CardQueryResult } from "@/lib/card-query";
import { databaseUrlFromEnv } from "@/lib/database-url";
import type { DatabasePost } from "@/lib/post-types";

const globalPool = globalThis as { heartheartartPool?: Pool };

const LIST_SQL = `
  SELECT id, link, title, description, author, screenshot, timestamp
  FROM links
  ORDER BY timestamp DESC NULLS LAST, id DESC
  LIMIT $1
`;

function text(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

function timestamp(value: unknown): string | number | null {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return text(value);
}

function mapRow(row: Record<string, unknown>): DatabasePost {
  const id = row.id;
  return {
    id: typeof id === "number" || typeof id === "string" ? id : null,
    link: text(row.link),
    title: text(row.title),
    description: text(row.description),
    author: text(row.author),
    screenshot: text(row.screenshot),
    timestamp: timestamp(row.timestamp),
  };
}

function getPool(): Pool {
  if (!globalPool.heartheartartPool) {
    globalPool.heartheartartPool = new Pool({
      connectionString: databaseUrlFromEnv(),
      application_name: "heartheartart-web",
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });
  }
  return globalPool.heartheartartPool;
}

export async function pingCards(): Promise<void> {
  await getPool().query("SELECT 1");
}

export async function queryCards(limit: number): Promise<CardQueryResult> {
  const result = await getPool().query<Record<string, unknown>>(LIST_SQL, [limit]);
  return {
    success: true,
    results: result.rows.map(mapRow),
    meta: { rows_read: result.rowCount ?? result.rows.length, rows_written: 0 },
  };
}
