"use client";

import { useLayoutEffect, useRef } from "react";
import { CaretLeft } from "@phosphor-icons/react";
import GlassButton from "./GlassButton";

const ITEM_HEIGHT = 40;
const WHEEL_HEIGHT = 200;
// Top/bottom padding so the first and last items can still scroll to center.
const WHEEL_PADDING = (WHEEL_HEIGHT - ITEM_HEIGHT) / 2;
const SETTLE_MS = 120;

// Fixed sub-widths so every row's number sits at the same x position
// regardless of digit count (0 vs 23), and the unit label starts at a
// consistent x right after it — this is what makes the column read as a
// straight line instead of each row centering independently.
const NUMBER_WIDTH = 32;
const UNIT_WIDTH = 56;
const COLUMN_WIDTH = NUMBER_WIDTH + UNIT_WIDTH;

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

function WheelColumn({
  values,
  selected,
  unit,
  onChange,
}: {
  values: number[];
  selected: number;
  unit: string;
  onChange: (value: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const settleTimeout = useRef<number | null>(null);

  // Only ever snap to the initial value on mount — subsequent scrolling
  // drives `selected` via onChange, not the other way around, so the wheel
  // stays interruptible (a mid-scroll re-render never fights the user's hand).
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.scrollTop = values.indexOf(selected) * ITEM_HEIGHT;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleScroll() {
    const el = ref.current;
    if (!el) return;
    if (settleTimeout.current) window.clearTimeout(settleTimeout.current);
    settleTimeout.current = window.setTimeout(() => {
      const index = Math.min(
        Math.max(Math.round(el.scrollTop / ITEM_HEIGHT), 0),
        values.length - 1,
      );
      el.scrollTo({ top: index * ITEM_HEIGHT, behavior: "smooth" });
      const value = values[index];
      if (value !== selected) onChange(value);
    }, SETTLE_MS);
  }

  return (
    <div
      ref={ref}
      onScroll={handleScroll}
      className="no-scrollbar snap-y snap-mandatory overflow-y-scroll"
      style={{ height: WHEEL_HEIGHT, width: COLUMN_WIDTH, paddingBlock: WHEEL_PADDING }}
    >
      {values.map((value) => {
        const isSelected = value === selected;
        return (
          <div
            key={value}
            className="flex snap-center items-center font-karla text-header"
            style={{ height: ITEM_HEIGHT }}
          >
            <span
              className={isSelected ? "text-content-primary" : "text-content-secondary"}
              style={{ width: NUMBER_WIDTH, textAlign: "right" }}
            >
              {value}
            </span>
            <span
              className="font-karla text-subtitle text-content-secondary"
              style={{ width: UNIT_WIDTH, textAlign: "left", paddingLeft: 6 }}
            >
              {isSelected ? unit : ""}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function DurationPickerPanel({
  minutes,
  onChange,
  onBack,
}: {
  minutes: number;
  onChange: (minutes: number) => void;
  onBack: () => void;
}) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return (
    <>
      <div className="flex items-center justify-between px-4">
        <GlassButton ariaLabel="Back" onClick={onBack}>
          <CaretLeft size={22} />
        </GlassButton>
        <span className="font-karla text-body font-medium text-content-primary">
          Duration
        </span>
        <div className="h-11 w-11 shrink-0" aria-hidden />
      </div>

      <div className="relative mt-4 px-4">
        <div
          className="pointer-events-none absolute inset-x-4 top-1/2 -translate-y-1/2 rounded-card bg-card-light"
          style={{ height: ITEM_HEIGHT }}
          aria-hidden
        />
        <div className="relative flex items-center justify-center">
          <WheelColumn
            values={HOURS}
            selected={hours}
            unit="hours"
            onChange={(h) => onChange(h * 60 + mins)}
          />
          <WheelColumn
            values={MINUTES}
            selected={mins}
            unit="min"
            onChange={(m) => onChange(hours * 60 + m)}
          />
        </div>
      </div>
    </>
  );
}
