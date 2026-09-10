// Shared by the Add activity screen's compact Starts/Ends chips and the
// DateTimePickerSheet that edits them, so both always agree on format.
export function formatDateChip(date: Date) {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function formatTimeChip(date: Date) {
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}
