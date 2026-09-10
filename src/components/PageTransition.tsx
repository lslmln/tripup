"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { NAV_DURATION, NAV_EASE } from "@/lib/motion";

const DURATION_MS = NAV_DURATION * 1000;
const EASE = `cubic-bezier(${NAV_EASE.join(",")})`;

// Route nesting depth (e.g. "/" = 0, "/trip/1" = 2, "/trip/1/members" = 3).
// Comparing depth (rather than a two-state "is this a detail screen?" flag)
// is what lets a hop between two nested routes at different depths — like
// trip detail -> members — get a correct forward/back direction too.
function depth(pathname: string) {
  return pathname.split("/").filter(Boolean).length;
}

// Snapshots the outgoing screen as raw HTML, then slides that frozen
// snapshot away underneath the new screen sliding in.
//
// Getting the snapshot timing right took a few tries: a `useLayoutEffect`
// keyed on `pathname` runs *after* React has already mutated the DOM to the
// new page's content, so reading the "live" ref inside it only ever
// captures the new page, never the old one. The fix is a ref that's
// re-captured on *every* render (no dependency array): by the time the
// pathname-change is detected, that ref still holds whatever was captured
// on the previous commit — i.e. genuinely the old page.
export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const liveRef = useRef<HTMLDivElement>(null);
  const enterRef = useRef<HTMLDivElement>(null);
  const exitRef = useRef<HTMLDivElement>(null);
  const lastHtmlRef = useRef<string | null>(null);
  const lastPathnameRef = useRef(pathname);
  const [snapshot, setSnapshot] = useState<{ html: string; exitTo: number } | null>(
    null,
  );

  useLayoutEffect(() => {
    if (pathname !== lastPathnameRef.current) {
      const forward = depth(pathname) >= depth(lastPathnameRef.current);
      const oldHtml = lastHtmlRef.current;
      lastPathnameRef.current = pathname;

      if (oldHtml) {
        setSnapshot({ html: oldHtml, exitTo: forward ? -100 : 100 });
      }

      const enterEl = enterRef.current;
      if (enterEl) {
        const enterFrom = forward ? 100 : -100;
        enterEl.style.transition = "none";
        enterEl.style.transform = `translateX(${enterFrom}%)`;
        void enterEl.offsetHeight;
        enterEl.style.transition = `transform ${DURATION_MS}ms ${EASE}`;
        enterEl.style.transform = "translateX(0%)";
      }
    }

    // Always refresh the "last known" snapshot to what's on screen now, so
    // it's ready to serve as the "old" content for the *next* transition.
    lastHtmlRef.current = liveRef.current?.innerHTML ?? null;
  });

  useLayoutEffect(() => {
    if (!snapshot) return;
    const el = exitRef.current;
    if (!el) return;
    el.style.transition = "none";
    el.style.transform = "translateX(0%)";
    void el.offsetHeight;
    el.style.transition = `transform ${DURATION_MS}ms ${EASE}`;
    el.style.transform = `translateX(${snapshot.exitTo}%)`;
    const t = setTimeout(() => setSnapshot(null), DURATION_MS + 30);
    return () => clearTimeout(t);
  }, [snapshot]);

  return (
    <>
      {snapshot && (
        <div
          ref={exitRef}
          className="absolute inset-0 h-full w-full"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: snapshot.html }}
        />
      )}
      <div ref={enterRef} className="absolute inset-0 z-10 h-full w-full">
        <div ref={liveRef} className="h-full w-full">
          {children}
        </div>
      </div>
    </>
  );
}
