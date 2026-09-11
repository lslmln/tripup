// Module-scope, same pattern as timeline/members/transactions-store — tracks
// which trips already have a poll created during this session, so the Add
// sheet can disable "Poll" after the first one instead of letting a user
// spin up several at once. Resets on a full page reload like every other
// in-memory store here, not persisted.
const tripsWithPoll = new Set<string>();

export function hasCreatedPoll(tripId: string): boolean {
  return tripsWithPoll.has(tripId);
}

export function markPollCreated(tripId: string): void {
  tripsWithPoll.add(tripId);
}
