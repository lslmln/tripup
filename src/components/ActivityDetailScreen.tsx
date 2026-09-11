"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CaretLeft,
  CaretRight,
  DotsThreeOutline,
  Empty,
  MapPin,
  Warning,
} from "@phosphor-icons/react";
import AddBillSheet from "./AddBillSheet";
import GlassButton from "./GlassButton";
import PollVoteSheet from "./PollVoteSheet";
import SegmentedControl from "./SegmentedControl";
import SheetScrollFade from "./SheetScrollFade";
import StatusBar from "./StatusBar";
import TouchScroll from "./TouchScroll";
import { useScrollEdges } from "@/hooks/useScrollEdges";
import { getStoredTimeline, setStoredTimeline } from "@/lib/timeline-store";
import { getStoredMembers } from "@/lib/members-store";
import { formatCountdown, pickPollWinner, resolvePollItem } from "@/lib/poll";
import { subscribeToPollVoteArrivals } from "@/lib/poll-votes-store";
import { CURRENT_USER_ID } from "@/lib/mock-members";
import { formatMoney, splitShare, type Bill } from "@/lib/bills";
import type { Trip } from "@/lib/mock-trips";
import type { Member } from "@/lib/mock-members";
import type { TimelineItem, TimelineSection } from "@/lib/mock-timeline";

const PENDING_COLOR = "#FFDA48";
const POLL_EMOJI = "🗳️";
const DETAIL_TABS = ["Details", "Bill"];

function findItem(sections: TimelineSection[], activityId: string): TimelineItem | null {
  for (const section of sections) {
    const found = section.items.find((item) => item.id === activityId);
    if (found) return found;
  }
  return null;
}

