"use client";
import React from "react";
import { ForestDetail, Meadow } from "@/app/art";

export function CuratedArt({
  slot,
  className = "",
}: {
  slot: string;
  value?: string;
  className?: string;
}) {
  if (slot === "headerArt") return <Meadow className={className} />;
  if (slot === "shoppingArt")
    return <ForestDetail kind="fern" className={className} />;
  return <ForestDetail kind="flowers" className={className} />;
}

export function faviconData() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#e9eddf"/><path d="M31 53V29h6v24z" fill="#617b5c"/><path d="M32 32C12 32 10 17 12 10c16 0 24 7 22 20C37 15 47 10 56 11c0 15-7 24-22 24" fill="#9eae88"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
