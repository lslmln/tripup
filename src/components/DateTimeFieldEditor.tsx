"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";

const WEEKDAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTH_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const ITEM_HEIGHT = 40;
const WHEEL_HEIGHT = 200;
// Top/bottom padding so the first and last items can still scroll to center.
const WHEEL_PADDING = (WHEEL_HEIGHT - ITEM_HEIGHT) / 2;
const SETTLE_MS = 120;

const HOURS_12 = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES_5 = Array.from({ length: 12 }, (_, i) => i * 5);
const PERIODS: ("AM" | "PM")[] = ["AM", "PM"];

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// A vertical drag-to-scroll picker column, generic over the row values so it
// can drive the hour/minute/period wheels below. Mirrors DurationPickerPanel's
// WheelColumn (grab-and-drag like the iOS Simulator, snaps to the nearest row
// on release) rather than sharing it directly, since this one needs arbitrary
// value types and per-row rendering instead of a fixed number+unit layout.
function WheelColumn<T extends string | number>({
  values,
  selected,
  width,
  renderLabel,
  onChange,
}: {
  values: T[];
  selected: T;
  width: number;
  renderLabel: (value: T, isSelected: boolean) => React.ReactNode;
  onChange: (value: T) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const settleTimeout = useRef<number | null>(null);
  const drag = useRef<{ startY: number; startScrollTop: number } | null>(null);

  // Only ever snap to the initial value on mount — subsequent scrolling
  // drives `selected` via onChange, not the other way around, so the wheel
  // stays interruptible.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.scrollTop = Math.max(values.indexOf(selected), 0) * ITEM_HEIGHT;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    // Columns are only 40-56px wide, so a normal drag drifts outside their
    // bounds almost immediately. Without capture, pointermove then routes to
    // whatever's under the finger instead of this column, killing the drag —
    // capturing keeps every subsequent move/up event targeted here regardless
    // of where the pointer wanders, matching TouchScroll's approach.
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
      style={{ height: WHEEL_HEIGHT, width, paddingBlock: WHEEL_PADDING, touchAction: "none" }}
    >
      {values.map((value) => (
        <div
          key={value}
          className="flex snap-center items-center justify-center font-karla text-header"
          style={{ height: ITEM_HEIGHT }}
        >
          {renderLabel(value, value === selected)}
        </div>
      ))}
    </div>
  );
}

