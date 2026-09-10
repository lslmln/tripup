import type { TimelineSection as TimelineSectionType } from "@/lib/mock-timeline";
import TimelineItem from "./TimelineItem";

export default function TimelineSection({
  section,
}: {
  section: TimelineSectionType;
}) {
  return (
    <div id={`section-${section.id}`} className="px-4">
      <h2 className="mb-3 font-karla text-header font-medium text-content-primary">
        {section.label}
      </h2>
      <div className="divide-y divide-border-primary overflow-hidden rounded-card bg-card">
        {section.items.map((item) => (
          <TimelineItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
