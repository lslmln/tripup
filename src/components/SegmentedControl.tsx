"use client";

import { useState } from "react";

const TABS = ["Timeline", "Balance", "Transactions"];

export default function SegmentedControl() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="relative mx-4 flex rounded-full bg-card p-1">
      <div
        className="absolute inset-y-1 left-1 rounded-full bg-card-light transition-transform duration-200 ease-out"
        style={{
          width: `calc((100% - 8px) / ${TABS.length})`,
          transform: `translateX(${activeIndex * 100}%)`,
        }}
      />
      {TABS.map((tab, i) => (
        <button
          key={tab}
          type="button"
          onClick={() => setActiveIndex(i)}
          className={`relative z-10 flex-1 rounded-full py-2 text-center font-karla text-subtitle font-medium transition-colors duration-150 ${
            activeIndex === i ? "text-content-primary" : "text-content-secondary"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
