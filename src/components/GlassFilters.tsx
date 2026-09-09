// Defines the SVG filter used by the "glass" material (see glass.ts) to fake
// real refraction/distortion of the content behind glass elements, the way
// Apple's native Liquid Glass bends what's behind it. Render this once,
// anywhere in the document — filters are referenced globally by id.
export default function GlassFilters() {
  return (
    <svg aria-hidden className="absolute h-0 w-0 overflow-hidden">
      <filter
        id="glass-distortion"
        x="-20%"
        y="-20%"
        width="140%"
        height="140%"
      >
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.012 0.018"
          numOctaves="2"
          seed="7"
          result="noise"
        />
        <feGaussianBlur in="noise" stdDeviation="3" result="softNoise" />
        <feDisplacementMap
          in="SourceGraphic"
          in2="softNoise"
          scale="22"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </svg>
  );
}
