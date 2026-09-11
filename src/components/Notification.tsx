"use client";

import { useLayoutEffect, useRef, useState } from "react";

// How long a notification sits visible before it dismisses itself, absent
// user action — matches the swipe-to-dismiss path so both feel like the
// same "this goes away in about 5s" behavior.
const AUTO_DISMISS_MS = 5000;
const EXIT_MS = 220;
const EXIT_EASE = "cubic-bezier(0.32, 0.72, 0, 1)";
// Below this, an upward pointer movement reads as a tap rather than a
// deliberate swipe-to-dismiss — small enough that a real swipe still lands
// well past it, large enough to absorb the jitter a "tap" naturally has.
const TAP_THRESHOLD_PX = 6;

// A single in-app notification card: enters via the notification-enter
// @starting-style keyframe (declarative, see globals.css), then leaves
// either by auto-dismissing after AUTO_DISMISS_MS, a tap, or an upward
// swipe — all three play the same imperative slide-up-and-fade exit before
// calling onDismiss, mirroring how the sheets in this app animate out. A
// tap (as opposed to a swipe) also fires onTap first, e.g. to navigate to
// what the notification is about.
export default function Notification({
  icon,
  title,
  message,
  onTap,
  onDismiss,
}: {
  icon: React.ReactNode;
  title: string;
  message: string;
  onTap?: () => void;
  onDismiss: () => void;
}) {
  const [closing, setClosing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number | null>(null);

  useLayoutEffect(() => {
    const t = setTimeout(() => setClosing(true), AUTO_DISMISS_MS);
    return () => clearTimeout(t);
  }, []);

  useLayoutEffect(() => {
    if (!closing) return;
    const card = cardRef.current;
    if (card) {
      card.style.transition = `transform ${EXIT_MS}ms ${EXIT_EASE}, opacity ${EXIT_MS}ms ease-out`;
      card.style.transform = "translateY(-120%)";
      card.style.opacity = "0";
    }
    const t = setTimeout(onDismiss, EXIT_MS);
    return () => clearTimeout(t);
  }, [closing, onDismiss]);

  function onPointerDown(e: React.PointerEvent) {
    dragStartY.current = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    const startY = dragStartY.current;
    const card = cardRef.current;
    if (startY === null || !card) return;
    const delta = e.clientY - startY;
    if (delta > 0) return; // only track upward drags — a downward one just snaps back below
    card.style.transition = "none";
    card.style.transform = `translateY(${delta}px)`;
    card.style.opacity = `${Math.max(0, 1 + delta / 80)}`;
  }

  // A tap (|delta| under the threshold) and an upward swipe both dismiss;
  // a downward drag snaps back in place instead of closing. Only a tap also
  // fires onTap — a real swipe-to-dismiss shouldn't also navigate away.
  function onPointerUp(e: React.PointerEvent) {
    const startY = dragStartY.current;
    dragStartY.current = null;
    if (startY === null) return;
    const delta = e.clientY - startY;
    if (delta <= 0) {
      if (Math.abs(delta) < TAP_THRESHOLD_PX) onTap?.();
      setClosing(true);
      return;
    }
    const card = cardRef.current;
    if (card) {
      card.style.transition = "transform 200ms ease-out, opacity 200ms ease-out";
      card.style.transform = "translateY(0)";
      card.style.opacity = "1";
    }
  }

  return (
    <div
      ref={cardRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className="notification-enter absolute inset-x-4 top-14 z-30 flex items-center gap-3 rounded-card bg-card px-4 py-3 text-left shadow-lg"
      style={{ touchAction: "none" }}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-icon-neutral text-content-primary">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="font-karla text-body font-medium text-content-primary">{title}</span>
        <span className="font-karla text-subtitle text-content-secondary">{message}</span>
      </div>
    </div>
  );
}
