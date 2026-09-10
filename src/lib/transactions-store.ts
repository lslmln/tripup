import type { Transaction } from "./transactions";

// Plain in-memory store, keyed by trip id — same pattern as
// members-store.ts/timeline-store.ts. Nothing writes to this yet (no
// multi-user backend or notification system to trigger a settlement), so
// in practice this always reads back empty for now — see Balance's own
// note in TripDetailScreen.
const transactionsByTrip: Record<string, Transaction[]> = {};

export function getStoredTransactions(tripId: string): Transaction[] {
  return transactionsByTrip[tripId] ?? [];
}
