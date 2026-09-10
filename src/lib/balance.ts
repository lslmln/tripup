import type { TimelineSection } from "./mock-timeline";
import type { Transaction } from "./transactions";
import { splitShare } from "./bills";

export type OwedEntry = { memberId: string; amount: number };

// Every bill's payer is the current user (Ari — see CURRENT_USER_ID), so
// summing every split member's share across every bill anywhere in the
// trip, minus whatever they've already paid back, is exactly what's still
// owed to Ari.
export function computeOwed(
  timeline: TimelineSection[],
  transactions: Transaction[],
): OwedEntry[] {
  const owed = new Map<string, number>();
  for (const section of timeline) {
    for (const item of section.items) {
      for (const bill of item.bills ?? []) {
        const share = splitShare(bill.amount, bill.splitWith.length);
        for (const memberId of bill.splitWith) {
          if (memberId === bill.paidBy) continue;
          owed.set(memberId, (owed.get(memberId) ?? 0) + share);
        }
      }
    }
  }
  for (const transaction of transactions) {
    owed.set(transaction.memberId, (owed.get(transaction.memberId) ?? 0) - transaction.amount);
  }
  return Array.from(owed.entries())
    .filter(([, amount]) => amount > 0.005)
    .map(([memberId, amount]) => ({ memberId, amount }));
}
