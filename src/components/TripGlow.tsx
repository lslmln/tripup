const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

// Hero glow for a trip detail screen — colors sampled from the trip's own
// photo (for Lisbon: river/sky blue + terracotta rooftops), tuned to read
// more obviously than the home screen's subtle GradientGlow.
export default function TripGlow() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-[340px] overflow-hidden bg-background-detail">
      <div
        className="absolute -left-20 -top-20 h-72 w-72 rounded-full blur-[80px]"
        style={{ background: "var(--color-glow-blue)", opacity: 0.9 }}
      />
      <div
        className="absolute right-0 -top-24 h-64 w-64 rounded-full blur-[80px]"
        style={{ background: "var(--color-glow-blue)", opacity: 0.7 }}
      />
      <div
        className="absolute left-1/3 top-16 h-56 w-56 rounded-full blur-[75px]"
        style={{ background: "var(--color-glow-warm)", opacity: 0.6 }}
      />

      <div
        className="absolute inset-0 opacity-[0.12] mix-blend-overlay"
        style={{ backgroundImage: NOISE }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background-detail/70 to-background-detail" />
    </div>
  );
}
