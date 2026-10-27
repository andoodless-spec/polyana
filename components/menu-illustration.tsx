"use client";
import { CuratedArt } from "@/components/curated-art";
export default function MenuIllustration({
  value = "flowers",
}: {
  value?: string;
}) {
  return (
    <div className="menu-illustration curated-menu-illustration">
      <CuratedArt slot="menuArt" value={value} className="curated-small-art" />
    </div>
  );
}
