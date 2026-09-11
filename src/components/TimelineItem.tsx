import Link from "next/link";
import { Warning } from "@phosphor-icons/react";
import { CURRENT_USER_ID } from "@/lib/mock-members";
import type { TimelineItem as TimelineItemType } from "@/lib/mock-timeline";

// Poll-created entries land here before anyone's voted on a place, so the
// pending state shows a warning instead of a location emoji it can't have yet.
const PENDING_COLOR = "#FFDA48";
// Once Ari herself has answered, there's nothing left for her to act on —
// the row drops the yellow tint/warning even though the poll itself is
// still open for everyone else, and shows a ballot box instead.
const POLL_EMOJI = "🗳️";

export default function TimelineItem({
  item,
  tripId,
}: {
  item: TimelineItemType;
  tripId: string;
}) {
  const answered = item.pending && (item.pollVotes?.[CURRENT_USER_ID] ?? null) !== null;
  // Only pending items get the yellow tint — once a poll resolves, its
  // pollOptions/etc. stay on the item (see resolvePollItem) but pending
  // flips to false, and this shouldn't re-trigger the tint.
  const showPendingTint = item.pending && !answered;
  // A poll's own item stays tappable after it resolves too — it's still
  // the same activity, just decided now — unlike a plain pre-seeded
  // timeline item, which has no detail screen to open at all.
  const isPollActivity = item.pending || item.pollOptions !== undefined;

  const content = (
    <>
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center text-[18px] ${
          item.pending ? "" : "rounded-full bg-card-light"
        }`}
      >
        {item.pending ? (
          answered ? (
            POLL_EMOJI
          ) : (
            <Warning size={20} weight="fill" style={{ color: PENDING_COLOR }} />
          )
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

  if (isPollActivity) {
    return (
      <Link
        href={`/trip/${tripId}/activity/${item.id}`}
        className="flex items-center gap-3 px-4 py-3 transition-transform duration-150 ease-out active:scale-[0.98]"
        style={
          showPendingTint
            ? { background: `color-mix(in srgb, ${PENDING_COLOR} 10%, transparent)` }
            : undefined
        }
      >
        {content}
      </Link>
    );
  }

  return <div className="flex items-center gap-3 px-4 py-3">{content}</div>;
}
