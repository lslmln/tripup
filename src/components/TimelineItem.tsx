import { Warning } from "@phosphor-icons/react";
import type { TimelineItem as TimelineItemType } from "@/lib/mock-timeline";

// Poll-created entries land here before anyone's voted on a place, so the
// pending state shows a warning instead of a location emoji it can't have yet.
const PENDING_COLOR = "#FFDA48";

export default function TimelineItem({ item }: { item: TimelineItemType }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-card-light text-[18px]">
        {item.pending ? (
          <Warning size={20} weight="fill" style={{ color: PENDING_COLOR }} />
        ) : (
          item.emoji
        )}
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
