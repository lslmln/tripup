import type { TimelineItem, TimelineSection } from "./mock-timeline";

// Plain in-memory store, keyed by trip id — same pattern as members-store.ts.
// Lives at module scope so it survives client-side navigation away from and
// back to a trip's detail page, but resets on a full page reload like any
// other in-memory JS state; no persistence layer needed for a mock-data
// prototype.
const timelineByTrip: Record<string, TimelineSection[]> = {};

export function getStoredTimeline(tripId: string, fallback: TimelineSection[]): TimelineSection[] {
  if (!timelineByTrip[tripId]) {
    timelineByTrip[tripId] = fallback;
  }
  return timelineByTrip[tripId];
}

export function setStoredTimeline(tripId: string, timeline: TimelineSection[]) {
  timelineByTrip[tripId] = timeline;
}

// Appends an item to the named section (e.g. "today"), leaving every other
// section untouched. If the section doesn't exist the timeline is returned
// unchanged — this prototype only ever targets "today".
export function appendToSection(
  timeline: TimelineSection[],
  sectionId: string,
  item: TimelineItem,
): TimelineSection[] {
  return timeline.map((section) =>
    section.id === sectionId ? { ...section, items: [...section.items, item] } : section,
  );
}
