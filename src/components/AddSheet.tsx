"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Lightning,
  ListBullets,
  CaretLeft,
  CaretRight,
  Check,
  CheckSquare,
  MapPin,
  Square,
  XCircle,
  Plus,
} from "@phosphor-icons/react";
import Toggle from "./Toggle";
import GlassButton from "./GlassButton";
import TouchScroll from "./TouchScroll";
import LocationSearchPanel from "./LocationSearchPanel";
import DurationPickerSheet from "./DurationPickerSheet";
import type { Location } from "@/lib/mock-locations";
import { mockMembers, type Member } from "@/lib/mock-members";
import { getStoredMembers } from "@/lib/members-store";

// Sheet-level open/close (backdrop + sheet slide).
const DURATION_MS = 300;
const SHEET_EASE = "cubic-bezier(0.32, 0.72, 0, 1)";

// Screen-to-screen transition: fade the old content out, resize the sheet
// to the new screen's height, then fade the new content in. Exits are
// shorter than entrances (asymmetric timing); the resize keeps the sheet's
// own established curve for cohesion with its open/close motion.
const FADE_OUT_MS = 100;
const RESIZE_MS = 220;
const FADE_IN_MS = 160;

// The sheet never grows past (phone screen height - status bar clearance),
// matching AddMemberSheet's top-11 convention for how much of the screen a
// sheet may cover. Beyond that, its content scrolls instead of the sheet
// (and the whole modal) growing off-screen.
const STATUS_BAR_CLEARANCE = 44;
// Handle bar (16 margin + 6 height) + sheet's own pt-3 (12) + pb-16 (64).
const SHEET_CHROME_HEIGHT = 16 + 6 + 12 + 64;

const DEFAULT_DURATION_MINUTES = 30;

function formatDuration(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} hr`;
  return `${hours} hr ${minutes} min`;
}

function SheetOption({
  icon,
  title,
  subtitle,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-card bg-card-light px-4 py-3 text-left transition-transform duration-150 ease-out active:scale-[0.98]"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-icon-neutral text-content-primary">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="font-karla text-body font-medium text-content-primary">
          {title}
        </span>
        {subtitle && (
          <span className="font-karla text-subtitle text-content-secondary">
            {subtitle}
          </span>
        )}
      </div>
    </button>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
  bordered = true,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  bordered?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between px-4 py-3 ${bordered ? "border-t border-border-primary" : ""}`}
    >
      <span className="font-karla text-body font-medium text-content-primary">
        {label}
      </span>
      <Toggle checked={checked} onChange={onChange} ariaLabel={label} />
    </div>
  );
}

function LocationRow({
  location,
  onEdit,
  onDelete,
}: {
  location: Location | null;
  onEdit: () => void;
  onDelete: () => void;
}) {
  if (!location) {
    return (
      <button
        type="button"
        onClick={onEdit}
        className="flex w-full items-center gap-3 px-4 py-4 text-left"
      >
        <span className="flex-1 font-karla text-body text-content-secondary">Location</span>
        <MapPin size={20} className="shrink-0 text-content-secondary" />
      </button>
    );
  }
  return (
    <div className="flex w-full items-center gap-3 px-4 py-4">
      <button type="button" onClick={onEdit} className="flex flex-1 flex-col text-left">
        <span className="font-karla text-body font-medium text-content-primary">
          {location.name}
        </span>
        <span className="font-karla text-subtitle text-content-secondary">
          {location.subtitle}
        </span>
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label="Remove location"
        className="shrink-0 text-content-secondary"
      >
        <XCircle size={20} weight="fill" />
      </button>
    </div>
  );
}

type PollToggles = {
  limitDuration: boolean;
  multipleAnswers: boolean;
  addingOptions: boolean;
  revoting: boolean;
  showWhoVoted: boolean;
};

const INITIAL_TOGGLES: PollToggles = {
  limitDuration: false,
  multipleAnswers: false,
  addingOptions: false,
  revoting: false,
  showWhoVoted: false,
};

type Screen = "menu" | "poll" | "location" | "activity";

