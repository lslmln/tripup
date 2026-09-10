"use client";

import { useLayoutEffect, useState } from "react";
import StatusBar from "./StatusBar";
import DetailHeader from "./DetailHeader";
import SegmentedControl from "./SegmentedControl";
import TimelineSection from "./TimelineSection";
import TouchScroll from "./TouchScroll";
import TripGlow from "./TripGlow";
import GlassSearchBar from "./GlassSearchBar";
import AddSheet from "./AddSheet";
import type { Trip } from "@/lib/mock-trips";
import type { TimelineItem, TimelineSection as TimelineSectionType } from "@/lib/mock-timeline";
import { appendToSection, getStoredTimeline, setStoredTimeline } from "@/lib/timeline-store";

export default function TripDetailScreen({
  trip,
  timeline: initialTimeline,
}: {
  trip: Trip;
  timeline: TimelineSectionType[];
}) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [timeline, setTimeline] = useState<TimelineSectionType[]>(() =>
    getStoredTimeline(trip.id, initialTimeline),
  );

  function addTodayItem(item: TimelineItem) {
    setTimeline((prev) => {
      const next = appendToSection(prev, "today", item);
      setStoredTimeline(trip.id, next);
      return next;
    });
  }

  // useLayoutEffect (not useEffect) so this runs before the browser's first
  // paint of this screen: the screen mounts off-screen (about to slide in
  // via PageTransition), so scrolling here happens while nothing is visible
  // yet. A passive useEffect instead would fire after that first paint —
  // i.e. partway through the slide-in — so the list would visibly jump from
  // its top to "Today" mid-animation instead of already being there.
  useLayoutEffect(() => {
    // Land on Today by default; earlier days are reachable by scrolling up.
    document.getElementById("section-today")?.scrollIntoView({ block: "start" });
  }, []);

  return (
    <div className="flex h-full w-full flex-col bg-background-detail">
      <TripGlow />
      <div className="relative z-10 shrink-0">
        <StatusBar light time="6:45" />
        <DetailHeader tripId={trip.id} title={trip.name} avatar={trip.image} />
        <div className="py-3">
          <SegmentedControl />
        </div>
      </div>
      <div className="relative min-h-0 flex-1">
        <TouchScroll className="no-scrollbar relative z-10 h-full overflow-y-auto">
          <div className="flex flex-col gap-3 pt-3 pb-23">
            {timeline.map((section) => (
              <TimelineSection key={section.id} section={section} />
            ))}
          </div>
        </TouchScroll>
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-20 h-3"
          style={{
            background:
              "linear-gradient(to bottom, color-mix(in srgb, var(--color-background-detail) 25%, transparent) 0%, transparent 100%)",
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-20"
          style={{
            background:
              "linear-gradient(to top, var(--color-background-detail) 0%, color-mix(in srgb, var(--color-background-detail) 70%, transparent) 40%, color-mix(in srgb, var(--color-background-detail) 25%, transparent) 75%, transparent 100%)",
          }}
          aria-hidden
        />
      </div>
      <GlassSearchBar onAddClick={() => setSheetOpen(true)} />
      {sheetOpen && (
        <AddSheet
          tripId={trip.id}
          onClose={() => setSheetOpen(false)}
          onActivityCreated={addTodayItem}
        />
      )}
    </div>
  );
}
