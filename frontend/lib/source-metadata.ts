import "server-only";

import { decodeHtml, firstMeta, metaTags, safeHttpsImage } from "@/lib/html-metadata";
import { isArchiveSourceHost } from "@/lib/source-hosts";

export type SourceMetadata = Partial<{
  title: string;
  description: string;
  author: string;
  image: string;
  publishedAt: string;
}>;

function allowedSourceUrl(input: string | URL): URL | null {
  try {
    const url = input instanceof URL ? input : new URL(input);
    const allowed = isArchiveSourceHost(url.hostname);
    return url.protocol === "https:" && allowed ? url : null;
  } catch {
    return null;
  }
}

async function fetchSourceHtml(
  url: URL,
  signal: AbortSignal,
  redirects = 0,
): Promise<Response | null> {
  if (!allowedSourceUrl(url) || redirects > 3) return null;

  const response = await fetch(url, {
    headers: {
      Accept: "text/html,application/xhtml+xml",
      "User-Agent": "Mozilla/5.0 (compatible; Heartheartart/1.0; +https://heartheart.art)",
    },
    redirect: "manual",
    signal,
    next: { revalidate: 900 },
  });

  if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get("location");
    if (!location) return null;
    return fetchSourceHtml(new URL(location, url), signal, redirects + 1);
  }

  return response;
}

async function readTextLimit(body: ReadableStream<Uint8Array> | null, limit: number): Promise<string> {
  if (!body) return "";
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let output = "";
  let size = 0;

  try {
    while (size < limit) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      output += decoder.decode(value, { stream: true });
    }
    output += decoder.decode();
    return output.slice(0, limit);
  } finally {
    await reader.cancel().catch(() => undefined);
  }
}

export async function fetchSourceMetadata(url: string): Promise<SourceMetadata> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    const sourceUrl = allowedSourceUrl(url);
    if (!sourceUrl) return {};
    const response = await fetchSourceHtml(sourceUrl, controller.signal);

    if (!response?.ok || !response.headers.get("content-type")?.includes("text/html")) {
      return {};
    }

    const html = await readTextLimit(response.body, 1_000_000);
    const meta = metaTags(html);
    const titleTag = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "";

    return {
      title: firstMeta(meta, "og:title", "twitter:title") || decodeHtml(titleTag),
      description: firstMeta(meta, "og:description", "twitter:description", "description"),
      author: firstMeta(meta, "article:author", "og:article:author", "twitter:creator", "author"),
      image: safeHttpsImage(firstMeta(meta, "og:image:secure_url", "og:image", "twitter:image")),
      publishedAt: firstMeta(meta, "article:published_time", "date", "datepublished"),
    };
  } catch {
    return {};
  } finally {
    clearTimeout(timeout);
  }
}
