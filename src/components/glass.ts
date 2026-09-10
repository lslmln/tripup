import type { CSSProperties } from "react";

// Shared "Liquid Glass" material styling used by GlassButton and GlassSearchBar.
export const glassStyle: CSSProperties = {
  background: "var(--color-glass-fill)",
  border: "1px solid var(--color-glass-border)",
  boxShadow:
    "inset 0 1px 0 var(--color-glass-highlight), inset 0 -1px 3px rgba(0,0,0,0.35)",
  backdropFilter: "blur(20px) brightness(0.7)",
  WebkitBackdropFilter: "blur(20px) brightness(0.7)",
};

// Same material, but attempts to refract/distort the content behind it via
// the SVG filter in GlassFilters.tsx, approximating Apple's real Liquid Glass
// edge lensing instead of a flat blur.
// NOTE: tested in Chromium and it silently drops the url() filter, keeping
// only the blur() — no visible distortion. Not currently used anywhere; kept
// in case it renders in Safari/Firefox, where backdrop-filter + SVG filter
// support differs.
export const glassDistortionStyle: CSSProperties = {
  ...glassStyle,
  backdropFilter: "url(#glass-distortion) blur(4px)",
  WebkitBackdropFilter: "blur(4px)",
};
