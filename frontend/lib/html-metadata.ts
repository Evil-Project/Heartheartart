export function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function cleanTimestamp(value: unknown): string {
  if (typeof value === "number" && Number.isFinite(value)) {
    const milliseconds = value < 10_000_000_000 ? value * 1000 : value;
    return new Date(milliseconds).toISOString();
  }
  return clean(value);
}

export function decodeHtml(value: string): string {
  const named: Record<string, string> = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    quot: '"',
    nbsp: " ",
  };

  return value
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    )
    .replace(/&([a-z]+);/gi, (entity, name: string) => named[name.toLowerCase()] ?? entity)
    .replace(/\s+/g, " ")
    .trim();
}

export function metaTags(html: string): Map<string, string> {
  const output = new Map<string, string>();
  const tags = html.match(/<meta\s+[^>]*>/gi) ?? [];

  for (const tag of tags) {
    const attrs = new Map<string, string>();
    const attributePattern = /([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g;
    let match: RegExpExecArray | null;

    while ((match = attributePattern.exec(tag))) {
      attrs.set(match[1].toLowerCase(), decodeHtml(match[2] ?? match[3] ?? match[4] ?? ""));
    }

    const key = attrs.get("property") || attrs.get("name");
    const content = attrs.get("content");
    if (key && content) output.set(key.toLowerCase(), content);
  }

  return output;
}

export function firstMeta(meta: Map<string, string>, ...keys: string[]): string {
  for (const key of keys) {
    const value = clean(meta.get(key));
    if (value) return value;
  }
  return "";
}

export function safeHttpsImage(input: string): string {
  try {
    const url = new URL(input);
    return url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}
