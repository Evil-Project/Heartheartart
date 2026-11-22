import { basename } from "node:path";
import "server-only";
import { normalizeCardLimit, queryCards } from "@/lib/cards-database";
import { DEMO_POSTS } from "@/lib/demo-posts";
import { clean, cleanTimestamp, safeHttpsImage } from "@/lib/html-metadata";
import type { CardMessages } from "@/lib/i18n-config";
import { detectPlatform, type Platform } from "@/lib/platforms";
import type { ArchivePost, DatabasePost } from "@/lib/post-types";
import { fetchSourceMetadata } from "@/lib/source-metadata";

function snapshotUrl(input: string): string | null {
  const value = clean(input);
  if (!value) return null;

  try {
    const url = new URL(value);
    if (url.protocol === "https:" || url.protocol === "http:") return url.toString();
  } catch {
    // The Python backend stores temp/<uuid>, so derive the public snapshot URL.
  }

  const folder = basename(value.replace(/\\/g, "/"));
  if (!folder || folder === "." || folder === "/") return null;
  const base = (process.env.HEARTHEARTART_SNAPSHOT_BASE_URL || "https://cdn.heartheart.art").replace(
    /\/$/,
    "",
  );
  return `${base}/${encodeURIComponent(folder)}/index.html`;
}

function handleFor(author: string, platform: Platform, labels: CardMessages): string {
  const compact = author
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}_]+/gu, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();

  if (platform.id === "discord") return labels.discordContext;
  if (platform.id === "qq-channel") return labels.channelPost;
  if (platform.id === "qq-group") return labels.groupPost;
  return compact ? `@${compact}` : platform.label;
}

async function mapPost(
  row: DatabasePost,
  index: number,
  labels: CardMessages,
): Promise<ArchivePost | null> {
  const originalUrl = clean(row.link);
  if (!originalUrl) return null;

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(originalUrl);
    if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") return null;
  } catch {
    return null;
  }

  const platform = detectPlatform(originalUrl);
  const metadata = row.previewOnly ? {} : await fetchSourceMetadata(originalUrl);
  const author = clean(metadata.author) || clean(row.author) || platform.label;
  const databaseTitle = clean(row.title);
  const databaseDescription = clean(row.description);

  return {
    id: clean(String(row.id ?? "")) || `${platform.id}-${index}`,
    originalUrl: parsedUrl.toString(),
    snapshotUrl: snapshotUrl(clean(row.screenshot)),
    title: clean(metadata.title) || databaseTitle || databaseDescription || labels.untitledPost,
    description:
      clean(metadata.description) ||
      (databaseTitle && databaseDescription !== databaseTitle ? databaseDescription : ""),
    author,
    handle: handleFor(author, platform, labels),
    imageUrl: safeHttpsImage(clean(metadata.image) || clean(row.image)) || null,
    publishedAt:
      clean(metadata.publishedAt) || cleanTimestamp(row.timestamp) || new Date(0).toISOString(),
    platform,
  };
}

async function fetchDatabaseRows(limit: number): Promise<DatabasePost[]> {
  try {
    const result = await queryCards(limit);
    return result.results ?? [];
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Archive database is unavailable; rendering local preview cards.", error);
      return DEMO_POSTS.slice(0, limit);
    }
    console.error("Unable to load archive cards", error);
    throw new Error("Unable to load the archive.");
  }
}

async function mapWithConcurrency(
  rows: DatabasePost[],
  concurrency: number,
  labels: CardMessages,
): Promise<ArchivePost[]> {
  const mapped: Array<ArchivePost | null> = new Array(rows.length).fill(null);
  let cursor = 0;

  async function worker() {
    while (cursor < rows.length) {
      const index = cursor++;
      mapped[index] = await mapPost(rows[index], index, labels);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, rows.length) }, () => worker()));
  return mapped.filter((post): post is ArchivePost => post !== null);
}

export async function getPosts(labels: CardMessages): Promise<ArchivePost[]> {
  const limit = normalizeCardLimit(process.env.HEARTHEARTART_POST_LIMIT);
  const rows = await fetchDatabaseRows(limit);
  return mapWithConcurrency(rows, 5, labels);
}
