"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CaretLeft,
  CaretRight,
  DotsThreeOutline,
  MapPin,
  Plus,
  Warning,
} from "@phosphor-icons/react";
import GlassButton from "./GlassButton";
import SegmentedControl from "./SegmentedControl";
import StatusBar from "./StatusBar";
import TouchScroll from "./TouchScroll";
import { getStoredTimeline } from "@/lib/timeline-store";
import { getStoredMembers } from "@/lib/members-store";
import type { Trip } from "@/lib/mock-trips";
import type { Member } from "@/lib/mock-members";
import type { TimelineItem, TimelineSection } from "@/lib/mock-timeline";

const PENDING_COLOR = "#FFDA48";
const DETAIL_TABS = ["Details", "Bill"];

function formatCountdown(remainingMs: number) {
  const totalSeconds = Math.max(0, Math.round(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")} min left`;
}

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
  const [item] = useState<TimelineItem | null>(() =>
    findItem(getStoredTimeline(trip.id, fallbackTimeline), activityId),
  );
  const [tripMembers] = useState<Member[]>(() => getStoredMembers(trip.id, fallbackMembers));
  const [answered, setAnswered] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  // Ticks the countdown once a second — only while a poll deadline exists.
  useEffect(() => {
    if (!item?.pollDeadline) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [item?.pollDeadline]);

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
  const leadingOption = item.pollOptions?.[0] ?? null;

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
              <Warning size={20} weight="fill" style={{ color: PENDING_COLOR }} />
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

        <SegmentedControl tabs={DETAIL_TABS} />
      </div>

      <div className="relative min-h-0 flex-1">
        <TouchScroll className="no-scrollbar h-full overflow-y-auto pt-4 pb-23">
          <div className="px-4">
            <h2 className="mb-3 font-karla text-header font-medium text-content-primary">
              Location
            </h2>

            {item.pending ? (
              <div className="flex items-center justify-between rounded-card bg-card-light px-4 py-4">
                <div className="flex flex-col">
                  <span className="font-karla text-body font-medium text-content-primary">
                    Timed poll
                  </span>
                  <span className="font-karla text-subtitle" style={{ color: PENDING_COLOR }}>
                    {remainingMs !== null ? formatCountdown(remainingMs) : "No time limit"}
                  </span>
                </div>
                {answered ? (
                  leadingOption && (
                    <div className="flex items-center gap-1">
                      <div className="flex flex-col items-end">
                        <span className="font-karla text-body font-medium text-content-primary">
                          {leadingOption.name}
                        </span>
                        <span className="font-karla text-subtitle text-content-secondary">
                          {leadingOption.subtitle}
                        </span>
                      </div>
                      <CaretRight size={16} className="shrink-0 text-content-secondary" />
                    </div>
                  )
                ) : (
                  <button
                    type="button"
                    onClick={() => setAnswered(true)}
                    className="font-karla text-body font-medium"
                    style={{ color: "var(--color-brand)" }}
                  >
                    Answer
                  </button>
                )}
              </div>
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
              <button
                type="button"
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <span className="font-karla text-body text-content-secondary">Add a member</span>
                <Plus size={20} className="shrink-0 text-content-secondary" />
              </button>
            </div>
          </div>
        </TouchScroll>
      </div>
    </div>
  );
}
