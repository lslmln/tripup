"use client";

import { mockLocations, type Location } from "@/lib/mock-locations";

// Content only — no backdrop/mount lifecycle, and no header or search bar of
// its own: its back/title row and search input live in AddSheet's persistent
// nav header and floating bottom bar instead, outside the crossfading,
// height-measured body this panel renders into. This is one screen inside
// AddSheet's single shared sheet (menu/poll/location all crossfade + resize
// the same physical sheet), not a separate stacked modal.
export default function LocationSearchPanel({
  query,
  excludeIds,
  onSelect,
}: {
  query: string;
  excludeIds: string[];
  onSelect: (location: Location) => void;
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
    <div className="pt-3 pb-23">
      <div className="divide-y divide-border-primary">
        {results.map((location) => (
          <button
            key={location.id}
            type="button"
            onClick={() => onSelect(location)}
            className="flex w-full items-center gap-3 px-4 py-3 text-left"
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
  );
}
