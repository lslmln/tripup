"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

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
// A poll needs some time to actually run, so 0 hours + 0 min can't be a
// reachable combination — while hours reads 0 the minutes wheel simply
// doesn't offer 0 as an option, same as an iOS timer picker.
const MINUTES_WHEN_NO_HOURS = MINUTES.slice(1);

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
  const drag = useRef<{ startY: number; startScrollTop: number } | null>(null);

  // Only ever snap to the initial value on mount — subsequent scrolling
  // drives `selected` via onChange, not the other way around, so the wheel
  // stays interruptible (a mid-scroll re-render never fights the user's hand).
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.scrollTop = values.indexOf(selected) * ITEM_HEIGHT;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Matches TouchScroll: only a drag moves the wheel, like the iOS
  // Simulator — the mouse wheel does nothing, you have to grab it.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const blockWheel = (e: WheelEvent) => e.preventDefault();
    el.addEventListener("wheel", blockWheel, { passive: false });
    return () => el.removeEventListener("wheel", blockWheel);
  }, []);

  function onPointerDown(e: React.PointerEvent) {
    if (!ref.current) return;
    drag.current = { startY: e.clientY, startScrollTop: ref.current.scrollTop };
    // Columns are narrow, so a normal drag drifts outside their bounds
    // almost immediately. Without capture, pointermove then routes to
    // whatever's under the finger instead of this column, killing the
    // drag — capturing keeps every subsequent move/up event targeted here
    // regardless of where the pointer wanders, matching TouchScroll.
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current || !ref.current) return;
    const delta = e.clientY - drag.current.startY;
    ref.current.scrollTop = drag.current.startScrollTop - delta;
  }

  function endDrag(e: React.PointerEvent) {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    drag.current = null;
  }

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
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      className="no-scrollbar snap-y snap-mandatory overflow-y-scroll"
      style={{
        height: WHEEL_HEIGHT,
        width: COLUMN_WIDTH,
        paddingBlock: WHEEL_PADDING,
        touchAction: "none",
      }}
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
}: {
  minutes: number;
  onChange: (minutes: number) => void;
}) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const minuteValues = hours === 0 ? MINUTES_WHEN_NO_HOURS : MINUTES;

  function handleHoursChange(h: number) {
    // Crossing into 0 hours while minutes is also sitting at 0 would land on
    // the disallowed 0-total combination — bump minutes up to the wheel's
    // new floor (1) in the same update instead.
    onChange(h * 60 + (h === 0 && mins === 0 ? 1 : mins));
  }

  return (
    <>
      <p className="text-center font-karla text-body font-medium text-content-primary">
        Duration
      </p>

      <div className="relative mt-4 px-4">
        <div
          className="pointer-events-none absolute inset-x-4 top-1/2 -translate-y-1/2 rounded-card bg-card-light"
          style={{ height: ITEM_HEIGHT }}
          aria-hidden
        />
        <div className="relative flex items-center justify-center">
          <WheelColumn values={HOURS} selected={hours} unit="hours" onChange={handleHoursChange} />
          {/* Keyed on whether 0 is currently offered, so the wheel remounts
              (and re-syncs its scroll position from `selected`) exactly when
              its own value set changes, instead of drifting out of sync with
              a list that changed size under it mid-scroll. */}
          <WheelColumn
            key={hours === 0 ? "min-no-zero" : "min-full"}
            values={minuteValues}
            selected={mins}
            unit="min"
            onChange={(m) => onChange(hours * 60 + m)}
          />
        </div>
      </div>
    </>
  );
}
