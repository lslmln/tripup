// Module-scope, so scheduled notifications survive navigating between pages
// (TripDetailScreen <-> ActivityDetailScreen, say) the same way the
// timeline/members/transactions stores do — a page unmounting shouldn't
// cancel a "so-and-so voted" alert just because you tapped into the very
// poll that triggered it.
export type PendingNotification = {
  id: string;
  icon: "vote" | "payment";
  title: string;
  message: string;
};

type Listener = (notification: PendingNotification) => void;

const listeners = new Set<Listener>();
const scheduledIds = new Set<string>();

// delayMs schedules a real timer here, at module scope, instead of inside a
// component effect — the timer isn't tied to any component's mount/unmount.
// scheduledIds guards against double-scheduling the same notification (e.g.
// a component re-running its scheduling logic on re-render).
export function scheduleNotification(data: PendingNotification, delayMs: number) {
  if (scheduledIds.has(data.id)) return;
  scheduledIds.add(data.id);
  setTimeout(() => {
    scheduledIds.delete(data.id);
    listeners.forEach((listener) => listener(data));
  }, delayMs);
}

export function subscribeToNotifications(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
