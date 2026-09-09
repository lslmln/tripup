const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export default function GradientGlow() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-[340px] overflow-hidden bg-black">
      <div className="absolute -left-24 -top-16 h-64 w-64 rounded-full bg-blue-500/70 blur-[85px]" />
      <div className="absolute left-16 -top-28 h-72 w-72 rounded-full bg-violet-600/80 blur-[85px]" />
      <div className="absolute -right-16 -top-20 h-72 w-72 rounded-full bg-fuchsia-500/70 blur-[85px]" />
      <div className="absolute right-0 top-24 h-48 w-48 rounded-full bg-pink-500/60 blur-[70px]" />
      <div className="absolute left-1/3 top-20 h-40 w-40 rounded-full bg-indigo-400/50 blur-[70px]" />

      {/* Grain texture for a less flat, more premium gradient */}
      <div
        className="absolute inset-0 opacity-[0.12] mix-blend-overlay"
        style={{ backgroundImage: NOISE }}
      />

      {/* Fade the glow into solid black toward the bottom of this band */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/70 to-black" />
    </div>
  );
}
