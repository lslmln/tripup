"use client";

import { ArrowCounterClockwise } from "@phosphor-icons/react";

// Lives outside PhoneFrame, in the desktop chrome around the simulator.
// Every trip's timeline/members/transactions live in plain module-scope
// stores (see timeline-store.ts etc.) that only reset on a full reload, so
// a hard navigation back to "/" is the simplest way to actually undo every
// action taken during the demo rather than just resetting component state.
export default function ReplayButton() {
  return (
    <button
      type="button"
      onClick={() => {
        // A hard reload, not router navigation — the trip stores are plain
        // module-scope objects that only reset when the JS runtime itself
        // reinitializes, so a client-side push to "/" would leave every
        // store's state (and any in-flight timers) exactly as it was.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = "/";
      }}
      className="fixed top-6 right-6 z-50 hidden items-center gap-2 rounded-full bg-neutral-900 px-4 py-2.5 font-karla text-sm font-medium text-white shadow-lg transition hover:bg-neutral-800 md:flex"
    >
      <ArrowCounterClockwise size={16} weight="bold" />
      Replay
    </button>
  );
}
