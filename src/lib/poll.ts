import type { TimelineItem } from "./mock-timeline";
import type { Location } from "./mock-locations";
import { CURRENT_USER_ID } from "./mock-members";

// Deterministic fake votes from every attendee except the current user (who
// hasn't answered yet), so a freshly created poll already has some life to
// it instead of a flat 0-0-0. Everyone piles onto the first option except
// the last "other" attendee, who breaks for the second — a simple, always-
// reproducible stand-in for the voting simulation this prototype doesn't have.
export function seedPollVotes(
  attendeeIds: string[],
  optionIds: string[],
): Record<string, string> {
  if (optionIds.length === 0) return {};
  const others = attendeeIds.filter((id) => id !== CURRENT_USER_ID);
  const votes: Record<string, string> = {};
  others.forEach((memberId, index) => {
    const isLastOther = index === others.length - 1 && others.length > 1;
    votes[memberId] = isLastOther && optionIds.length > 1 ? optionIds[1] : optionIds[0];
  });
  return votes;
}

export function votersForOption(
  pollVotes: Record<string, string> | undefined,
  optionId: string,
): string[] {
  if (!pollVotes) return [];
  return Object.entries(pollVotes)
    .filter(([, votedFor]) => votedFor === optionId)
    .map(([memberId]) => memberId);
}

export function pickPollWinner(
  options: Location[],
  pollVotes: Record<string, string> | undefined,
): Location | null {
  if (options.length === 0) return null;
  let winner = options[0];
  let winnerCount = votersForOption(pollVotes, winner.id).length;
  for (const option of options.slice(1)) {
    const count = votersForOption(pollVotes, option.id).length;
    if (count > winnerCount) {
      winner = option;
      winnerCount = count;
    }
  }
  return winner;
}

// Turns a pending poll placeholder into a decided activity once its
// deadline passes — the winning option's emoji/name/category replace the
// warning icon and "Poll in progress" subtitle.
export function resolvePollItem(item: TimelineItem): TimelineItem {
  const winner = item.pollOptions ? pickPollWinner(item.pollOptions, item.pollVotes) : null;
  if (!winner) return { ...item, pending: false };
  return {
    ...item,
    pending: false,
    emoji: winner.emoji,
    title: `${item.title} at ${winner.name}`,
    subtitle: winner.subtitle,
  };
}

export function formatCountdown(remainingMs: number) {
  const totalSeconds = Math.max(0, Math.round(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")} min left`;
}
