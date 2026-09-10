"use client";

import { useEffect, useRef } from "react";

// Mimics touch-drag scrolling like the iOS Simulator: dragging moves the
// content directly under the pointer, and the mouse wheel does nothing —
// you have to "grab" the screen the way you would a real device.
export default function TouchScroll({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ startY: number; startScrollTop: number; dragging: boolean } | null>(
    null,
  );

  // Below this much movement, a press is treated as a tap (let it click
  // through to the row underneath) rather than a scroll drag.
  const DRAG_THRESHOLD_PX = 6;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const blockWheel = (e: WheelEvent) => e.preventDefault();
    el.addEventListener("wheel", blockWheel, { passive: false });
    return () => el.removeEventListener("wheel", blockWheel);
  }, []);

  function onPointerDown(e: React.PointerEvent) {
    if (!scrollRef.current) return;
    drag.current = {
      startY: e.clientY,
      startScrollTop: scrollRef.current.scrollTop,
      dragging: false,
    };
    // Pointer capture is NOT taken here — only once real dragging is
    // detected in onPointerMove. Capturing on every press also captures the
    // compatibility mouse/click events, so a plain tap's click would land on
    // this container instead of the row button underneath, breaking taps.
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current || !scrollRef.current) return;
    const delta = e.clientY - drag.current.startY;
    if (!drag.current.dragging) {
      if (Math.abs(delta) < DRAG_THRESHOLD_PX) return;
      drag.current.dragging = true;
      // Once a real drag starts, capture the pointer so every subsequent
      // move/up event stays routed here regardless of what's visually under
      // the cursor (e.g. a floating glass search bar that's a sibling, not a
      // descendant) — without this, dragging over such an element hands
      // pointermove to it instead, killing the scroll mid-gesture.
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    scrollRef.current.scrollTop = drag.current.startScrollTop - delta;
  }

  function endDrag(e: React.PointerEvent) {
    if (drag.current?.dragging && e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    drag.current = null;
  }

  return (
    <div
      ref={scrollRef}
      className={className}
      style={{ ...style, touchAction: "none" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      {children}
    </div>
  );
}
