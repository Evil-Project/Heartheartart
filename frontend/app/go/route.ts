import { NextRequest } from "next/server";
import { isArchiveSourceHost } from "@/lib/source-hosts";

const FALLBACK_STATUSES = new Set([404, 410, 451]);
const PRIVATE_HOST = /^(localhost|0\.0\.0\.0|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|\[?::1\]?$)/i;

function safeExternalUrl(value: string | null): URL | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if ((url.protocol !== "https:" && url.protocol !== "http:") || PRIVATE_HOST.test(url.hostname)) {
      return null;
    }
    return url;
  } catch {
    return null;
  }
}

function allowedOriginalUrl(value: string | null): URL | null {
  const url = safeExternalUrl(value);
  if (!url) return null;
  return isArchiveSourceHost(url.hostname) ? url : null;
}

function allowedSnapshotUrl(value: string | null): URL | null {
  const url = safeExternalUrl(value);
  if (!url) return null;
  const configuredBase = process.env.HEARTHEARTART_SNAPSHOT_BASE_URL || "https://cdn.heartheart.art";
  const expectedHost = new URL(configuredBase).hostname.toLowerCase();
  return url.hostname.toLowerCase() === expectedHost ? url : null;
}

async function originalWorks(url: URL): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4500);

  try {
    let response = await fetch(url, {
      method: "HEAD",
      redirect: "manual",
      cache: "no-store",
      signal: controller.signal,
      headers: { "User-Agent": "Heartheartart Link Check/1.0" },
    });

    if (response.status === 405) {
      response = await fetch(url, {
        method: "GET",
        redirect: "manual",
        cache: "no-store",
        signal: controller.signal,
        headers: {
          Range: "bytes=0-0",
          "User-Agent": "Heartheartart Link Check/1.0",
        },
      });
    }

    return !FALLBACK_STATUSES.has(response.status) && response.status < 500;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET(request: NextRequest) {
  const original = allowedOriginalUrl(request.nextUrl.searchParams.get("url"));
  const snapshot = allowedSnapshotUrl(request.nextUrl.searchParams.get("snapshot"));

  if (!original) {
    return Response.json({ error: "A valid original URL is required." }, { status: 400 });
  }

  if (!snapshot || (await originalWorks(original))) {
    return Response.redirect(original, 307);
  }

  return Response.redirect(snapshot, 307);
}
