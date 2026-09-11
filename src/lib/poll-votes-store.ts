import { scheduleNotification } from "./notifications-store";

// Companion to notifications-store: schedules a poll vote to actually land
// in the data at the same moment its "so-and-so voted" notification fires,
// instead of the vote already sitting in item.pollVotes from the moment the
// poll is created while only the notification is paced out. Module-scope for
// the same reason notifications are — it has to survive navigating from the
// trip timeline into the poll's own detail screen and back.
export type PollVoteArrival = {
  itemId: string;
  memberId: string;
  optionId: string;
};

type Listener = (arrival: PollVoteArrival) => void;

const listeners = new Set<Listener>();
const scheduledIds = new Set<string>();

export function scheduleVoteArrival(
  itemId: string,
  memberId: string,
  optionId: string,
  memberName: string,
  optionName: string,
  delayMs: number,
) {
  const id = `vote-${itemId}-${memberId}`;
  if (scheduledIds.has(id)) return;
  scheduledIds.add(id);
  setTimeout(() => {
    scheduledIds.delete(id);
    listeners.forEach((listener) => listener({ itemId, memberId, optionId }));
    scheduleNotification(
      { id, icon: "vote", title: "New vote", message: `${memberName} voted for ${optionName}` },
      0,
    );
  }, delayMs);
}

export function subscribeToPollVoteArrivals(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
