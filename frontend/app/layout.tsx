import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PreferencesProvider } from "@/components/preferences-provider";
import { SiteHeader } from "@/components/site-header";
import { getMessages } from "@/lib/messages";
import { getRequestPreferences } from "@/lib/request-preferences";
import "./globals.css";

config.autoAddCss = false;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getRequestPreferences();
  return {
    title: "Heartheartart",
    description: getMessages(locale).description,
  };
}

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0c0f" },
  ],
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { locale, theme } = await getRequestPreferences();
  const messages = getMessages(locale);

  return (
    <html
      lang={locale}
      data-theme={theme ?? undefined}
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body>
        <PreferencesProvider locale={locale} messages={messages} initialTheme={theme}>
          <SiteHeader />
          {children}
        </PreferencesProvider>
      </body>
    </html>
  );
}
