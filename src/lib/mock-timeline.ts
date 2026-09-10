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
// dinner), "Tomorrow" is departure morning. Earlier days are included above
// Today so the trip reads as a real multi-day itinerary — the screen scrolls
// to Today on entry (see TripDetailScreen.tsx), with past days reachable by
// scrolling up.
export const mockTimeline: TimelineSection[] = [
  {
    id: "arrival",
    label: "Mon, 5 Sep",
    items: [
      {
        id: "a1",
        type: "transport",
        emoji: "✈️",
        title: "Flight to Lisbon",
        subtitle: "Home → Lisbon Airport",
        time: "8-11am",
      },
      {
        id: "a2",
        type: "activity",
        emoji: "🏠",
        title: "Check-in",
        subtitle: "Alfama Apartment",
        time: "3-3:30pm",
      },
      {
        id: "a3",
        type: "meal",
        emoji: "🍝",
        title: "Welcome Dinner",
        subtitle: "Alfama",
        time: "8-9:30pm",
      },
    ],
  },
  {
    id: "day2",
    label: "Tue, 6 Sep",
    items: [
      {
        id: "d2-1",
        type: "activity",
        emoji: "🚋",
        title: "Tram 28 Tour",
        subtitle: "Alfama",
        time: "9-11am",
      },
      {
        id: "d2-2",
        type: "meal",
        emoji: "🥐",
        title: "Pastéis de Belém",
        subtitle: "Belém",
        time: "12-1pm",
      },
      {
        id: "d2-3",
        type: "activity",
        emoji: "🎶",
        title: "Fado Night",
        subtitle: "Alfama",
        time: "8-10pm",
      },
    ],
  },
  {
    id: "midtrip",
    label: "Wed, 7 Sep",
    items: [
      {
        id: "m1",
        type: "meal",
        emoji: "🥞",
        title: "Brunch",
        subtitle: "Time Out Market",
        time: "11am-12pm",
      },
      {
        id: "m2",
        type: "activity",
        emoji: "🎨",
        title: "LX Factory Visit",
        subtitle: "LX Factory",
        time: "2-4pm",
      },
      {
        id: "m3",
        type: "meal",
        emoji: "🍸",
        title: "Rooftop Drinks",
        subtitle: "Park Bar",
        time: "7-9pm",
      },
    ],
  },
  {
    id: "day4",
    label: "Yesterday, 8 Sep",
    items: [
      {
        id: "d4-1",
        type: "transport",
        emoji: "🚆",
        title: "Train to Sintra",
        subtitle: "Rossio → Sintra",
        time: "9-9:45am",
      },
      {
        id: "d4-2",
        type: "activity",
        emoji: "🏰",
        title: "Pena Palace Visit",
        subtitle: "Sintra",
        time: "10am-1pm",
      },
      {
        id: "d4-3",
        type: "meal",
        emoji: "🍷",
        title: "Dinner in Sintra",
        subtitle: "Sintra",
        time: "7-9pm",
      },
    ],
  },
  {
    id: "today",
    label: "Today, 9 Sep",
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
    ],
  },
  {
    id: "tomorrow",
    label: "Tomorrow, 10 Sep",
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
