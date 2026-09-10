"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { X } from "@phosphor-icons/react";
import GlassButton from "./GlassButton";
import StatusBar from "./StatusBar";
import TouchScroll from "./TouchScroll";
import { formatCountdown, votersForOption } from "@/lib/poll";
import { CURRENT_USER_ID } from "@/lib/mock-members";
import type { Member } from "@/lib/mock-members";
import type { TimelineItem } from "@/lib/mock-timeline";

const DURATION_MS = 300;
const SHEET_EASE = "cubic-bezier(0.32, 0.72, 0, 1)";
const VOTE_BAR_COLOR = "#34c77b";
const MAX_AVATARS = 3;

function Radio({ selected }: { selected: boolean }) {
  return (
    <div
      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2"
      style={{ borderColor: selected ? "var(--color-brand)" : "var(--color-content-secondary)" }}
    >
      {selected && (
        <div className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--color-brand)" }} />
      )}
    </div>
  );
}

export default function PollVoteSheet({
  item,
  tripMembers,
  now,
  onVote,
  onClose,
}: {
  item: TimelineItem;
  tripMembers: Member[];
  now: number;
  onVote: (optionId: string) => void;
  onClose: () => void;
}) {
  const [closing, setClosing] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Mirrors AddMemberSheet's entrance on the way out.
  useLayoutEffect(() => {
    if (!closing) return;
    const backdrop = backdropRef.current;
    const sheet = sheetRef.current;
    if (backdrop) {
      backdrop.style.transition = "opacity 300ms ease-out";
      backdrop.style.opacity = "0";
    }
    if (sheet) {
      sheet.style.transition = `transform ${DURATION_MS}ms ${SHEET_EASE}`;
      sheet.style.transform = "translateY(100%)";
    }
    const t = setTimeout(onClose, DURATION_MS);
    return () => clearTimeout(t);
  }, [closing, onClose]);

  const creator = tripMembers.find((member) => member.id === CURRENT_USER_ID);
  const options = item.pollOptions ?? [];
  const closed = item.pollDeadline !== undefined && now >= item.pollDeadline;
  const myVote = item.pollVotes?.[CURRENT_USER_ID] ?? null;
  const resultsVisible = myVote !== null || closed;
  const totalVotes = options.reduce(
    (sum, option) => sum + votersForOption(item.pollVotes, option.id).length,
    0,
  );

  function memberById(id: string) {
    return tripMembers.find((member) => member.id === id) ?? null;
  }

  return (
    <>
      <div
        ref={backdropRef}
        className="backdrop-enter absolute inset-0 z-40 bg-black/60"
        onClick={() => setClosing(true)}
      />
      {/* Status bar stays crisp above the dimmed backdrop, in the strip the sheet leaves uncovered. */}
      <div className="absolute inset-x-0 top-0 z-50">
        <StatusBar light time="6:45" />
      </div>
      <div
        ref={sheetRef}
        className="sheet-enter absolute inset-x-0 top-17 bottom-0 z-50 flex flex-col overflow-hidden rounded-t-[32px] bg-card"
      >
        <div className="mx-auto mt-3 mb-1 h-1.5 w-10 shrink-0 rounded-full bg-white/30" />

        <div className="flex shrink-0 items-center justify-between px-4 py-3">
          <div className="h-11 w-11 shrink-0" aria-hidden />
          <span className="font-karla text-body font-medium text-content-primary">Poll</span>
          <GlassButton ariaLabel="Close" onClick={() => setClosing(true)}>
            <X size={20} />
          </GlassButton>
        </div>

        <div className="relative min-h-0 flex-1">
          <TouchScroll className="no-scrollbar h-full overflow-y-auto pb-23">
            <div className="flex flex-col gap-4 px-4 pt-1">
              {creator && (
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={creator.avatar}
                    alt=""
                    className="h-9 w-9 shrink-0 rounded-full object-cover"
                  />
                  <span className="flex-1 font-karla text-body font-medium text-content-primary">
                    {creator.name}
                  </span>
                  <span className="font-karla text-body text-content-secondary">Me</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="font-karla text-body font-medium text-content-primary">
                  {item.pollQuestion}
                </span>
                <span
                  className="font-karla text-subtitle"
                  style={closed ? undefined : { color: "#FFDA48" }}
                >
                  {closed
                    ? "Closed"
                    : item.pollDeadline && formatCountdown(item.pollDeadline - now)}
                </span>
              </div>

              <div className="divide-y divide-border-primary overflow-hidden rounded-card bg-card-light">
                {options.map((option) => {
                  const voterIds = votersForOption(item.pollVotes, option.id);
                  const count = voterIds.length;
                  const pct = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
                  const showCount = resultsVisible && count > 0;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      disabled={closed}
                      onClick={() => onVote(option.id)}
                      className="flex w-full flex-col gap-2 px-4 py-3 text-left disabled:cursor-default"
                    >
                      <div className="flex items-center gap-3">
                        <Radio selected={myVote === option.id} />
                        <div className="flex min-w-0 flex-1 flex-col">
                          <span className="font-karla text-body font-medium text-content-primary">
                            {option.name}
                          </span>
                          <span className="truncate font-karla text-subtitle text-content-secondary">
                            {option.subtitle}
                          </span>
                        </div>
                        {showCount && (
                          <div className="flex shrink-0 items-center gap-2">
                            <span className="font-karla text-body font-medium text-content-primary">
                              {count}
                            </span>
                            {item.pollShowWhoVoted !== false && (
                              <div className="flex items-center">
                                {voterIds.slice(0, MAX_AVATARS).map((voterId, i) => {
                                  const voter = memberById(voterId);
                                  if (!voter) return null;
                                  return (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      key={voterId}
                                      src={voter.avatar}
                                      alt=""
                                      className="h-6 w-6 shrink-0 rounded-full border-2 border-card-light object-cover"
                                      style={{ marginLeft: i === 0 ? 0 : -8 }}
                                    />
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      {resultsVisible && (
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-toggle-off">
                          <div
                            className="h-full rounded-full transition-[width] duration-300 ease-out"
                            style={{ width: `${pct}%`, background: VOTE_BAR_COLOR }}
                          />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {resultsVisible && (
                <button
                  type="button"
                  onClick={() => setClosing(true)}
                  className="w-full rounded-full py-3.5 text-center font-karla text-body font-semibold"
                  style={{ background: "var(--color-brand)", color: "#fff" }}
                >
                  View votes
                </button>
              )}
            </div>
          </TouchScroll>
        </div>
      </div>
    </>
  );
}
