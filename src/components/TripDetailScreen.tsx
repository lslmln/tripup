"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Empty } from "@phosphor-icons/react";
import StatusBar from "./StatusBar";
import DetailHeader from "./DetailHeader";
import SegmentedControl from "./SegmentedControl";
import TimelineSection from "./TimelineSection";
import TouchScroll from "./TouchScroll";
import TripGlow from "./TripGlow";
import GlassSearchBar from "./GlassSearchBar";
import AddSheet from "./AddSheet";
import SheetScrollFade from "./SheetScrollFade";
import { useScrollEdges } from "@/hooks/useScrollEdges";
import type { Trip } from "@/lib/mock-trips";
import type { Member } from "@/lib/mock-members";
import type { TimelineItem, TimelineSection as TimelineSectionType } from "@/lib/mock-timeline";
import type { Transaction } from "@/lib/transactions";
import { appendToSection, getStoredTimeline, setStoredTimeline } from "@/lib/timeline-store";
import { getStoredMembers } from "@/lib/members-store";
import { addStoredTransaction, getStoredTransactions } from "@/lib/transactions-store";
import { resolvePollItem } from "@/lib/poll";
import { computeOwed } from "@/lib/balance";
import { formatMoney } from "@/lib/bills";
import { formatClockTime } from "@/lib/format-datetime";
import { scheduleNotification } from "@/lib/notifications-store";

// There's no real multi-user backend here, so incoming payments are
// simulated: every debtor still owed gets paid off in full, one at a time,
// this many ms apart — standing in for other members settling up on their
// own end and the notification for each arriving in turn.
const SIMULATED_PAYMENT_INTERVAL_MS = 5000;
// Every other attendee's poll vote is already seeded the instant a poll is
// created (see seedPollVotes) — the vote data itself doesn't trickle in.
// This just paces the *notifications* about those votes so they read as
// people responding over time instead of all landing at once.
const POLL_VOTE_NOTIFICATION_INTERVAL_MS = 5000;

