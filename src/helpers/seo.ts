import type { Metadata } from "next";
import { SITE } from "@/helpers/site";

/**
 * Next shallow-merges metadata, so a page that sets `openGraph` replaces the
 * layout's object entirely. Pages spread this base and add their own `url`.
 */
export const baseOpenGraph = {
  type: "website",
  siteName: SITE.name,
  locale: "en_US",
  title: `${SITE.name} — ${SITE.tagline}`,
  description: SITE.description,
} satisfies Metadata["openGraph"];

/**
 * The root segment's opengraph-image.png, for pages that set their own
 * `openGraph` or `twitter` objects and would otherwise lose the inherited one.
 */
export const socialImage = {
  url: "/opengraph-image.png",
  width: 1280,
  height: 640,
  alt: 'Plan It logo and the tagline "Think it through. Then build it." beside a three-column Kanban board.',
};

export function homeJsonLd() {
  const logo = `${SITE.url}/icon-512.png`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE.url}/#website`,
        name: SITE.name,
        url: SITE.url,
        description: SITE.description,
        publisher: { "@id": `${SITE.url}/#organization` },
      },
      {
        "@type": "Organization",
        "@id": `${SITE.url}/#organization`,
        name: SITE.name,
        url: SITE.url,
        logo: { "@type": "ImageObject", url: logo, width: 512, height: 512 },
        sameAs: [SITE.repo],
      },
      {
        "@type": "SoftwareApplication",
        name: SITE.name,
        url: SITE.url,
        description: SITE.description,
        image: `${SITE.url}/opengraph-image.png`,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        isAccessibleForFree: true,
        license: "https://opensource.org/licenses/MIT",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        publisher: { "@id": `${SITE.url}/#organization` },
      },
    ],
  };
}

/** Serializes JSON-LD for a script tag, escaping `<` so data can never close it. */
export function jsonLdScript(data: object) {
  return JSON.stringify(data).replace(/</g, "\u003c");
}
