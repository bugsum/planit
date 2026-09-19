import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppOverlays } from "@/components/app/AppOverlays";
import { TopBar } from "@/components/app/TopBar";
import { baseOpenGraph } from "@/helpers/seo";
import { SITE } from "@/helpers/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: SITE.keywords,
  category: "productivity",
  appleWebApp: { title: SITE.name, statusBarStyle: "black-translucent" },
  openGraph: baseOpenGraph,
  twitter: {
    card: "summary_large_image",
    title: baseOpenGraph.title,
    description: SITE.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

export const viewport: Viewport = {
  themeColor: SITE.canvasColor,
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-canvas font-sans text-zinc-100">
        <TopBar />
        <main className="flex min-h-0 flex-1 flex-col">{children}</main>
        <AppOverlays />
      </body>
    </html>
  );
}
