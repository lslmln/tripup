"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Empty } from "@phosphor-icons/react";
import StatusBar from "./StatusBar";
import DetailHeader from "./DetailHeader";
import SegmentedControl from "./SegmentedControl";
import TimelineSection from "./TimelineSection";
import TouchScroll from "./TouchScroll";
import TransactionNotification from "./TransactionNotification";
import TripGlow from "./TripGlow";
import GlassSearchBar from "./GlassSearchBar";
import AddSheet from "./AddSheet";
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

// There's no real multi-user backend here, so incoming payments are
// simulated: every debtor still owed gets paid off in full, one at a time,
// this many ms apart — standing in for other members settling up on their
// own end and the notification for each arriving in turn.
const SIMULATED_PAYMENT_INTERVAL_MS = 5000;
const NOTIFICATION_AUTO_DISMISS_MS = 6000;

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
  const [timeline, setTimeline] = useState<TimelineSectionType[]>(() =>
    getStoredTimeline(trip.id, initialTimeline),
  );
  const [tripMembers] = useState<Member[]>(() => getStoredMembers(trip.id, fallbackMembers));
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    getStoredTransactions(trip.id),
  );
  const [notification, setNotification] = useState<{ memberName: string; amount: number } | null>(
    null,
  );
  const paymentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function addTodayItem(item: TimelineItem) {
    setTimeline((prev) => {
      const next = appendToSection(prev, "today", item);
      setStoredTimeline(trip.id, next);
      return next;
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

  // Real payments come from other trip members' own devices, not anything
  // Ari does here — this simulates them arriving one at a time, spaced
  // SIMULATED_PAYMENT_INTERVAL_MS apart, so the notification and
  // Balance/Transactions flow are demonstrable without a real backend.
  // Settling the first debtor removes them from `owed`, which re-triggers
  // this effect and schedules the next one — a self-perpetuating chain
  // rather than an explicit queue.
  useEffect(() => {
    if (owed.length === 0 || paymentTimerRef.current !== null) return;
    const [debtor] = owed;
    const member = memberById(debtor.memberId);
    paymentTimerRef.current = setTimeout(() => {
      paymentTimerRef.current = null;
      const transaction: Transaction = {
        id: `txn-${Date.now()}`,
        memberId: debtor.memberId,
        amount: debtor.amount,
        at: Date.now(),
      };
      setTransactions(addStoredTransaction(trip.id, transaction));
      setNotification({ memberName: member?.name ?? "Someone", amount: debtor.amount });
    }, SIMULATED_PAYMENT_INTERVAL_MS);
    // No cleanup here: a re-render while this timer is in flight (e.g. a
    // new bill changing `owed`) must not cancel a payment already queued —
    // only unmount should ever clear it (see the effect below).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [owed]);

  useEffect(() => {
    return () => {
      if (paymentTimerRef.current !== null) clearTimeout(paymentTimerRef.current);
    };
  }, []);

  // Notification auto-dismisses like a real iOS banner if you don't tap it.
  useEffect(() => {
    if (!notification) return;
    const timeout = setTimeout(() => setNotification(null), NOTIFICATION_AUTO_DISMISS_MS);
    return () => clearTimeout(timeout);
  }, [notification]);

  return (
    <div className="relative flex h-full w-full flex-col bg-background-detail">
      <TripGlow />
      {notification && (
        <TransactionNotification
          memberName={notification.memberName}
          amount={notification.amount}
          onDismiss={() => setNotification(null)}
        />
      )}
      <div className="relative z-10 shrink-0">
        <StatusBar light time="6:45" />
        <DetailHeader tripId={trip.id} title={trip.name} avatar={trip.image} />
        <div className="py-3">
          <SegmentedControl onChange={setActiveTab} />
        </div>
      </div>
      <div className="relative min-h-0 flex-1">
        <TouchScroll className="no-scrollbar relative z-10 h-full overflow-y-auto">
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
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-20 h-3"
          style={{
            background:
              "linear-gradient(to bottom, color-mix(in srgb, var(--color-background-detail) 25%, transparent) 0%, transparent 100%)",
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-20"
          style={{
            background:
              "linear-gradient(to top, var(--color-background-detail) 0%, color-mix(in srgb, var(--color-background-detail) 70%, transparent) 40%, color-mix(in srgb, var(--color-background-detail) 25%, transparent) 75%, transparent 100%)",
          }}
          aria-hidden
        />
      </div>
      <GlassSearchBar onAddClick={() => setSheetOpen(true)} />
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
