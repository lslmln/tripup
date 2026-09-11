// Fades a sheet's scrollable content into its own background at the top and
// bottom edges, so content sliding past those edges thins out instead of
// hard-cutting. Render as a sibling of the scrollable element, inside a
// `relative` ancestor sized to match it — these overlays are absolutely
// positioned against that ancestor, not the scrollable element itself, so
// they stay put while the content scrolls beneath them.
export default function SheetScrollFade({ color = "var(--color-card)" }: { color?: string }) {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-3"
        style={{
          background: `linear-gradient(to bottom, color-mix(in srgb, ${color} 25%, transparent) 0%, transparent 100%)`,
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-20"
        style={{
          background: `linear-gradient(to top, ${color} 0%, color-mix(in srgb, ${color} 70%, transparent) 40%, color-mix(in srgb, ${color} 25%, transparent) 75%, transparent 100%)`,
        }}
        aria-hidden
      />
    </>
  );
}
