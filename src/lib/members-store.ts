import type { Member } from "./mock-members";

// Plain in-memory store, keyed by trip id. Lives at module scope so it
// survives client-side navigation away from and back to a trip's members
// page (the module isn't re-evaluated), but resets on a full page reload
// like any other in-memory JS state — no persistence layer needed for a
// mock-data prototype.
const membersByTrip: Record<string, Member[]> = {};

export function getStoredMembers(tripId: string, fallback: Member[]): Member[] {
  if (!membersByTrip[tripId]) {
    membersByTrip[tripId] = fallback;
  }
  return membersByTrip[tripId];
}

export function setStoredMembers(tripId: string, members: Member[]) {
  membersByTrip[tripId] = members;
}
