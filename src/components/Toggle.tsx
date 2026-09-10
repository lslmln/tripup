"use client";

// Matches Apple's UISwitch proportions: 51x31 track, 27x27 knob, 2px inset.
const TRACK_WIDTH = 51;
const TRACK_HEIGHT = 31;
const KNOB_SIZE = 27;
const KNOB_INSET = 2;
const KNOB_TRAVEL = TRACK_WIDTH - KNOB_SIZE - KNOB_INSET * 2;

export default function Toggle({
  checked,
  onChange,
  ariaLabel,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={`relative shrink-0 rounded-full transition-colors duration-200 ease-out ${
        checked ? "bg-toggle-on" : "bg-toggle-off"
      }`}
      style={{ width: TRACK_WIDTH, height: TRACK_HEIGHT }}
    >
      <span
        className="absolute rounded-full bg-content-primary shadow-md transition-transform duration-200 ease-out"
        style={{
          width: KNOB_SIZE,
          height: KNOB_SIZE,
          top: KNOB_INSET,
          left: KNOB_INSET,
          transform: checked ? `translateX(${KNOB_TRAVEL}px)` : "translateX(0)",
        }}
      />
    </button>
  );
}