function CalendarGrid({
  month,
  selected,
  onPrevMonth,
  onNextMonth,
  onSelectDay,
}: {
  month: Date;
  selected: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDay: (day: Date) => void;
}) {
  const year = month.getFullYear();
  const m = month.getMonth();
  const firstWeekday = new Date(year, m, 1).getDay();
  const daysInMonth = new Date(year, m + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, m, i + 1)),
  ];

  return (
    <div className="px-4 pt-3 pb-4">
      <div className="flex items-center justify-between pb-3">
        <span className="font-karla text-body font-medium text-content-primary">
          {MONTH_LABELS[m]} {year}
        </span>
        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label="Previous month"
            onClick={onPrevMonth}
            className="text-content-secondary"
          >
            <CaretLeft size={16} weight="bold" />
          </button>
          <button
            type="button"
            aria-label="Next month"
            onClick={onNextMonth}
            className="text-content-secondary"
          >
            <CaretRight size={16} weight="bold" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label} className="font-karla text-[11px] font-medium text-content-secondary">
            {label}
          </span>
        ))}
        {cells.map((day, i) => (
          <div key={i} className="flex items-center justify-center py-1">
            {day && (
              <button
                type="button"
                onClick={() => onSelectDay(day)}
                className="flex h-9 w-9 items-center justify-center rounded-full font-karla text-body transition-colors duration-150 ease-out"
                style={
                  isSameDay(day, selected)
                    ? { background: "var(--color-brand)", color: "#fff" }
                    : { color: "var(--color-content-primary)" }
                }
              >
                {day.getDate()}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function TimeWheels({
  hour12,
  minute5,
  period,
  onChangeHour,
  onChangeMinute,
  onChangePeriod,
}: {
  hour12: number;
  minute5: number;
  period: "AM" | "PM";
  onChangeHour: (value: number) => void;
  onChangeMinute: (value: number) => void;
  onChangePeriod: (value: "AM" | "PM") => void;
}) {
  return (
    <div className="relative px-4 pt-3 pb-4">
      <div
        className="pointer-events-none absolute inset-x-4 top-1/2 -translate-y-1/2 rounded-card"
        style={{ height: ITEM_HEIGHT, background: "var(--color-toggle-off)" }}
        aria-hidden
      />
      <div className="relative flex items-center justify-center">
        <WheelColumn
          values={HOURS_12}
          selected={hour12}
          width={40}
          onChange={onChangeHour}
          renderLabel={(value, active) => (
            <span className={active ? "text-content-primary" : "text-content-secondary"}>
              {value}
            </span>
          )}
        />
        <WheelColumn
          values={MINUTES_5}
          selected={minute5}
          width={48}
          onChange={onChangeMinute}
          renderLabel={(value, active) => (
            <span className={active ? "text-content-primary" : "text-content-secondary"}>
              {String(value).padStart(2, "0")}
            </span>
          )}
        />
        <WheelColumn
          values={PERIODS}
          selected={period}
          width={56}
          onChange={onChangePeriod}
          renderLabel={(value, active) => (
            <span className={active ? "text-content-primary" : "text-content-secondary"}>
              {value}
            </span>
          )}
        />
      </div>
    </div>
  );
}

// Renders inline, directly under whichever Starts/Ends chip triggered it —
// there's no sheet/backdrop of its own, it's just the calendar or time wheel
// dropped into the same card, matching how the poll screen's "Limit
// duration" toggle reveals its Duration row in place.
export default function DateTimeFieldEditor({
  mode,
  value,
  onChange,
}: {
  mode: "date" | "time";
  value: Date;
  onChange: (date: Date) => void;
}) {
  const [calendarMonth, setCalendarMonth] = useState(() => startOfMonth(value));

  function handleDaySelect(day: Date) {
    const next = new Date(value);
    next.setFullYear(day.getFullYear(), day.getMonth(), day.getDate());
    onChange(next);
  }

  if (mode === "date") {
    return (
      <CalendarGrid
        month={calendarMonth}
        selected={value}
        onPrevMonth={() =>
          setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))
        }
        onNextMonth={() =>
          setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))
        }
        onSelectDay={handleDaySelect}
      />
    );
  }

  const hour24 = value.getHours();
  const hour12 = ((hour24 + 11) % 12) + 1;
  const minute5 = (Math.round(value.getMinutes() / 5) * 5) % 60;
  const period: "AM" | "PM" = hour24 < 12 ? "AM" : "PM";

  function handleTimeChange(part: "hour" | "minute" | "period", partValue: number | "AM" | "PM") {
    const next = new Date(value);
    const currentH24 = next.getHours();
    const currentPeriod: "AM" | "PM" = currentH24 < 12 ? "AM" : "PM";
    const currentH12 = ((currentH24 + 11) % 12) + 1;

    let nextH12 = currentH12;
    let nextPeriod = currentPeriod;
    let nextMinute = next.getMinutes();
    if (part === "hour") nextH12 = partValue as number;
    else if (part === "minute") nextMinute = partValue as number;
    else nextPeriod = partValue as "AM" | "PM";

    const nextH24 = (nextH12 % 12) + (nextPeriod === "PM" ? 12 : 0);
    next.setHours(nextH24, nextMinute, 0, 0);
    onChange(next);
  }

  return (
    <TimeWheels
      hour12={hour12}
      minute5={minute5}
      period={period}
      onChangeHour={(v) => handleTimeChange("hour", v)}
      onChangeMinute={(v) => handleTimeChange("minute", v)}
      onChangePeriod={(v) => handleTimeChange("period", v)}
    />
  );
}
