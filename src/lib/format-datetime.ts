// Shared by the Add activity screen's compact Starts/Ends chips and the
// DateTimePickerSheet that edits them, so both always agree on format.
export function formatDateChip(date: Date) {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function formatTimeChip(date: Date) {
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

// This prototype's fictional "now" — the trip detail screen's status bar
// always reads 6:45pm (see TripDetailScreen's <StatusBar time="6:45" />), so
// a freshly opened Add activity sheet should default to that same moment
// rather than whatever the real device clock says.
export function getMockNow() {
  const now = new Date();
  now.setHours(18, 45, 0, 0);
  return now;
}

// Matches the mock timeline's compact "2-4pm" / "8-9:30pm" / "4:30-5pm"
// convention: minutes are dropped when on the hour, and the am/pm suffix is
// only shown once when both ends share a period (otherwise each needs its own).
function formatClockPart(hour24: number, minute: number) {
  const period = hour24 < 12 ? "am" : "pm";
  const hour12 = ((hour24 + 11) % 12) + 1;
  const number = minute === 0 ? `${hour12}` : `${hour12}:${String(minute).padStart(2, "0")}`;
  return { number, period };
}

export function formatTimeRange(start: Date, end: Date) {
  const from = formatClockPart(start.getHours(), start.getMinutes());
  const to = formatClockPart(end.getHours(), end.getMinutes());
  const fromLabel = from.period === to.period ? from.number : `${from.number}${from.period}`;
  return `${fromLabel}-${to.number}${to.period}`;
}

// Single-point-in-time version of the same compact convention — "8:24pm".
export function formatClockTime(date: Date) {
  const { number, period } = formatClockPart(date.getHours(), date.getMinutes());
  return `${number}${period}`;
}

// When the user leaves the activity title blank, infer one from the time of
// day — the whole point of this prototype's poll flow is picking where to
// eat, so most of these land on a meal name.
export function smartActivityTitle(start: Date) {
  const hour = start.getHours();
  if (hour >= 5 && hour < 11) return "Breakfast";
  if (hour >= 11 && hour < 15) return "Lunch";
  if (hour >= 15 && hour < 17) return "Afternoon Snack";
  if (hour >= 17 && hour < 22) return "Dinner";
  return "Late Night";
}
