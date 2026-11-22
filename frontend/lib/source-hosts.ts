export const ARCHIVE_SOURCE_HOSTS = [
  "x.com",
  "twitter.com",
  "instagram.com",
  "discord.com",
  "discord.gg",
  "pixiv.net",
  "bilibili.com",
  "b23.tv",
  "lofter.com",
  "xiaohongshu.com",
  "xhslink.com",
  "qq.com",
];

export function isArchiveSourceHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return ARCHIVE_SOURCE_HOSTS.some((domain) => host === domain || host.endsWith(`.${domain}`));
}
