"use client";

import { useLayoutEffect, useRef, useState } from "react";
import DurationPickerPanel from "./DurationPickerPanel";

const DURATION_MS = 300;
const SHEET_EASE = "cubic-bezier(0.32, 0.72, 0, 1)";

// Unlike Location (which is a screen inside AddSheet's own crossfade+resize
// system), Duration layers on top as its own sheet — the poll sheet stays
// visible and dimmed behind it rather than being faded out.
export default function DurationPickerSheet({
  minutes,
  onChange,
  onClose,
}: {
  minutes: number;
  onChange: (minutes: number) => void;
  onClose: () => void;
}) {
  const [closing, setClosing] = useState(false);
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

  return (
    <>
      {/*
        z-[60]/z-[70], not the usual z-40/z-50: this sheet stacks on top of
        AddSheet's own backdrop+sheet (also z-40/z-50). Equal z-index siblings
        paint in DOM order *within* each z-index value, not interleaved by
        value — so a later z-40 here would still paint under an earlier z-50,
        leaving the poll sheet undimmed. One tier higher fixes that.
      */}
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
        <DurationPickerPanel minutes={minutes} onChange={onChange} />
      </div>
    </>
  );
}
