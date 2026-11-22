import type { Platform } from "@/lib/platforms";

export type DatabasePost = {
  id?: string | number | null;
  link?: string | null;
  title?: string | null;
  description?: string | null;
  author?: string | null;
  screenshot?: string | null;
  timestamp?: string | number | null;
  image?: string | null;
  previewOnly?: boolean;
};

export type ArchivePost = {
  id: string;
  originalUrl: string;
  snapshotUrl: string | null;
  title: string;
  description: string;
  author: string;
  handle: string;
  imageUrl: string | null;
  publishedAt: string;
  platform: Platform;
};
