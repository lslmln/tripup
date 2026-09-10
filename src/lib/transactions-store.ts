import type { Transaction } from "./transactions";

// Plain in-memory store, keyed by trip id — same pattern as
// members-store.ts/timeline-store.ts.
const transactionsByTrip: Record<string, Transaction[]> = {};

export function getStoredTransactions(tripId: string): Transaction[] {
  return transactionsByTrip[tripId] ?? [];
}

export function addStoredTransaction(tripId: string, transaction: Transaction): Transaction[] {
  const next = [transaction, ...(transactionsByTrip[tripId] ?? [])];
  transactionsByTrip[tripId] = next;
  return next;
}
