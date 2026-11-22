"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons/faArrowUpRightFromSquare";
import Image from "next/image";
import { useState } from "react";
import { PlatformMark } from "@/components/platform-mark";
import { usePreferences } from "@/components/preferences-provider";
import type { Locale } from "@/lib/i18n-config";
import type { ArchivePost } from "@/lib/post-types";

const dateFormatters = new Map<Locale, Intl.DateTimeFormat>();

function initials(author: string): string {
  const parts = author.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "H";
  if (parts.length === 1) return Array.from(parts[0]).slice(0, 2).join("").toUpperCase();
  return `${Array.from(parts[0])[0]}${Array.from(parts.at(-1) || "")[0]}`.toUpperCase();
}

function formattedDate(value: string, locale: Locale, fallback: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf()) || date.valueOf() === 0) return fallback;

  let formatter = dateFormatters.get(locale);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
    dateFormatters.set(locale, formatter);
  }
  return formatter.format(date);
}

function formatMessage(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match);
}

export function ArchiveCard({ post, priority = false }: { post: ArchivePost; priority?: boolean }) {
  const { locale, messages } = usePreferences();
  const [imageFailed, setImageFailed] = useState(false);
  const mediaVisible = Boolean(post.imageUrl) && !imageFailed;
  const platformAccent = post.platform.id === "x" ? "var(--ink)" : post.platform.accent;
  const route = new URLSearchParams({ url: post.originalUrl });
  if (post.snapshotUrl) route.set("snapshot", post.snapshotUrl);

  return (
    <a
      className={`archive-card${mediaVisible ? "" : " archive-card--text-only"}`}
      href={`/go?${route.toString()}`}
      style={{ "--platform-accent": platformAccent } as React.CSSProperties}
      aria-label={formatMessage(messages.card.openOn, {
        title: post.title,
        platform: post.platform.label,
      })}
    >
      <div className="card-platform">
        <PlatformMark platform={post.platform} />
        <span>{post.platform.label}</span>
      </div>

      <div className="card-author">
        <span className="avatar" aria-hidden="true">
          {initials(post.author)}
        </span>
        <span className="author-copy">
          <strong>{post.author}</strong>
          <span>{post.handle}</span>
        </span>
      </div>

      <div className="card-copy">
        <h2>{post.title}</h2>
        {post.description ? <p>{post.description}</p> : null}
      </div>

      {mediaVisible ? (
        <div className="card-media">
          <Image
            src={post.imageUrl!}
            alt=""
            fill
            unoptimized
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            sizes="(min-width: 1200px) 19vw, (min-width: 900px) 24vw, (min-width: 640px) 33vw, 100vw"
            onError={() => setImageFailed(true)}
          />
        </div>
      ) : (
        <div className="card-text-space" aria-hidden="true" />
      )}

      <div className="card-footer">
        <time dateTime={post.publishedAt}>
          {formattedDate(post.publishedAt, locale, messages.card.savedPost)}
        </time>
        <span className="open-icon" aria-hidden="true">
          <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
        </span>
      </div>
    </a>
  );
}
