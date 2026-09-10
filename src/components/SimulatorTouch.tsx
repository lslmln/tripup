"use client";

import { useEffect, useRef, useState } from "react";

const SIZE = 44;

function isInside(rect: DOMRect, x: number, y: number) {
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

export default function SimulatorTouch({
  children,
}: {
  children: React.ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [isDown, setIsDown] = useState(false);

  // Tracked from `window`, not container onPointerEnter/Move/Leave: page
  // navigation swaps the DOM subtree under the cursor, which fires a
  // spurious pointerleave on the container mid-transition and resets the
  // cursor to nothing. Window-level listeners don't depend on which child
  // element is currently under the pointer, so the cursor stays put across
  // navigations, like the simulator cursor in Xcode.
  useEffect(() => {
    function handleMove(e: PointerEvent) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect || !isInside(rect, e.clientX, e.clientY)) {
        setPos(null);
        return;
      }
      setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }

    function handleDown(e: PointerEvent) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect && isInside(rect, e.clientX, e.clientY)) setIsDown(true);
    }

    function handleUp() {
      setIsDown(false);
    }

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerdown", handleDown);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerdown", handleDown);
      window.removeEventListener("pointerup", handleUp);
    };
  }, []);

  return (
    <div ref={containerRef} className="simulator-cursor-none relative h-full w-full">
      {children}
      {pos && (
        <div
          className="pointer-events-none absolute left-0 top-0 z-50"
          style={{
            width: SIZE,
            height: SIZE,
            transform: `translate(${pos.x - SIZE / 2}px, ${pos.y - SIZE / 2}px)`,
          }}
        >
          <div
            className="h-full w-full rounded-full transition-transform"
            style={{
              background: isDown
                ? "rgba(180,180,180,0.55)"
                : "rgba(180,180,180,0.25)",
              border: "1px solid rgba(255,255,255,0.6)",
              transform: `scale(${isDown ? 0.9 : 1})`,
            }}
          />
        </div>
      )}
    </div>
  );
}
