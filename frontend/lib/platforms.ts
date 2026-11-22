export type PlatformId =
  | "x"
  | "instagram"
  | "discord"
  | "pixiv"
  | "bilibili"
  | "lofter"
  | "rednote"
  | "qq-channel"
  | "qq-group"
  | "web";

export type Platform = {
  id: PlatformId;
  label: string;
  accent: string;
};

const platforms: Record<PlatformId, Platform> = {
  x: { id: "x", label: "X (Twitter)", accent: "#0a0a0a" },
  instagram: {
    id: "instagram",
    label: "Instagram",
    accent: "#d62976",
  },
  discord: {
    id: "discord",
    label: "Discord",
    accent: "#5865f2",
  },
  pixiv: { id: "pixiv", label: "Pixiv", accent: "#0096fa" },
  bilibili: {
    id: "bilibili",
    label: "Bilibili",
    accent: "#fb7299",
  },
  lofter: {
    id: "lofter",
    label: "LOFTER",
    accent: "#00a79d",
  },
  rednote: {
    id: "rednote",
    label: "Rednote",
    accent: "#ff2442",
  },
  "qq-channel": {
    id: "qq-channel",
    label: "QQ Channel",
    accent: "#12b7f5",
  },
  "qq-group": {
    id: "qq-group",
    label: "QQ Group",
    accent: "#1687f8",
  },
  web: { id: "web", label: "Web", accent: "#666666" },
};

const detectors: Array<(host: string, path: string) => PlatformId | null> = [
  (host) =>
    host === "x.com" || host.endsWith(".x.com") || host.endsWith("twitter.com") ? "x" : null,
  (host) => (host.endsWith("instagram.com") ? "instagram" : null),
  (host) => (host === "discord.gg" || host.endsWith("discord.com") ? "discord" : null),
  (host) =>
    host.endsWith("pixiv.net") || host === "pximg.net" || host.endsWith(".pximg.net") ? "pixiv" : null,
  (host) => (host.endsWith("bilibili.com") || host === "b23.tv" ? "bilibili" : null),
  (host) => (host.endsWith("lofter.com") ? "lofter" : null),
  (host) => (host.endsWith("xiaohongshu.com") || host === "xhslink.com" ? "rednote" : null),
  (host, path) =>
    host === "qun.qq.com" || host === "qm.qq.com" || host === "jq.qq.com" || path.includes("/group")
      ? "qq-group"
      : null,
  (host) => (host.endsWith("qq.com") ? "qq-channel" : null),
];

export function detectPlatform(input: string): Platform {
  let host = "";
  let path = "";

  try {
    const url = new URL(input);
    host = url.hostname.toLowerCase().replace(/^www\./, "");
    path = url.pathname.toLowerCase();
  } catch {
    return platforms.web;
  }

  for (const detect of detectors) {
    const id = detect(host, path);
    if (id) return platforms[id];
  }
  return platforms.web;
}
