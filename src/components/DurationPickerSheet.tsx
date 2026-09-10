"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Check, X } from "@phosphor-icons/react";
import GlassButton from "./GlassButton";

const DURATION_MS = 300;
const SHEET_EASE = "cubic-bezier(0.32, 0.72, 0, 1)";

const ITEM_HEIGHT = 40;
const WHEEL_HEIGHT = 200;
// Top/bottom padding so the first and last items can still scroll to center.
const WHEEL_PADDING = (WHEEL_HEIGHT - ITEM_HEIGHT) / 2;
const SETTLE_MS = 120;

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
      style={{ height: WHEEL_HEIGHT, paddingBlock: WHEEL_PADDING }}
    >
      {values.map((value) => {
        const isSelected = value === selected;
        return (
          <div
            key={value}
            className={`flex snap-center items-center justify-center gap-1.5 font-karla text-header ${
              isSelected ? "text-content-primary" : "text-content-secondary"
            }`}
            style={{ height: ITEM_HEIGHT }}
          >
            <span>{value}</span>
            {isSelected && (
              <span className="font-karla text-subtitle text-content-secondary">{unit}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function DurationPickerSheet({
  initialMinutes,
  onConfirm,
  onClose,
}: {
  initialMinutes: number;
  onConfirm: (minutes: number) => void;
  onClose: () => void;
}) {
  const [closing, setClosing] = useState(false);
  const [hours, setHours] = useState(Math.floor(initialMinutes / 60));
  const [minutes, setMinutes] = useState(initialMinutes % 60);
  const backdropRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Mirrors AddSheet/AddMemberSheet's entrance on the way out.
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

  function handleConfirm() {
    onConfirm(hours * 60 + minutes);
    setClosing(true);
  }

  return (
    <>
      <div
        ref={backdropRef}
        className="backdrop-enter absolute inset-0 z-40 bg-black/60"
        onClick={() => setClosing(true)}
      />
      <div
        ref={sheetRef}
        className="sheet-enter absolute inset-x-0 bottom-0 z-50 overflow-hidden rounded-t-[32px] bg-card pt-3 pb-16"
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-white/30" />

        <div className="flex items-center justify-between px-4">
          <GlassButton ariaLabel="Cancel" onClick={() => setClosing(true)}>
            <X size={20} />
          </GlassButton>
          <span className="font-karla text-body font-medium text-content-primary">
            Duration
          </span>
          <GlassButton ariaLabel="Set" onClick={handleConfirm}>
            <Check size={20} weight="bold" />
          </GlassButton>
        </div>

        <div className="relative mt-4 px-4">
          <div
            className="pointer-events-none absolute inset-x-4 top-1/2 -translate-y-1/2 rounded-card bg-card-light"
            style={{ height: ITEM_HEIGHT }}
            aria-hidden
          />
          <div className="relative flex items-center justify-center">
            <WheelColumn values={HOURS} selected={hours} unit="hours" onChange={setHours} />
            <WheelColumn values={MINUTES} selected={minutes} unit="min" onChange={setMinutes} />
          </div>
        </div>
      </div>
    </>
  );
}
