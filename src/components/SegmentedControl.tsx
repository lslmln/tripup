"use client";

import { useLayoutEffect, useRef, useState } from "react";

const TABS = ["Timeline", "Balance", "Transactions"];
const DURATION_MS = 200;
const EASE = "cubic-bezier(0.25, 0.1, 0.25, 1)";

// Same imperative snap -> forced reflow -> animate technique as
// PageTransition.tsx. A declarative `transition-transform` utility class
// reported all the right computed values (duration, property, easing) but
// never visually interpolated in this environment — confirmed by slowing
// the duration to 2s and still seeing the pill fully settled in the very
// first screenshot after the click. This imperative approach is the one
// proven (by the user actually seeing real motion during the page
// transition) to produce visible animation here.
export default function SegmentedControl() {
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
    <div className="relative mx-4 flex rounded-full bg-card p-1">
      <div
        ref={pillRef}
        className="absolute inset-y-1 left-1 rounded-full bg-card-light"
        style={{
          width: `calc((100% - 8px) / ${TABS.length})`,
          transform: "translateX(0%)",
        }}
      />
      {TABS.map((tab, i) => (
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
