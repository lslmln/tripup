export type TimelineItemType = "meal" | "activity" | "transport";

export type TimelineItem = {
  id: string;
  type: TimelineItemType;
  emoji: string;
  title: string;
  subtitle: string;
  time: string;
};

export type TimelineSection = {
  id: string;
  label: string;
  items: TimelineItem[];
};

// Matches the assignment's user scenario: "Today" is the last evening of the
// Lisbon trip (afternoon sightseeing already wrapped, group heading to
// dinner), and "Tomorrow" is departure morning — the transport back home.
export const mockTimeline: TimelineSection[] = [
  {
    id: "today",
    label: "Today",
    items: [
      {
        id: "1",
        type: "activity",
        emoji: "🏰",
        title: "Belém Tower Tour",
        subtitle: "Belém",
        time: "2-4pm",
      },
      {
        id: "2",
        type: "activity",
        emoji: "🚶",
        title: "Walk Back to the House",
        subtitle: "Alfama",
        time: "4:30-5pm",
      },
      {
        id: "3",
        type: "meal",
        emoji: "🍷",
        title: "Dinner at A Cevicheria",
        subtitle: "Alfama",
        time: "8-10pm",
      },
    ],
  },
  {
    id: "tomorrow",
    label: "Tomorrow",
    items: [
      {
        id: "4",
        type: "activity",
        emoji: "🧳",
        title: "Pack & Checkout",
        subtitle: "Alfama Apartment",
        time: "8-9am",
      },
      {
        id: "5",
        type: "transport",
        emoji: "🚕",
        title: "Airport Transfer",
        subtitle: "Alfama → Lisbon Airport",
        time: "9:30-10am",
      },
      {
        id: "6",
        type: "transport",
        emoji: "✈️",
        title: "Flight Home",
        subtitle: "Lisbon → Home",
        time: "11:30am",
      },
    ],
  },
];
