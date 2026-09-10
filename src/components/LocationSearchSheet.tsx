"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { CaretLeft, MagnifyingGlass, MapPin } from "@phosphor-icons/react";
import GlassButton from "./GlassButton";
import StatusBar from "./StatusBar";
import { mockLocations, type Location } from "@/lib/mock-locations";

const DURATION_MS = 300;
const SHEET_EASE = "cubic-bezier(0.32, 0.72, 0, 1)";

export default function LocationSearchSheet({
  excludeIds,
  onSelect,
  onClose,
}: {
  excludeIds: string[];
  onSelect: (location: Location) => void;
  onClose: () => void;
}) {
  const [closing, setClosing] = useState(false);
  const [query, setQuery] = useState("");
  const backdropRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Mirrors AddSheet/AddMemberSheet's entrance on the way out.
  useLayoutEffect(() => {
    if (!closing) return;
    const backdrop = backdropRef.current;
    const sheet = sheetRef.current;
    if (backdrop) {
      backdrop.style.transition = "opacity 300ms ease-out";
      backdrop.style.opacity = "0";
    }
    if (sheet) {
      sheet.style.transition = `transform ${DURATION_MS}ms ${SHEET_EASE}`;
      sheet.style.transform = "translateY(100%)";
    }
    const t = setTimeout(onClose, DURATION_MS);
    return () => clearTimeout(t);
  }, [closing, onClose]);

  const results = mockLocations.filter((location) => {
    if (excludeIds.includes(location.id)) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      location.name.toLowerCase().includes(q) || location.subtitle.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <div
        ref={backdropRef}
        className="backdrop-enter absolute inset-0 z-40 bg-black/60"
        onClick={() => setClosing(true)}
      />
      <div className="absolute inset-x-0 top-0 z-50">
        <StatusBar light />
      </div>
      <div
        ref={sheetRef}
        className="sheet-enter absolute inset-x-0 top-11 bottom-0 z-50 flex flex-col overflow-hidden rounded-t-[32px] bg-card"
      >
        <div className="mx-auto mt-3 mb-1 h-1.5 w-10 shrink-0 rounded-full bg-white/30" />

        <div className="flex shrink-0 items-center justify-between px-4 py-3">
          <GlassButton ariaLabel="Back" onClick={() => setClosing(true)}>
            <CaretLeft size={22} />
          </GlassButton>
          <span className="font-karla text-body font-medium text-content-primary">
            Location
          </span>
          <div className="h-11 w-11 shrink-0" aria-hidden />
        </div>

        <div className="mx-4 mt-2 flex shrink-0 items-center gap-2 rounded-full bg-card-light px-4 py-3">
          <MagnifyingGlass size={20} className="shrink-0 text-content-secondary" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="flex-1 bg-transparent font-karla text-body text-content-primary placeholder:text-content-secondary focus:outline-none"
          />
        </div>

        <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-4 pt-3 pb-8">
          <div className="divide-y divide-border-primary">
            {results.map((location) => (
              <button
                key={location.id}
                type="button"
                onClick={() => onSelect(location)}
                className="flex w-full items-center gap-3 py-3 text-left"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-icon-neutral text-content-primary">
                  <MapPin size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="font-karla text-body font-medium text-content-primary">
                    {location.name}
                  </span>
                  <span className="font-karla text-subtitle text-content-secondary">
                    {location.subtitle}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