export default function ActivityDetailScreen({
  trip,
  activityId,
  fallbackTimeline,
  fallbackMembers,
}: {
  trip: Trip;
  activityId: string;
  fallbackTimeline: TimelineSection[];
  fallbackMembers: Member[];
}) {
  const [item, setItem] = useState<TimelineItem | null>(() =>
    findItem(getStoredTimeline(trip.id, fallbackTimeline), activityId),
  );
  const [tripMembers] = useState<Member[]>(() => getStoredMembers(trip.id, fallbackMembers));
  // A vote notification links here with "?openPoll=1" so tapping it doesn't
  // just land on the activity but opens the poll itself. useSearchParams
  // (not window.location) — its value is driven by the router's own state,
  // which stays in sync with the URL from this component's very first
  // render during a client-side navigation; window.location.search proved
  // unreliable that early, still reading the *previous* page's query
  // string. Read straight into the initial state (rather than an effect
  // that flips it after mount) to avoid a spurious extra render. Only
  // meaningful for a poll that's still pending; a resolved one has no vote
  // sheet to open.
  const searchParams = useSearchParams();
  const [voteSheetOpen, setVoteSheetOpen] = useState(
    () => searchParams.get("openPoll") === "1" && item?.pending === true,
  );
  const [now, setNow] = useState(() => Date.now());
  const [activeTab, setActiveTab] = useState(0);
  const [billSheetOpen, setBillSheetOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { atTop, atBottom } = useScrollEdges(scrollRef, [activeTab, item]);

  // Writes the item back to the shared store (so it survives navigating
  // away and matches what the trip timeline shows) as well as local state.
  function persistItem(next: TimelineItem) {
    setItem(next);
    const current = getStoredTimeline(trip.id, fallbackTimeline);
    const updated = current.map((section) => ({
      ...section,
      items: section.items.map((existing) => (existing.id === next.id ? next : existing)),
    }));
    setStoredTimeline(trip.id, updated);
  }

  // Applies a simulated vote the moment it arrives (same module-scope
  // schedule TripDetailScreen sets up when the poll's created), so opening
  // straight into the poll's own detail screen still shows votes landing
  // live instead of a stale snapshot from whenever this screen mounted.
  // Functional setItem update, not the `item` closed over above, since this
  // subscription is set up once and must never read a stale copy.
  useEffect(() => {
    return subscribeToPollVoteArrivals(({ itemId, memberId, optionId }) => {
      setItem((prev) => {
        if (!prev || prev.id !== itemId) return prev;
        const next = { ...prev, pollVotes: { ...prev.pollVotes, [memberId]: optionId } };
        const current = getStoredTimeline(trip.id, fallbackTimeline);
        const updated = current.map((section) => ({
          ...section,
          items: section.items.map((existing) => (existing.id === next.id ? next : existing)),
        }));
        setStoredTimeline(trip.id, updated);
        return next;
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip.id]);

  // Ticks the countdown once a second while the poll is still open, and
  // resolves it — winning option replaces the pending placeholder — the
  // moment the deadline passes, even if the user never leaves this screen.
  useEffect(() => {
    if (!item || !item.pending || !item.pollDeadline) return;
    const interval = setInterval(() => {
      const nowTs = Date.now();
      setNow(nowTs);
      if (item.pollDeadline !== undefined && nowTs >= item.pollDeadline) {
        persistItem(resolvePollItem(item));
      }
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item]);

  if (!item) {
    return (
      <div className="flex h-full w-full flex-col bg-background-detail">
        <StatusBar light time="6:45" />
        <div className="flex items-center px-4 py-3">
          <Link href={`/trip/${trip.id}`}>
            <GlassButton ariaLabel="Back">
              <CaretLeft size={22} />
            </GlassButton>
          </Link>
        </div>
        <p className="px-4 font-karla text-body text-content-secondary">
          This activity isn&apos;t available anymore.
        </p>
      </div>
    );
  }

  const attendees = tripMembers.filter((member) => item.attendeeIds?.includes(member.id));
  const remainingMs = item.pollDeadline ? item.pollDeadline - now : null;
  const myVote = item.pollVotes?.[CURRENT_USER_ID] ?? null;
  // Once Ari herself has answered, there's nothing left for her to act on
  // here — the header icon and Location card both drop the yellow "you
  // need to do something" treatment even though the poll is still open for
  // everyone else (item.pending stays true until it actually resolves).
  const answered = item.pending && myVote !== null;
  const leadingOption =
    myVote !== null && item.pollOptions ? pickPollWinner(item.pollOptions, item.pollVotes) : null;

  function castVote(optionId: string) {
    if (!item) return;
    persistItem({
      ...item,
      pollVotes: { ...item.pollVotes, [CURRENT_USER_ID]: optionId },
    });
  }

  // Bills are always paid by whoever's keying them in — this prototype has
  // only one "logged in" user, so that's always Ari.
  const payer = tripMembers.find((member) => member.id === CURRENT_USER_ID) ?? attendees[0];

  function saveBill(bill: Bill) {
    if (!item) return;
    const existing = item.bills ?? [];
    const isEdit = existing.some((b) => b.id === bill.id);
    persistItem({
      ...item,
      bills: isEdit ? existing.map((b) => (b.id === bill.id ? bill : b)) : [...existing, bill],
    });
  }

  function openAddBill() {
    setEditingBill(null);
    setBillSheetOpen(true);
  }

  function openEditBill(bill: Bill) {
    setEditingBill(bill);
    setBillSheetOpen(true);
  }

  return (
    <div className="flex h-full w-full flex-col bg-background-detail">
      <div className="shrink-0">
        <StatusBar light time="6:45" />
        <div className="flex items-center justify-between px-4 py-3">
          <Link href={`/trip/${trip.id}`}>
            <GlassButton ariaLabel="Back">
              <CaretLeft size={22} />
            </GlassButton>
          </Link>
          <GlassButton ariaLabel="More">
            <DotsThreeOutline size={20} weight="fill" />
          </GlassButton>
        </div>

        <div className="flex items-center gap-3 px-4 pb-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-card-light text-[18px]">
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
          <div className="flex flex-col">
            <span className="font-karla text-body font-medium text-content-primary">
              {item.title}
            </span>
            <span className="font-karla text-subtitle text-content-secondary">{item.time}</span>
          </div>
        </div>

        <div className="py-3">
          <SegmentedControl tabs={DETAIL_TABS} onChange={setActiveTab} />
        </div>
      </div>

      <div className="relative min-h-0 flex-1">
        <TouchScroll ref={scrollRef} className="no-scrollbar h-full overflow-y-auto pt-3 pb-23">
          {activeTab === 0 ? (
          <>
          <div className="px-4">
            <h2 className="mb-3 font-karla text-header font-medium text-content-primary">
              Location
            </h2>

            {item.pending ? (
              <button
                type="button"
                onClick={() => setVoteSheetOpen(true)}
                className="flex w-full items-center justify-between gap-3 rounded-card px-4 py-3 text-left"
                style={{
                  background: answered
                    ? "var(--color-card-light)"
                    : `color-mix(in srgb, ${PENDING_COLOR} 10%, transparent)`,
                }}
              >
                <div className="flex shrink-0 flex-col">
                  <span className="font-karla text-body font-medium text-content-primary">
                    Timed poll
                  </span>
                  <span className="font-karla text-subtitle" style={{ color: PENDING_COLOR }}>
                    {remainingMs !== null ? formatCountdown(remainingMs) : "No time limit"}
                  </span>
                </div>
                {leadingOption ? (
                  <div className="flex min-w-0 flex-1 items-center justify-end gap-1">
                    <div className="flex min-w-0 flex-col items-end">
                      <span className="w-full truncate text-right font-karla text-body font-medium text-content-primary">
                        {leadingOption.name}
                      </span>
                      <span className="w-full truncate text-right font-karla text-subtitle text-content-secondary">
                        {leadingOption.subtitle}
                      </span>
                    </div>
                    <CaretRight size={16} className="shrink-0 text-content-secondary" />
                  </div>
                ) : (
                  <CaretRight size={16} className="shrink-0 text-content-secondary" />
                )}
              </button>
            ) : (
              <div className="flex items-center gap-3 rounded-card bg-card-light px-4 py-4">
                <div className="flex flex-1 flex-col">
                  <span className="font-karla text-body font-medium text-content-primary">
                    {item.title}
                  </span>
                  <span className="font-karla text-subtitle text-content-secondary">
                    {item.subtitle}
                  </span>
                </div>
                <MapPin size={20} className="shrink-0 text-content-secondary" />
              </div>
            )}
          </div>

          <div className="px-4 pt-6">
            <h2 className="mb-3 font-karla text-header font-medium text-content-primary">
              Members
            </h2>
            <div className="divide-y divide-border-primary overflow-hidden rounded-card bg-card-light">
              {attendees.map((member) => (
                <div key={member.id} className="flex items-center gap-3 px-4 py-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={member.avatar}
                    alt=""
                    className="h-11 w-11 shrink-0 rounded-full object-cover"
                  />
                  <span className="flex-1 font-karla text-body font-medium text-content-primary">
                    {member.name}
                  </span>
                  {member.isOrganiser && (
                    <span className="font-karla text-body text-content-primary">Organiser</span>
                  )}
                </div>
              ))}
            </div>
          </div>
          </>
          ) : (
          <div className="flex min-h-full flex-col px-4">
            {!item.bills || item.bills.length === 0 ? (
              <div className="m-auto flex flex-col items-center gap-3">
                <Empty size={40} weight="fill" className="text-content-secondary" />
                <span className="font-karla text-body text-content-secondary">
                  No bills added yet
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {item.bills.map((bill) => {
                  const splitMembers = tripMembers.filter((member) =>
                    bill.splitWith.includes(member.id),
                  );
                  const share = splitShare(bill.amount, bill.splitWith.length);
                  return (
                    <div
                      key={bill.id}
                      className="overflow-hidden rounded-card bg-card-light"
                    >
                      <div className="flex items-center justify-between px-4 py-3">
                        <span className="font-karla text-header font-medium text-content-primary">
                          {bill.title}
                        </span>
                        <button
                          type="button"
                          onClick={() => openEditBill(bill)}
                          className="font-karla text-body font-medium"
                          style={{ color: "var(--color-brand)" }}
                        >
                          Edit
                        </button>
                      </div>
                      <div className="border-t border-border-primary px-4 pt-3">
                        <span className="font-karla text-subtitle text-content-secondary">
                          Paid by
                        </span>
                      </div>
                      <div className="flex items-center justify-between px-4 pb-3">
                        <span className="font-karla text-body font-medium text-content-primary">
                          {payer.name}
                        </span>
                        <span className="font-karla text-body font-medium text-content-primary">
                          ${formatMoney(bill.amount)}
                        </span>
                      </div>
                      <div className="border-t border-border-primary px-4 pt-3">
                        <span className="font-karla text-subtitle text-content-secondary">
                          For
                        </span>
                      </div>
                      {splitMembers.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between px-4 py-3"
                        >
                          <span className="font-karla text-body font-medium text-content-primary">
                            {member.name}
                          </span>
                          <span className="font-karla text-body font-medium text-content-primary">
                            ${formatMoney(share)}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          )}
        </TouchScroll>
        <SheetScrollFade
          color="var(--color-background-detail)"
          showTop={!atTop}
          showBottom={!atBottom}
        />

        {activeTab === 1 && (
          <div className="absolute inset-x-4 bottom-8 z-30">
            <button
              type="button"
              onClick={openAddBill}
              className="w-full rounded-full py-3 text-center font-karla text-body font-semibold"
              style={{ background: "var(--color-brand)", color: "#fff" }}
            >
              {item.bills && item.bills.length > 0 ? "Add another bill" : "Add a bill"}
            </button>
          </div>
        )}
      </div>

      {voteSheetOpen && item.pending && (
        <PollVoteSheet
          item={item}
          tripMembers={tripMembers}
          now={now}
          onVote={castVote}
          onClose={() => setVoteSheetOpen(false)}
        />
      )}

      {billSheetOpen && (
        <AddBillSheet
          attendees={attendees}
          payer={payer}
          initialBill={editingBill ?? undefined}
          onSave={saveBill}
          onClose={() => setBillSheetOpen(false)}
        />
      )}
    </div>
  );
}
