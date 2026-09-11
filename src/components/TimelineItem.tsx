import Link from "next/link";
import { Warning } from "@phosphor-icons/react";
import type { TimelineItem as TimelineItemType } from "@/lib/mock-timeline";

// Poll-created entries land here before anyone's voted on a place, so the
// pending state shows a warning instead of a location emoji it can't have yet.
const PENDING_COLOR = "#FFDA48";

export default function TimelineItem({
  item,
  tripId,
}: {
  item: TimelineItemType;
  tripId: string;
}) {
  const content = (
    <>
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
    </>
  );

  // Only poll-pending entries have a detail screen to open right now — a
  // decided activity isn't tappable yet.
  if (item.pending) {
    return (
      <Link
        href={`/trip/${tripId}/activity/${item.id}`}
        className="flex items-center gap-3 px-4 py-3 transition-transform duration-150 ease-out active:scale-[0.98]"
        style={{ background: `color-mix(in srgb, ${PENDING_COLOR} 10%, transparent)` }}
      >
        {content}
      </Link>
    );
  }

  return <div className="flex items-center gap-3 px-4 py-3">{content}</div>;
}
