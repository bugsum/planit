import type { Metadata } from "next";
import { MapView } from "@/components/mindmap/MapView";

// Maps live in the visitor's own browser; their URLs mean nothing to a crawler.
export const metadata: Metadata = {
  title: "Mindmap",
  robots: { index: false, follow: true },
};

export default async function MapPage({ params }: PageProps<"/mindmap/[mapId]">) {
  const { mapId } = await params;
  // Keyed by map so switching maps starts fresh (selection, zoom).
  return <MapView key={mapId} mapId={mapId} />;
}
