"use client";

import { useEffect, useState } from "react";
import StatusBar from "./StatusBar";
import DetailHeader from "./DetailHeader";
import SegmentedControl from "./SegmentedControl";
import TimelineSection from "./TimelineSection";
import TouchScroll from "./TouchScroll";
import TripGlow from "./TripGlow";
import GlassSearchBar from "./GlassSearchBar";
import AddSheet from "./AddSheet";
import type { Trip } from "@/lib/mock-trips";
import type { TimelineSection as TimelineSectionType } from "@/lib/mock-timeline";

export default function TripDetailScreen({
  trip,
  timeline,
}: {
  trip: Trip;
  timeline: TimelineSectionType[];
}) {
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
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
          className="pointer-events-none absolute inset-x-0 top-0 z-20 h-20"
          style={{
            background:
              "linear-gradient(to bottom, var(--color-background-detail) 0%, color-mix(in srgb, var(--color-background-detail) 70%, transparent) 40%, color-mix(in srgb, var(--color-background-detail) 25%, transparent) 75%, transparent 100%)",
          }}
          aria-hidden
        />
      </div>
      <GlassSearchBar onAddClick={() => setSheetOpen(true)} />
      {sheetOpen && <AddSheet onClose={() => setSheetOpen(false)} />}
    </div>
  );
}
