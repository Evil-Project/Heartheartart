export const LOCALE_COOKIE = "heartheartart_locale";
export const THEME_COOKIE = "heartheartart_theme";

export const SUPPORTED_LOCALES = ["en", "zh-CN", "zh-TW", "ja", "ko", "es"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];
export type Theme = "light" | "dark";

export type CardMessages = {
  savedPost: string;
  openOn: string;
  untitledPost: string;
  discordContext: string;
  channelPost: string;
  groupPost: string;
};

export type Messages = {
  description: string;
  languageLabel: string;
  preferencesLabel: string;
  toggleTheme: string;
  switchToLight: string;
  switchToDark: string;
  emptyTitle: string;
  emptyDescription: string;
  errorTitle: string;
  tryAgain: string;
  card: CardMessages;
};

export const LOCALE_OPTIONS: ReadonlyArray<{ value: Locale; label: string }> = [
  { value: "en", label: "English" },
  { value: "zh-CN", label: "简体中文" },
  { value: "zh-TW", label: "繁體中文" },
  { value: "ja", label: "日本語" },
  { value: "ko", label: "한국어" },
  { value: "es", label: "Español" },
];

export function matchLocale(value: string | null | undefined): Locale | null {
  const normalized = value?.trim().toLowerCase().replaceAll("_", "-");
  if (!normalized) return null;

  if (
    normalized === "zh-tw" ||
    normalized.startsWith("zh-hant") ||
    normalized.startsWith("zh-hk") ||
    normalized.startsWith("zh-mo")
  ) {
    return "zh-TW";
  }
  if (normalized === "zh-cn" || normalized.startsWith("zh-hans") || normalized === "zh") {
    return "zh-CN";
  }
  if (normalized === "en" || normalized.startsWith("en-")) return "en";
  if (normalized === "ja" || normalized.startsWith("ja-")) return "ja";
  if (normalized === "ko" || normalized.startsWith("ko-")) return "ko";
  if (normalized === "es" || normalized.startsWith("es-")) return "es";
  return null;
}

export function resolveTheme(value: string | null | undefined): Theme | null {
  return value === "light" || value === "dark" ? value : null;
}
