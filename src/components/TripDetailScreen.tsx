import StatusBar from "./StatusBar";
import DetailHeader from "./DetailHeader";
import SegmentedControl from "./SegmentedControl";
import TimelineSection from "./TimelineSection";
import TouchScroll from "./TouchScroll";
import TripGlow from "./TripGlow";
import type { Trip } from "@/lib/mock-trips";
import type { TimelineSection as TimelineSectionType } from "@/lib/mock-timeline";

export default function TripDetailScreen({
  trip,
  timeline,
}: {
  trip: Trip;
  timeline: TimelineSectionType[];
}) {
  return (
    <div className="flex h-full w-full flex-col bg-background-detail">
      <TripGlow />
      <div className="relative z-10 shrink-0">
        <StatusBar light time="6:45" />
        <DetailHeader title={trip.name} avatar={trip.image} />
        <div className="py-3">
          <SegmentedControl />
        </div>
      </div>
      <TouchScroll className="no-scrollbar relative z-10 min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-3 py-3">
          {timeline.map((section) => (
            <TimelineSection key={section.id} section={section} />
          ))}
        </div>
      </TouchScroll>
    </div>
  );
}