export default function AddSheet({
  tripId,
  onClose,
}: {
  tripId: string;
  onClose: () => void;
}) {
  const [closing, setClosing] = useState(false);
  const [screen, setScreen] = useState<Screen>("menu");
  const [contentVisible, setContentVisible] = useState(true);
  const [fadeDuration, setFadeDuration] = useState(FADE_IN_MS);
  const [toggles, setToggles] = useState<PollToggles>(INITIAL_TOGGLES);
  const [locations, setLocations] = useState<(Location | null)[]>([null]);
  const [locationSheetTarget, setLocationSheetTarget] = useState<number | null>(null);
  const [locationQuery, setLocationQuery] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(DEFAULT_DURATION_MINUTES);
  const [durationPickerOpen, setDurationPickerOpen] = useState(false);
  const [createActivity, setCreateActivity] = useState(true);
  const [activityTitle, setActivityTitle] = useState("");
  // Only trip members are eligible attendees — the same roster the trip's
  // Members screen shows, not the wider candidate pool used to invite people.
  const [tripMembers] = useState<Member[]>(() => getStoredMembers(tripId, mockMembers));
  const [attendeeIds, setAttendeeIds] = useState<string[]>(() =>
    tripMembers.map((member) => member.id),
  );
  const [bodyHeight, setBodyHeight] = useState<number | null>(null);

  const backdropRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);
  const pollPanelRef = useRef<HTMLDivElement>(null);
  const locationPanelRef = useRef<HTMLDivElement>(null);
  const activityPanelRef = useRef<HTMLDivElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const pendingScreenRef = useRef<Screen | null>(null);
  const timeoutsRef = useRef<number[]>([]);

  function panelRefFor(s: Screen) {
    if (s === "menu") return menuPanelRef;
    if (s === "poll") return pollPanelRef;
    if (s === "activity") return activityPanelRef;
    return locationPanelRef;
  }

  // Sheets cap at (phone screen height - status bar clearance); beyond that
  // the content scrolls instead of the sheet growing past the screen.
  function clampToMaxHeight(natural: number) {
    const screenHeight = backdropRef.current?.clientHeight;
    if (!screenHeight) return natural;
    const max = screenHeight - STATUS_BAR_CLEARANCE - SHEET_CHROME_HEIGHT;
    return Math.min(natural, max);
  }

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  // Every screen is always mounted, stacked on top of each other. At rest,
  // the wrapper's height tracks whichever one is active (they're absolutely
  // positioned, so they don't contribute to layout height on their own).
  // During a navigateTo() sequence this effect stands down — the sequence
  // drives bodyHeight itself, staged behind the content fade.
  //
  // Depends on a filled/empty signature rather than just locations.length:
  // clearing the last remaining row's content (see handleDeleteLocation)
  // changes its height (two lines -> one) without changing the array length.
  const locationsSignature = locations.map((l) => (l ? "1" : "0")).join("");
  useLayoutEffect(() => {
    if (pendingScreenRef.current) return;
    const activePanel = panelRefFor(screen).current;
    if (activePanel) setBodyHeight(clampToMaxHeight(activePanel.scrollHeight));
  }, [screen, locationsSignature, toggles.limitDuration, createActivity]);

  // Focus the location search input once its screen has finished fading in.
  useEffect(() => {
    if (screen === "location" && contentVisible) {
      locationInputRef.current?.focus();
    }
  }, [screen, contentVisible]);

  // Fade the current screen out, resize the sheet to the target screen's
  // height while both are invisible, then fade the target screen in.
  function navigateTo(target: Screen) {
    if (target === screen || pendingScreenRef.current) return;
    pendingScreenRef.current = target;
    setFadeDuration(FADE_OUT_MS);
    setContentVisible(false);

    const t1 = window.setTimeout(() => {
      const nextPanel = panelRefFor(target).current;
      if (nextPanel) setBodyHeight(clampToMaxHeight(nextPanel.scrollHeight));
      setScreen(target);

      const t2 = window.setTimeout(() => {
        setFadeDuration(FADE_IN_MS);
        setContentVisible(true);
        pendingScreenRef.current = null;
      }, RESIZE_MS);
      timeoutsRef.current.push(t2);
    }, FADE_OUT_MS);
    timeoutsRef.current.push(t1);
  }

  // Mirrors the entrance (sheet-enter/backdrop-enter's @starting-style slide
  // + fade) on the way out: play the reverse transform/opacity imperatively,
  // then unmount via onClose only once it's finished, instead of vanishing
  // the instant the backdrop is tapped.
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

  function updateToggle(key: keyof PollToggles) {
    return (value: boolean) => setToggles((prev) => ({ ...prev, [key]: value }));
  }

  function toggleAttendee(id: string) {
    setAttendeeIds((prev) =>
      prev.includes(id) ? prev.filter((existing) => existing !== id) : [...prev, id],
    );
  }

  function openLocationSearch(index: number) {
    setLocationSheetTarget(index);
    setLocationQuery("");
    navigateTo("location");
  }

  // The trailing "Add an option" action reuses the last slot if it's still
  // empty, rather than stacking a second empty row.
  function handleAddOption() {
    const lastIndex = locations.length - 1;
    if (locations[lastIndex] === null) {
      openLocationSearch(lastIndex);
    } else {
      setLocations((prev) => [...prev, null]);
      openLocationSearch(locations.length);
    }
  }

  function handleLocationSelect(location: Location) {
    const target = locationSheetTarget;
    if (target === null) return;
    setLocations((prev) => prev.map((loc, i) => (i === target ? location : loc)));
    setLocationSheetTarget(null);
    navigateTo("poll");
  }

  // Removes the row, except when it's the last one left — then just clear
  // its content back to an empty "Location" placeholder, since there's
  // always at least one row.
  function handleDeleteLocation(index: number) {
    setLocations((prev) => (prev.length === 1 ? [null] : prev.filter((_, i) => i !== index)));
  }

  const locationExcludeIds =
    locationSheetTarget === null
      ? []
      : locations
          .filter((_, i) => i !== locationSheetTarget)
          .filter((loc): loc is Location => loc !== null)
          .map((loc) => loc.id);

  return (
    <>
      <div
        ref={backdropRef}
        className="backdrop-enter absolute inset-0 z-40 bg-black/60"
        onClick={() => setClosing(true)}
      />
      <div
        ref={sheetRef}
        className="sheet-enter absolute inset-x-0 bottom-0 z-50 overflow-hidden rounded-t-[32px] bg-card pb-16 pt-3"
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-white/30" />

        <TouchScroll
          className="no-scrollbar relative overflow-y-auto transition-[height] ease-[cubic-bezier(0.32,0.72,0,1)]"
          style={{ height: bodyHeight ?? undefined, transitionDuration: `${RESIZE_MS}ms` }}
        >
          <div
            ref={menuPanelRef}
            inert={screen !== "menu"}
            className="absolute inset-x-0 top-0 transition-opacity ease-out"
            style={{
              opacity: screen === "menu" && contentVisible ? 1 : 0,
              transitionDuration: `${fadeDuration}ms`,
            }}
          >
            <p className="mb-4 text-center font-karla text-nav font-medium text-content-primary">
              Add
            </p>
            <div className="flex flex-col gap-3 px-4">
              <SheetOption icon={<Lightning size={20} weight="fill" />} title="Activity" />
              <SheetOption
                icon={<ListBullets size={20} />}
                title="Poll"
                subtitle="When you can't choose where to eat"
                onClick={() => navigateTo("poll")}
              />
            </div>
          </div>

          <div
            ref={pollPanelRef}
            inert={screen !== "poll"}
            className="absolute inset-x-0 top-0 transition-opacity ease-out"
            style={{
              opacity: screen === "poll" && contentVisible ? 1 : 0,
              transitionDuration: `${fadeDuration}ms`,
            }}
          >
            <div className="flex items-center justify-between px-4">
              <GlassButton ariaLabel="Back" onClick={() => navigateTo("menu")}>
                <CaretLeft size={22} />
              </GlassButton>
              <span className="font-karla text-body font-medium text-content-primary">
                Add poll
              </span>
              <GlassButton ariaLabel="Save poll" onClick={() => setClosing(true)}>
                <Check size={22} />
              </GlassButton>
            </div>

            <div className="flex flex-col gap-4 px-4 pt-4">
              <input
                type="text"
                placeholder="Question"
                className="w-full rounded-card bg-card-light px-4 py-4 font-karla text-body text-content-primary placeholder:text-content-secondary focus:outline-none"
              />

              <div className="divide-y divide-border-primary overflow-hidden rounded-card bg-card-light">
                {locations.map((location, index) => (
                  <LocationRow
                    key={index}
                    location={location}
                    onEdit={() => openLocationSearch(index)}
                    onDelete={() => handleDeleteLocation(index)}
                  />
                ))}
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="flex w-full items-center gap-3 px-4 py-4 text-left"
                >
                  <span className="flex-1 font-karla text-body text-content-secondary">
                    Add an option
                  </span>
                  <Plus size={20} className="shrink-0 text-content-secondary" />
                </button>
              </div>

              <div className="overflow-hidden rounded-card bg-card-light">
                <ToggleRow
                  label="Limit duration"
                  checked={toggles.limitDuration}
                  onChange={updateToggle("limitDuration")}
                  bordered={false}
                />
                {toggles.limitDuration && (
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="font-karla text-body font-medium text-content-primary">
                      Duration
                    </span>
                    <button
                      type="button"
                      onClick={() => setDurationPickerOpen(true)}
                      className="rounded-full bg-toggle-off px-3 py-1.5 font-karla text-subtitle text-content-primary transition-transform duration-150 ease-out active:scale-[0.96]"
                    >
                      {formatDuration(durationMinutes)}
                    </button>
                  </div>
                )}
                <ToggleRow
                  label="Allow multiple answers"
                  checked={toggles.multipleAnswers}
                  onChange={updateToggle("multipleAnswers")}
                />
                <ToggleRow
                  label="Allow adding options"
                  checked={toggles.addingOptions}
                  onChange={updateToggle("addingOptions")}
                />
                <ToggleRow
                  label="Allow revoting"
                  checked={toggles.revoting}
                  onChange={updateToggle("revoting")}
                />
                <ToggleRow
                  label="Show who voted"
                  checked={toggles.showWhoVoted}
                  onChange={updateToggle("showWhoVoted")}
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  setCreateActivity(true);
                  navigateTo("activity");
                }}
                className="flex w-full items-center justify-between rounded-card bg-card-light px-4 py-4 text-left"
              >
                <span className="font-karla text-body font-medium text-content-primary">
                  Create activity from poll?
                </span>
                <span className="flex items-center gap-1 font-karla text-body text-content-secondary">
                  {createActivity ? "Yes" : "No"}
                  <CaretRight size={16} />
                </span>
              </button>
            </div>
          </div>

          <div
            ref={activityPanelRef}
            inert={screen !== "activity"}
            className="absolute inset-x-0 top-0 transition-opacity ease-out"
            style={{
              opacity: screen === "activity" && contentVisible ? 1 : 0,
              transitionDuration: `${fadeDuration}ms`,
            }}
          >
            <div className="flex items-center justify-between px-4">
              <GlassButton ariaLabel="Back" onClick={() => navigateTo("poll")}>
                <CaretLeft size={22} />
              </GlassButton>
              <span className="font-karla text-body font-medium text-content-primary">
                Add activity
              </span>
              <GlassButton ariaLabel="Save activity" onClick={() => setClosing(true)}>
                <Check size={22} />
              </GlassButton>
            </div>

            <div className="flex flex-col gap-4 px-4 pt-4">
              <div className="flex items-center justify-between rounded-card bg-card-light px-4 py-4">
                <span className="font-karla text-body font-medium text-content-primary">
                  Create activity from poll?
                </span>
                <Toggle
                  checked={createActivity}
                  onChange={setCreateActivity}
                  ariaLabel="Create activity from poll?"
                />
              </div>

              {createActivity && (
                <>
                  <input
                    type="text"
                    value={activityTitle}
                    onChange={(e) => setActivityTitle(e.target.value)}
                    placeholder="Title"
                    className="w-full rounded-card bg-card-light px-4 py-4 font-karla text-body text-content-primary placeholder:text-content-secondary focus:outline-none"
                  />

                  <div className="overflow-hidden rounded-card bg-card-light">
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="font-karla text-body font-medium text-content-primary">
                        Starts
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-toggle-off px-3 py-1.5 font-karla text-subtitle text-content-primary">
                          June 2024
                        </span>
                        <span className="rounded-full bg-toggle-off px-3 py-1.5 font-karla text-subtitle text-content-primary">
                          9:41 AM
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-border-primary px-4 py-3">
                      <span className="font-karla text-body font-medium text-content-primary">
                        Ends
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-toggle-off px-3 py-1.5 font-karla text-subtitle text-content-primary">
                          June 2024
                        </span>
                        <span className="rounded-full bg-toggle-off px-3 py-1.5 font-karla text-subtitle text-content-primary">
                          9:41 AM
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="divide-y divide-border-primary overflow-hidden rounded-card bg-card-light">
                    {tripMembers.map((member) => {
                      const checked = attendeeIds.includes(member.id);
                      return (
                        <button
                          key={member.id}
                          type="button"
                          onClick={() => toggleAttendee(member.id)}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left focus:outline-none"
                        >
                          {checked ? (
                            <CheckSquare
                              size={24}
                              weight="fill"
                              className="shrink-0"
                              style={{ color: "var(--color-brand)" }}
                            />
                          ) : (
                            <Square size={24} className="shrink-0 text-content-secondary" />
                          )}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={member.avatar}
                            alt=""
                            className="h-11 w-11 shrink-0 rounded-full object-cover"
                          />
                          <span className="font-karla text-body font-medium text-content-primary">
                            {member.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          <div
            ref={locationPanelRef}
            inert={screen !== "location"}
            className="absolute inset-x-0 top-0 transition-opacity ease-out"
            style={{
              opacity: screen === "location" && contentVisible ? 1 : 0,
              transitionDuration: `${fadeDuration}ms`,
            }}
          >
            <LocationSearchPanel
              query={locationQuery}
              onQueryChange={setLocationQuery}
              excludeIds={locationExcludeIds}
              onSelect={handleLocationSelect}
              onBack={() => navigateTo("poll")}
              inputRef={locationInputRef}
            />
          </div>
        </TouchScroll>
      </div>

      {durationPickerOpen && (
        <DurationPickerSheet
          minutes={durationMinutes}
          onChange={setDurationMinutes}
          onClose={() => setDurationPickerOpen(false)}
        />
      )}
    </>
  );
}