export default function TripDetailScreen({
  trip,
  timeline: initialTimeline,
  fallbackMembers,
}: {
  trip: Trip;
  timeline: TimelineSectionType[];
  fallbackMembers: Member[];
}) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  // All three tabs share one scrollable element (content just swaps), so
  // switching away from a tall Timeline scroll position to a much shorter
  // Balance/Transactions view clamps scrollTop down — switching back with
  // no restore would otherwise land back at the top instead of where you
  // were.
  const scrollRef = useRef<HTMLDivElement>(null);
  const savedScrollTopRef = useRef<Partial<Record<number, number>>>({});

  function handleTabChange(index: number) {
    const el = scrollRef.current;
    if (el) savedScrollTopRef.current[activeTab] = el.scrollTop;
    setActiveTab(index);
  }

  // Restores the tab being switched to — a no-op for a tab visited for the
  // first time (nothing saved yet), including Timeline's own initial
  // mount, which the "land on today" effect below handles instead.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    const saved = savedScrollTopRef.current[activeTab];
    if (el && saved !== undefined) el.scrollTop = saved;
  }, [activeTab]);
  const [timeline, setTimeline] = useState<TimelineSectionType[]>(() =>
    getStoredTimeline(trip.id, initialTimeline),
  );
  const [tripMembers] = useState<Member[]>(() => getStoredMembers(trip.id, fallbackMembers));
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    getStoredTransactions(trip.id),
  );
  function addTodayItem(item: TimelineItem) {
    setTimeline((prev) => {
      const next = appendToSection(prev, "today", item);
      setStoredTimeline(trip.id, next);
      return next;
    });
    schedulePollVoteNotifications(item);
  }

  // Every other attendee's vote already exists in item.pollVotes the moment
  // a poll is created (see seedPollVotes) — there's no real second person
  // casting it later. This just staggers when each vote's notification
  // shows, so it reads as people responding to the poll over time. Uses the
  // module-scope notifications-store (not a local setTimeout) so opening
  // the poll's own detail screen right after creating it — the obvious
  // next thing to do — doesn't unmount this component and cancel them.
  function schedulePollVoteNotifications(item: TimelineItem) {
    if (!item.pending || !item.pollVotes || !item.pollOptions) return;
    const voterIds = Object.keys(item.pollVotes);
    voterIds.forEach((memberId, index) => {
      const member = memberById(memberId);
      const optionId = item.pollVotes?.[memberId];
      const option = item.pollOptions?.find((o) => o.id === optionId);
      if (!member || !option) return;
      scheduleNotification(
        {
          id: `vote-${item.id}-${memberId}`,
          icon: "vote",
          title: "New vote",
          message: `${member.name} voted for ${option.name}`,
        },
        (index + 1) * POLL_VOTE_NOTIFICATION_INTERVAL_MS,
      );
    });
  }

  // Catches a poll's deadline passing while the user is sitting on the main
  // timeline rather than the poll's own detail screen — the pending card
  // flips back to a normal decided entry (winning option) within a second,
  // with no need to open it first.
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setTimeline((prev) => {
        let changed = false;
        const next = prev.map((section) => ({
          ...section,
          items: section.items.map((item) => {
            if (item.pending && item.pollDeadline !== undefined && item.pollDeadline <= now) {
              changed = true;
              return resolvePollItem(item);
            }
            return item;
          }),
        }));
        if (!changed) return prev;
        setStoredTimeline(trip.id, next);
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [trip.id]);

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

  function memberById(id: string) {
    return tripMembers.find((member) => member.id === id) ?? null;
  }

  // Every bill's payer is the current user, so this is exactly what every
  // other trip member still owes, aggregated across every activity's bills.
  // Memoized so the payment-chain effect below only re-fires when the
  // underlying timeline/transactions actually change, not on every render.
  const owed = useMemo(() => computeOwed(timeline, transactions), [timeline, transactions]);
  const totalOwed = owed.reduce((sum, entry) => sum + entry.amount, 0);

  const { atTop, atBottom } = useScrollEdges(scrollRef, [activeTab, timeline, transactions]);

  // Real payments come from other trip members' own devices, not anything
  // Ari does here — this simulates them arriving one at a time, spaced
  // SIMULATED_PAYMENT_INTERVAL_MS apart, so the notification and
  // Balance/Transactions flow are demonstrable without a real backend.
  // Settling the first debtor removes them from `owed`, which re-triggers
  // this effect and schedules the next one — a self-perpetuating chain
  // rather than an explicit queue.
  //
  // Depends on just the first debtor's id, not the whole `owed` array:
  // `owed` gets a brand-new array reference from useMemo on every unrelated
  // timeline/transaction change (a poll auto-resolving, say), and reacting
  // to that reference would cancel-and-reschedule an in-flight payment's
  // countdown for no reason. A stable primitive dependency also means this
  // effect's cleanup can safely clear its own timeout on every re-run — the
  // usual React pattern — without that happening spuriously; without it,
  // React 18 Strict Mode's dev-only mount→cleanup→remount replay cancels
  // the timer on the simulated cleanup and never reschedules it, since
  // there'd be nothing left to signal that the "in-flight" timer is gone.
  const nextDebtorId = owed[0]?.memberId ?? null;
  useEffect(() => {
    if (!nextDebtorId) return;
    const debtor = owed.find((entry) => entry.memberId === nextDebtorId);
    if (!debtor) return;
    const member = memberById(debtor.memberId);
    const timer = setTimeout(() => {
      const transaction: Transaction = {
        id: `txn-${Date.now()}`,
        memberId: debtor.memberId,
        amount: debtor.amount,
        at: Date.now(),
      };
      setTransactions(addStoredTransaction(trip.id, transaction));
      scheduleNotification(
        {
          id: `payment-${transaction.id}`,
          icon: "payment",
          title: "Payment received",
          message: `${member?.name ?? "Someone"} paid you $${formatMoney(debtor.amount)}`,
        },
        0,
      );
    }, SIMULATED_PAYMENT_INTERVAL_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextDebtorId]);

  return (
    <div className="relative flex h-full w-full flex-col bg-background-detail">
      <TripGlow />
      <div className="relative z-10 shrink-0">
        <StatusBar light time="6:45" />
        <DetailHeader tripId={trip.id} title={trip.name} avatar={trip.image} />
        <div className="py-3">
          <SegmentedControl onChange={handleTabChange} />
        </div>
      </div>
      <div className="relative min-h-0 flex-1">
        <TouchScroll ref={scrollRef} className="no-scrollbar relative z-10 h-full overflow-y-auto">
          {activeTab === 0 && (
            <div className="flex flex-col gap-3 pt-3 pb-23">
              {timeline.map((section) => (
                <TimelineSection key={section.id} section={section} tripId={trip.id} />
              ))}
            </div>
          )}

          {activeTab === 1 && (
            <div className="flex min-h-full flex-col px-4 pt-3 pb-23">
              {owed.length === 0 ? (
                <div className="m-auto flex flex-col items-center gap-3">
                  <Empty size={40} weight="fill" className="text-content-secondary" />
                  <span className="font-karla text-body text-content-secondary">
                    You&apos;re all settled up
                  </span>
                </div>
              ) : (
                <>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-karla text-header font-medium text-content-primary">
                      You&apos;re owed
                    </span>
                    <span className="font-karla text-header font-medium text-content-primary">
                      ${formatMoney(totalOwed)}
                    </span>
                  </div>
                  <div className="divide-y divide-border-primary overflow-hidden rounded-card bg-card">
                    {owed.map((entry) => {
                      const member = memberById(entry.memberId);
                      if (!member) return null;
                      return (
                        <div key={entry.memberId} className="flex items-center gap-3 px-4 py-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={member.avatar}
                            alt=""
                            className="h-11 w-11 shrink-0 rounded-full object-cover"
                          />
                          <span className="flex-1 font-karla text-body font-medium text-content-primary">
                            {member.name}
                          </span>
                          <span className="font-karla text-body font-medium text-content-primary">
                            ${formatMoney(entry.amount)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 2 && (
            <div className="flex min-h-full flex-col px-4 pt-3 pb-23">
              {transactions.length === 0 ? (
                <div className="m-auto flex flex-col items-center gap-3">
                  <Empty size={40} weight="fill" className="text-content-secondary" />
                  <span className="font-karla text-body text-content-secondary">
                    No transactions received yet
                  </span>
                </div>
              ) : (
                <>
                  <h2 className="mb-3 font-karla text-header font-medium text-content-primary">
                    Today
                  </h2>
                  <div className="divide-y divide-border-primary overflow-hidden rounded-card bg-card">
                    {transactions.map((transaction) => {
                      const member = memberById(transaction.memberId);
                      if (!member) return null;
                      return (
                        <div
                          key={transaction.id}
                          className="flex items-center gap-3 px-4 py-3"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={member.avatar}
                            alt=""
                            className="h-11 w-11 shrink-0 rounded-full object-cover"
                          />
                          <div className="flex flex-1 flex-col">
                            <span className="font-karla text-body font-medium text-content-primary">
                              {member.name}
                            </span>
                            <span className="font-karla text-subtitle text-content-secondary">
                              {formatClockTime(new Date(transaction.at))}
                            </span>
                          </div>
                          <span className="font-karla text-body font-medium text-content-primary">
                            ${formatMoney(transaction.amount)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </TouchScroll>
        <SheetScrollFade
          color="var(--color-background-detail)"
          showTop={!atTop}
          showBottom={!atBottom}
        />
      </div>
      {activeTab === 0 && <GlassSearchBar onAddClick={() => setSheetOpen(true)} />}
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
