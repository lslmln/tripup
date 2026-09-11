"use client";

import type { RefObject } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { mockLocations, type Location } from "@/lib/mock-locations";

// Content only — no backdrop/mount lifecycle, and no header of its own: its
// back/title row lives in AddSheet's persistent nav header instead, outside
// the crossfading, height-measured body this panel renders into. This is
// one screen inside AddSheet's single shared sheet (menu/poll/location all
// crossfade + resize the same physical sheet), not a separate stacked modal.
export default function LocationSearchPanel({
  query,
  onQueryChange,
  excludeIds,
  onSelect,
  inputRef,
}: {
  query: string;
  onQueryChange: (query: string) => void;
  excludeIds: string[];
  onSelect: (location: Location) => void;
  inputRef: RefObject<HTMLInputElement | null>;
}) {
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
      <div className="mx-4 mt-4 flex items-center gap-2 rounded-full bg-card-light px-4 py-3">
        <MagnifyingGlass size={20} className="shrink-0 text-content-secondary" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search"
          className="flex-1 bg-transparent font-karla text-body text-content-primary placeholder:text-content-secondary focus:outline-none"
        />
      </div>

      <div className="px-4 pt-3">
        <div className="divide-y divide-border-primary">
          {results.map((location) => (
            <button
              key={location.id}
              type="button"
              onClick={() => onSelect(location)}
              className="flex w-full items-center gap-3 py-3 text-left"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-card-light text-[18px]">
                {location.emoji}
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
    </>
  );
}
