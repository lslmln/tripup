"use client";

import { useEffect, useRef } from "react";

// Mimics touch-drag scrolling like the iOS Simulator: dragging moves the
// content directly under the pointer, and the mouse wheel does nothing —
// you have to "grab" the screen the way you would a real device.
export default function TouchScroll({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ startY: number; startScrollTop: number } | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const blockWheel = (e: WheelEvent) => e.preventDefault();
    el.addEventListener("wheel", blockWheel, { passive: false });
    return () => el.removeEventListener("wheel", blockWheel);
  }, []);

  function onPointerDown(e: React.PointerEvent) {
    if (!scrollRef.current) return;
    drag.current = { startY: e.clientY, startScrollTop: scrollRef.current.scrollTop };
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current || !scrollRef.current) return;
    const delta = e.clientY - drag.current.startY;
    scrollRef.current.scrollTop = drag.current.startScrollTop - delta;
  }

  function endDrag() {
    drag.current = null;
  }

  return (
    <div
      ref={scrollRef}
      className={className}
      style={{ touchAction: "none" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
    >
      {children}
    </div>
  );
}
