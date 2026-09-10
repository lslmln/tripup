"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { glassStyle } from "./glass";

const DEFAULT_TABS = ["Timeline", "Balance", "Transactions"];
const DURATION_MS = 300;
// A "back ease-out" with a touch of overshoot — closer to the springy snap
// of a real iOS segmented control than a plain ease-in-out, and strong
// enough at the start to read as a real slide rather than a snap.
const EASE = "cubic-bezier(0.34, 1.56, 0.64, 1)";

// Same imperative snap -> forced reflow -> animate technique as
// PageTransition.tsx. A declarative `transition-transform` utility class
// reported all the right computed values (duration, property, easing) but
// never visually interpolated in this environment — confirmed by slowing
// the duration to 2s and still seeing the pill fully settled in the very
// first screenshot after the click. This imperative approach is the one
// proven (by the user actually seeing real motion during the page
// transition) to produce visible animation here.
export default function SegmentedControl({ tabs = DEFAULT_TABS }: { tabs?: string[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const pillRef = useRef<HTMLDivElement>(null);
  const prevIndex = useRef(0);

  useLayoutEffect(() => {
    const el = pillRef.current;
    const from = prevIndex.current;
    prevIndex.current = activeIndex;
    if (!el || from === activeIndex) return;

    el.style.transition = "none";
    el.style.transform = `translateX(${from * 100}%)`;
    void el.offsetHeight;
    el.style.transition = `transform ${DURATION_MS}ms ${EASE}`;
    el.style.transform = `translateX(${activeIndex * 100}%)`;
  }, [activeIndex]);

  return (
    <div className="relative mx-4 flex rounded-full p-1" style={glassStyle}>
      <div
        ref={pillRef}
        className="absolute inset-y-1 left-1 rounded-full"
        style={{
          width: `calc((100% - 8px) / ${tabs.length})`,
          transform: "translateX(0%)",
          background: "rgba(255, 255, 255, 0.18)",
          boxShadow:
            "0 1px 4px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      />
      {tabs.map((tab, i) => (
        <button
          key={tab}
          type="button"
          onClick={() => setActiveIndex(i)}
          className={`relative z-10 flex-1 rounded-full py-2 text-center font-karla text-subtitle font-medium transition-colors duration-150 ${
            activeIndex === i
              ? "text-content-primary"
              : "text-content-secondary"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
