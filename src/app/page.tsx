import type { Metadata } from "next";
import { Closing } from "@/components/home/Closing";
import { Features } from "@/components/home/Features";
import { Hero } from "@/components/home/Hero";
import { KeyboardShowcase } from "@/components/home/KeyboardShowcase";
import { Planners } from "@/components/home/Planners";
import { Principles } from "@/components/home/Principles";
import { baseOpenGraph, homeJsonLd, jsonLdScript } from "@/helpers/seo";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { ...baseOpenGraph, url: "/" },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(homeJsonLd()) }}
      />
      <Hero />
      <Principles />
      <Features />
      <KeyboardShowcase />
      <Planners />
      <Closing />
    </>
  );
}
