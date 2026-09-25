import type { MetadataRoute } from "next";
import { SITE } from "@/helpers/site";

// Individual boards live in each visitor's browser, so only public pages are listed.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE.url, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE.url}/kanban`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE.url}/mindmap`, changeFrequency: "monthly", priority: 0.8 },
  ];
}
