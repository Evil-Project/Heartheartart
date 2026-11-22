"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleHalfStroke } from "@fortawesome/free-solid-svg-icons/faCircleHalfStroke";
import { faGlobe } from "@fortawesome/free-solid-svg-icons/faGlobe";
import { faMoon } from "@fortawesome/free-solid-svg-icons/faMoon";
import { faSun } from "@fortawesome/free-solid-svg-icons/faSun";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { usePreferences } from "@/components/preferences-provider";
import {
  LOCALE_COOKIE,
  LOCALE_OPTIONS,
  THEME_COOKIE,
  type Locale,
  type Theme,
} from "@/lib/i18n-config";

const COOKIE_LIFETIME_SECONDS = 60 * 60 * 24 * 365;

function savePreference(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${COOKIE_LIFETIME_SECONDS}; SameSite=Lax`;
}

export function SiteHeader() {
  const router = useRouter();
  const { initialTheme, locale, messages } = usePreferences();
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(initialTheme);
  const [systemDark, setSystemDark] = useState<boolean | null>(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const updateSystemTheme = () => setSystemDark(media.matches);
    updateSystemTheme();
    media.addEventListener("change", updateSystemTheme);
    return () => media.removeEventListener("change", updateSystemTheme);
  }, []);

  const darkMode = selectedTheme ? selectedTheme === "dark" : systemDark === true;
  const themeTitle = darkMode ? messages.switchToLight : messages.switchToDark;
  const themeIcon =
    systemDark === null && selectedTheme === null ? faCircleHalfStroke : darkMode ? faSun : faMoon;

  function changeLanguage(nextLocale: Locale) {
    savePreference(LOCALE_COOKIE, nextLocale);
    document.documentElement.lang = nextLocale;
    router.refresh();
  }

  function toggleTheme() {
    const currentDark = selectedTheme
      ? selectedTheme === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    const nextTheme: Theme = currentDark ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    savePreference(THEME_COOKIE, nextTheme);
    setSelectedTheme(nextTheme);
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="header-brand">
          <Link href="/" className="wordmark" aria-label="Heartheartart home">
            Heartheartart
          </Link>
          <p className="header-tagline">{messages.description}</p>
        </div>

        <div className="header-actions" role="group" aria-label={messages.preferencesLabel}>
          <label className="language-control">
            <span className="sr-only">{messages.languageLabel}</span>
            <FontAwesomeIcon icon={faGlobe} aria-hidden="true" />
            <select
              value={locale}
              aria-label={messages.languageLabel}
              onChange={(event) => changeLanguage(event.target.value as Locale)}
            >
              {LOCALE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <button
            className="theme-toggle"
            type="button"
            aria-label={messages.toggleTheme}
            title={themeTitle}
            onClick={toggleTheme}
          >
            <FontAwesomeIcon icon={themeIcon} aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}
