// Fades a sheet's scrollable content into its own background at the top and
// bottom edges, so content sliding past those edges thins out instead of
// hard-cutting. Render as a sibling of the scrollable element, inside a
// `relative` ancestor sized to match it — these overlays are absolutely
// positioned against that ancestor, not the scrollable element itself, so
// they stay put while the content scrolls beneath them.
//
// showTop/showBottom should reflect whether the scrollable element is
// actually scrolled away from that edge (see useScrollEdges) — a fade
// rendered while there's nothing left to scroll to just tints whatever sits
// flush against that edge (a card, a button) for no reason.
export default function SheetScrollFade({
  color = "var(--color-card)",
  showTop = true,
  showBottom = true,
}: {
  color?: string;
  showTop?: boolean;
  showBottom?: boolean;
}) {
  return (
    <>
      {showTop && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-20 h-8 transition-opacity duration-150 ease-out"
          style={{
            background: `linear-gradient(to bottom, ${color} 0%, color-mix(in srgb, ${color} 60%, transparent) 45%, transparent 100%)`,
          }}
          aria-hidden
        />
      )}
      {showBottom && (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-20 transition-opacity duration-150 ease-out"
          style={{
            background: `linear-gradient(to top, ${color} 0%, color-mix(in srgb, ${color} 70%, transparent) 40%, color-mix(in srgb, ${color} 25%, transparent) 75%, transparent 100%)`,
          }}
          aria-hidden
        />
      )}
    </>
  );
}
