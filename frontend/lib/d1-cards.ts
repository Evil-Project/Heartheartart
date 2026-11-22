import "server-only";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { CardQueryResult } from "@/lib/card-query";
import type { DatabasePost } from "@/lib/post-types";

async function database() {
  const { env } = await getCloudflareContext({ async: true });
  if (!env.DB) {
    throw new Error("The Cloudflare D1 binding named DB is not configured.");
  }
  return env.DB;
}

export async function pingCards(): Promise<void> {
  await (await database()).prepare("SELECT 1").first();
}

export async function queryCards(limit: number): Promise<CardQueryResult> {
  return (await database())
    .prepare(
      `SELECT id, link, title, description, author, screenshot, timestamp
       FROM links
       ORDER BY timestamp DESC, id DESC
       LIMIT ?`,
    )
    .bind(limit)
    .all<DatabasePost>();
}
