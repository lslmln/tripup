"use client";

import { useState } from "react";
import Link from "next/link";
import { CaretLeft, DotsThreeOutline } from "@phosphor-icons/react/dist/ssr";
import AddMemberSheet from "./AddMemberSheet";
import GlassButton from "./GlassButton";
import GlassSearchBar from "./GlassSearchBar";
import StatusBar from "./StatusBar";
import TouchScroll from "./TouchScroll";
import type { Trip } from "@/lib/mock-trips";
import type { Member } from "@/lib/mock-members";
import type { Candidate } from "@/lib/mock-candidates";
import { getStoredMembers, setStoredMembers } from "@/lib/members-store";

export default function MembersScreen({
  trip,
  members: initialMembers,
}: {
  trip: Trip;
  members: Member[];
}) {
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [members, setMembers] = useState<Member[]>(() =>
    getStoredMembers(trip.id, initialMembers),
  );

  const addMembers = (candidates: Candidate[]) => {
    setMembers((prev) => {
      const existingIds = new Set(prev.map((member) => member.id));
      const newMembers = candidates
        .filter((candidate) => !existingIds.has(candidate.id))
        .map(({ id, name, avatar }) => ({ id, name, avatar }));
      const next = [...prev, ...newMembers];
      setStoredMembers(trip.id, next);
      return next;
    });
  };

  return (
    <div className="flex h-full w-full flex-col bg-background-detail">
      <div className="shrink-0">
        <StatusBar light />
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
      </div>

      <div className="relative min-h-0 flex-1">
        <TouchScroll className="no-scrollbar h-full overflow-y-auto pb-23">
          <div className="flex justify-center px-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={trip.image}
              alt=""
              className="h-40 w-40 rounded-full object-cover"
            />
          </div>

          <div className="px-4 pt-3 pb-6">
            <p className="font-karla text-header font-medium leading-none text-content-primary">
              {trip.name}
            </p>
            <p className="mt-1 font-karla text-subtitle leading-none text-content-secondary">
              {trip.dates}
            </p>
          </div>

          <div className="px-4">
            <div className="mb-3 divide-y divide-border-primary overflow-hidden rounded-card bg-card">
              {members.map((member) => (
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
                    <span className="font-karla text-body text-content-primary">
                      Organiser
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </TouchScroll>
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-20"
          style={{
            background:
              "linear-gradient(to top, var(--color-background-detail) 0%, color-mix(in srgb, var(--color-background-detail) 70%, transparent) 40%, color-mix(in srgb, var(--color-background-detail) 25%, transparent) 75%, transparent 100%)",
          }}
          aria-hidden
        />
      </div>

      <GlassSearchBar
        placeholder="Search members"
        onAddClick={() => setAddMemberOpen(true)}
      />
      {addMemberOpen && (
        <AddMemberSheet
          onClose={() => setAddMemberOpen(false)}
          onConfirm={addMembers}
        />
      )}
    </div>
  );
}
