"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import GlassButton from "./GlassButton";
import Toggle from "./Toggle";
import TouchScroll from "./TouchScroll";
import { formatDateChip, formatTimeChip } from "@/lib/format-datetime";

// Layers on top of AddSheet like DurationPickerSheet does — the Add activity
// screen stays visible and dimmed behind it rather than being faded out.
const DURATION_MS = 300;
const SHEET_EASE = "cubic-bezier(0.32, 0.72, 0, 1)";

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

export type DateField = "startDate" | "startTime" | "endDate" | "endTime";

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

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full px-3 py-1.5 font-karla text-subtitle transition-colors duration-150 ease-out"
      style={
        active
          ? { background: "var(--color-brand)", color: "#fff" }
          : { background: "var(--color-toggle-off)", color: "var(--color-content-primary)" }
      }
    >
      {label}
    </button>
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
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current || !ref.current) return;
    const delta = e.clientY - drag.current.startY;
    ref.current.scrollTop = drag.current.startScrollTop - delta;
  }

  function endDrag() {
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
      onPointerLeave={endDrag}
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
          <span
            key={label}
            className="font-karla text-[11px] font-medium text-content-secondary"
          >
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

export default function DateTimePickerSheet({
  start,
  end,
  allDay,
  onAllDayChange,
  onChangeStart,
  onChangeEnd,
  initialField = "startDate",
  onClose,
}: {
  start: Date;
  end: Date;
  allDay: boolean;
  onAllDayChange: (allDay: boolean) => void;
  onChangeStart: (date: Date) => void;
  onChangeEnd: (date: Date) => void;
  initialField?: DateField;
  onClose: () => void;
}) {
  const [closing, setClosing] = useState(false);
  const [activeField, setActiveField] = useState<DateField>(initialField);
  const [calendarMonth, setCalendarMonth] = useState(() =>
    startOfMonth(initialField.startsWith("start") ? start : end),
  );
  const backdropRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Mirrors AddSheet/DurationPickerSheet's entrance on the way out.
  useLayoutEffect(() => {
    if (!closing) return;
    const backdrop = backdropRef.current;
    const sheet = sheetRef.current;
    if (backdrop) {
      backdrop.style.transition = "opacity 300ms ease-out";
      backdrop.style.opacity = "0";
    }
    if (sheet) {
      sheet.style.transition = `transform ${DURATION_MS}ms ${SHEET_EASE}`;
      sheet.style.transform = "translateY(100%)";
    }
    const t = setTimeout(onClose, DURATION_MS);
    return () => clearTimeout(t);
  }, [closing, onClose]);

  function selectChip(field: DateField) {
    setActiveField(field);
    const base = field.startsWith("start") ? start : end;
    setCalendarMonth(startOfMonth(base));
  }

  function handleAllDayChange(next: boolean) {
    onAllDayChange(next);
    if (next && (activeField === "startTime" || activeField === "endTime")) {
      setActiveField(activeField === "startTime" ? "startDate" : "endDate");
    }
  }

  // Applies a mutation to whichever field (start or end) is currently being
  // edited, on a fresh copy of its Date so callers never mutate state directly.
  function applyToActiveField(mutate: (d: Date) => void) {
    const isStart = activeField === "startDate" || activeField === "startTime";
    const base = new Date(isStart ? start : end);
    mutate(base);
    if (isStart) onChangeStart(base);
    else onChangeEnd(base);
  }

  function handleDaySelect(day: Date) {
    applyToActiveField((d) => d.setFullYear(day.getFullYear(), day.getMonth(), day.getDate()));
  }

  const activeDate = activeField === "startDate" || activeField === "startTime" ? start : end;
  const activeHour24 = activeDate.getHours();
  const activeHour12 = ((activeHour24 + 11) % 12) + 1;
  const activeMinute5 = (Math.round(activeDate.getMinutes() / 5) * 5) % 60;
  const activePeriod: "AM" | "PM" = activeHour24 < 12 ? "AM" : "PM";

  function handleTimeChange(part: "hour" | "minute" | "period", value: number | "AM" | "PM") {
    applyToActiveField((d) => {
      const currentH24 = d.getHours();
      const currentPeriod: "AM" | "PM" = currentH24 < 12 ? "AM" : "PM";
      const currentH12 = ((currentH24 + 11) % 12) + 1;

      let nextH12 = currentH12;
      let nextPeriod = currentPeriod;
      let nextMinute = d.getMinutes();
      if (part === "hour") nextH12 = value as number;
      else if (part === "minute") nextMinute = value as number;
      else nextPeriod = value as "AM" | "PM";

      const nextH24 = (nextH12 % 12) + (nextPeriod === "PM" ? 12 : 0);
      d.setHours(nextH24, nextMinute, 0, 0);
    });
  }

  const timeZoneLabel = (() => {
    try {
      const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return zone.split("/").pop()?.replace(/_/g, " ") ?? zone;
    } catch {
      return "";
    }
  })();

  return (
    <>
      {/* z-[60]/z-[70]: stacks on top of AddSheet's own backdrop+sheet, same
          tier as DurationPickerSheet (see that file for why one tier higher
          than the usual z-40/z-50 is needed). */}
      <div
        ref={backdropRef}
        className="backdrop-enter absolute inset-0 z-[60] bg-black/60"
        onClick={() => setClosing(true)}
      />
      <div
        ref={sheetRef}
        className="sheet-enter absolute inset-x-0 bottom-0 z-[70] overflow-hidden rounded-t-[32px] bg-card pt-3 pb-16"
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-white/30" />

        <div className="flex items-center justify-between px-4">
          <GlassButton ariaLabel="Back" onClick={() => setClosing(true)}>
            <CaretLeft size={22} />
          </GlassButton>
          <span className="font-karla text-body font-medium text-content-primary">
            Date &amp; time
          </span>
          <div className="h-11 w-11 shrink-0" aria-hidden />
        </div>

        <TouchScroll className="no-scrollbar overflow-y-auto" style={{ maxHeight: "62vh" }}>
          <div className="flex flex-col gap-4 px-4 pt-4 pb-2">
            <div className="overflow-hidden rounded-card bg-card-light">
              <div className="flex items-center justify-between px-4 py-3">
                <span className="font-karla text-body font-medium text-content-primary">
                  All-day
                </span>
                <Toggle checked={allDay} onChange={handleAllDayChange} ariaLabel="All-day" />
              </div>
            </div>

            <div className="overflow-hidden rounded-card bg-card-light">
              <div className="flex items-center justify-between px-4 py-3">
                <span className="font-karla text-body font-medium text-content-primary">
                  Starts
                </span>
                <div className="flex items-center gap-2">
                  <Chip
                    label={formatDateChip(start)}
                    active={activeField === "startDate"}
                    onClick={() => selectChip("startDate")}
                  />
                  {!allDay && (
                    <Chip
                      label={formatTimeChip(start)}
                      active={activeField === "startTime"}
                      onClick={() => selectChip("startTime")}
                    />
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-border-primary px-4 py-3">
                <span className="font-karla text-body font-medium text-content-primary">
                  Time Zone
                </span>
                <span className="flex items-center gap-1 font-karla text-body text-content-secondary">
                  {timeZoneLabel}
                  <CaretRight size={16} />
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-border-primary px-4 py-3">
                <span className="font-karla text-body font-medium text-content-primary">
                  Ends
                </span>
                <div className="flex items-center gap-2">
                  <Chip
                    label={formatDateChip(end)}
                    active={activeField === "endDate"}
                    onClick={() => selectChip("endDate")}
                  />
                  {!allDay && (
                    <Chip
                      label={formatTimeChip(end)}
                      active={activeField === "endTime"}
                      onClick={() => selectChip("endTime")}
                    />
                  )}
                </div>
              </div>
            </div>

            {(activeField === "startDate" || activeField === "endDate") && (
              <div className="overflow-hidden rounded-card bg-card-light">
                <CalendarGrid
                  month={calendarMonth}
                  selected={activeDate}
                  onPrevMonth={() =>
                    setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))
                  }
                  onNextMonth={() =>
                    setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))
                  }
                  onSelectDay={handleDaySelect}
                />
              </div>
            )}

            {!allDay && (activeField === "startTime" || activeField === "endTime") && (
              <div className="overflow-hidden rounded-card bg-card-light">
                <TimeWheels
                  hour12={activeHour12}
                  minute5={activeMinute5}
                  period={activePeriod}
                  onChangeHour={(v) => handleTimeChange("hour", v)}
                  onChangeMinute={(v) => handleTimeChange("minute", v)}
                  onChangePeriod={(v) => handleTimeChange("period", v)}
                />
              </div>
            )}

            <div className="overflow-hidden rounded-card bg-card-light">
              <div className="flex items-center justify-between px-4 py-3">
                <span className="font-karla text-body font-medium text-content-primary">
                  Travel Time
                </span>
                <span className="font-karla text-body text-content-secondary">None</span>
              </div>
            </div>
          </div>
        </TouchScroll>
      </div>
    </>
  );
}
