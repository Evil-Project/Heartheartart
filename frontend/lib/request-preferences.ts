import "server-only";

import { cache } from "react";
import { cookies, headers } from "next/headers";
import {
  LOCALE_COOKIE,
  matchLocale,
  resolveTheme,
  THEME_COOKIE,
  type Locale,
  type Theme,
} from "@/lib/i18n-config";

function localeFromAcceptLanguage(value: string | null): Locale {
  if (!value) return "en";

  const preferences = value
    .split(",")
    .map((entry, index) => {
      const [tag, ...parameters] = entry.trim().split(";");
      const quality = parameters
        .map((parameter) => parameter.trim().match(/^q=([\d.]+)$/i)?.[1])
        .find(Boolean);
      return { tag, quality: quality ? Number.parseFloat(quality) : 1, index };
    })
    .sort((a, b) => b.quality - a.quality || a.index - b.index);

  for (const preference of preferences) {
    const locale = matchLocale(preference.tag);
    if (locale) return locale;
  }
  return "en";
}

export const getRequestPreferences = cache(
  async (): Promise<{ locale: Locale; theme: Theme | null }> => {
    const cookieStore = await cookies();
    const cookieLocale = matchLocale(cookieStore.get(LOCALE_COOKIE)?.value);
    const theme = resolveTheme(cookieStore.get(THEME_COOKIE)?.value);

    if (cookieLocale) return { locale: cookieLocale, theme };

    const requestHeaders = await headers();
    return {
      locale: localeFromAcceptLanguage(requestHeaders.get("accept-language")),
      theme,
    };
  },
);
