import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppOverlays } from "@/components/app/AppOverlays";
import { TopBar } from "@/components/app/TopBar";
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
  title: {
    default: `${SITE.name} — plan before you build`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
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
