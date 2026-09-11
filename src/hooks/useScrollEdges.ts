"use client";

import { useLayoutEffect, useState, type RefObject } from "react";

const EDGE_EPSILON_PX = 1;

// Tracks whether a scrollable element is scrolled away from its top/bottom
// edge, so a caller can show a scroll-fade only when there's actually more
// content in that direction — not as a permanent decoration that overlaps
// content sitting flush against the edge. Recomputes on every "scroll" event
// (TouchScroll sets scrollTop directly rather than via native drag/wheel,
// but that still fires "scroll") and whenever an entry in `deps` changes,
// since content being added/removed/filtered can change scrollHeight
// without the scroll position itself moving.
export function useScrollEdges(
  ref: RefObject<HTMLElement | null>,
  deps: readonly unknown[] = [],
) {
  const [state, setState] = useState({ atTop: true, atBottom: true });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    function measure() {
      if (!el) return;
      const { scrollTop, scrollHeight, clientHeight } = el;
      setState({
        atTop: scrollTop <= EDGE_EPSILON_PX,
        atBottom: scrollTop + clientHeight >= scrollHeight - EDGE_EPSILON_PX,
      });
    }

    measure();
    el.addEventListener("scroll", measure, { passive: true });
    // The element's own height can itself be mid CSS transition when this
    // effect runs (AddSheet/PollVoteSheet resize their sheet between
    // screens with `transition-[height]`): a browser mutates layout
    // immediately but *animates* the box over that transition, so
    // clientHeight read synchronously here can be the pre-transition value,
    // not the settled target — re-measure once it actually finishes.
    function onTransitionEnd(e: TransitionEvent) {
      if (e.target === el && e.propertyName === "height") measure();
    }
    el.addEventListener("transitionend", onTransitionEnd);
    return () => {
      el.removeEventListener("scroll", measure);
      el.removeEventListener("transitionend", onTransitionEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
