"use client";

import { useRef, useState } from "react";

const SIZE = 44;

export default function SimulatorTouch({
  children,
}: {
  children: React.ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [isDown, setIsDown] = useState(false);

  function updatePos(e: React.PointerEvent) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  return (
    <div
      ref={containerRef}
      className="simulator-cursor-none relative h-full w-full"
      onPointerEnter={updatePos}
      onPointerMove={updatePos}
      onPointerDown={(e) => {
        updatePos(e);
        setIsDown(true);
      }}
      onPointerUp={() => setIsDown(false)}
      onPointerLeave={() => {
        setPos(null);
        setIsDown(false);
      }}
    >
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
