"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Locale, Messages, Theme } from "@/lib/i18n-config";

type Preferences = {
  locale: Locale;
  messages: Messages;
  initialTheme: Theme | null;
};

const PreferencesContext = createContext<Preferences | null>(null);

export function PreferencesProvider({
  children,
  locale,
  messages,
  initialTheme,
}: Preferences & { children: ReactNode }) {
  const value = useMemo(
    () => ({ locale, messages, initialTheme }),
    [initialTheme, locale, messages],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences(): Preferences {
  const preferences = useContext(PreferencesContext);
  if (!preferences) throw new Error("usePreferences must be used inside PreferencesProvider.");
  return preferences;
}
