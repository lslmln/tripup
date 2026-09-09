import type { TimelineItem as TimelineItemType } from "@/lib/mock-timeline";

export default function TimelineItem({ item }: { item: TimelineItemType }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-card-light text-[18px]">
        {item.emoji}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="font-karla text-body font-medium text-content-primary">
          {item.title}
        </span>
        <span className="truncate font-karla text-subtitle text-content-secondary">
          {item.subtitle}
        </span>
      </div>
      <span className="shrink-0 font-karla text-subtitle text-content-secondary">
        {item.time}
      </span>
    </div>
  );
}
