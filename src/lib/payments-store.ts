import { scheduleNotification } from "./notifications-store";
import { addStoredTransaction } from "./transactions-store";
import { formatMoney } from "./bills";
import type { Transaction } from "./transactions";

// There's no real multi-user backend here, so a split member paying back
// their share of a bill is simulated: it lands this many ms after the bill
// that created the debt was actually added, not after however long it takes
// the trip screen to next be mounted. Module-scope, not a component effect
// — a bill is added from the activity detail screen, not the trip screen,
// so the countdown has to keep running regardless of which screen the user
// is on afterward, the same way poll-vote arrivals already do (see
// poll-votes-store.ts).
export const SIMULATED_PAYMENT_DELAY_MS = 5000;

export type PaymentArrival = { tripId: string; transaction: Transaction };

type Listener = (arrival: PaymentArrival) => void;

const listeners = new Set<Listener>();
const scheduledIds = new Set<string>();

// One call per debtor on a bill — see ActivityDetailScreen's saveBill,
// which staggers multiple debtors on the same bill delayMs apart the same
// way multiple poll voters are staggered.
export function schedulePayment(
  tripId: string,
  billId: string,
  memberId: string,
  memberName: string,
  amount: number,
  delayMs: number,
) {
  const id = `payment-${billId}-${memberId}`;
  if (scheduledIds.has(id)) return;
  scheduledIds.add(id);
  setTimeout(() => {
    scheduledIds.delete(id);
    const transaction: Transaction = { id: `txn-${id}`, memberId, amount, at: Date.now() };
    addStoredTransaction(tripId, transaction);
    listeners.forEach((listener) => listener({ tripId, transaction }));
    scheduleNotification(
      {
        id,
        icon: "payment",
        title: "Payment received",
        message: `${memberName} paid you $${formatMoney(amount)}`,
        href: `/trip/${tripId}?tab=transactions`,
      },
      0,
    );
  }, delayMs);
}

export function subscribeToPayments(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
