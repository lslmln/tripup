"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Lightning,
  ListBullets,
  CaretLeft,
  CaretRight,
  Check,
  CheckSquare,
  MagnifyingGlass,
  MapPin,
  Square,
  XCircle,
  Plus,
} from "@phosphor-icons/react";
import Toggle from "./Toggle";
import GlassButton from "./GlassButton";
import SheetScrollFade from "./SheetScrollFade";
import TouchScroll from "./TouchScroll";
import LocationSearchPanel from "./LocationSearchPanel";
import DurationPickerSheet from "./DurationPickerSheet";
import DateTimeFieldEditor from "./DateTimeFieldEditor";
import { glassStyle } from "./glass";
import { useScrollEdges } from "@/hooks/useScrollEdges";
import type { Location } from "@/lib/mock-locations";
import { mockMembers, type Member } from "@/lib/mock-members";
import { getStoredMembers } from "@/lib/members-store";
import {
  formatDateChip,
  formatTimeChip,
  formatTimeRange,
  getMockNow,
  smartActivityTitle,
} from "@/lib/format-datetime";
import { seedPollVotes } from "@/lib/poll";
import type { TimelineItem } from "@/lib/mock-timeline";

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

// The sheet never grows past (phone screen height - top clearance),
// matching AddMemberSheet's top-17 convention for how much of the screen a
// sheet may cover. Beyond that, its content scrolls instead of the sheet
// (and the whole modal) growing off-screen.
const STATUS_BAR_CLEARANCE = 68;
// Every screen's nav row (back / title / trailing action) is a fixed 44px —
// same height as the GlassButton circles it's built from, no screen adds its
// own vertical padding around it.
const HEADER_HEIGHT = 44;
// Handle bar (16 margin + 6 height) + nav row (44) + sheet's own pt-3 (12) +
// pb-16 (64).
const SHEET_CHROME_HEIGHT = 16 + 6 + HEADER_HEIGHT + 12 + 64;

const DEFAULT_DURATION_MINUTES = 5;

function formatDuration(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} hr`;
  return `${hours} hr ${minutes} min`;
}

// Fills a nav row's back/trailing-action slot when that screen has none, so
// the title stays centered and every screen's header is the same height.
function HeaderPlaceholder() {
  return <div className="h-11 w-11 shrink-0" aria-hidden />;
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

function DateChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full px-3 py-1.5 font-karla text-subtitle transition-colors duration-150 ease-out active:scale-[0.96]"
      style={
        active
          ? { background: "var(--color-brand)", color: "#fff" }
          : { background: "var(--color-toggle-off)", color: "var(--color-content-primary)" }
      }
    >
      {label}
    </button>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
  bordered = true,
  disabled = false,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  bordered?: boolean;
  disabled?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between px-4 py-3 ${bordered ? "border-t border-border-primary" : ""}`}
    >
      <span className="font-karla text-body font-medium text-content-primary">
        {label}
      </span>
      <Toggle checked={checked} onChange={onChange} ariaLabel={label} disabled={disabled} />
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
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <span className="flex-1 font-karla text-body text-content-secondary">Location</span>
        <MapPin size={20} className="shrink-0 text-content-secondary" />
      </button>
    );
  }
  return (
    <div className="flex w-full items-center gap-3 px-4 py-3">
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
  limitDuration: true,
  multipleAnswers: false,
  addingOptions: true,
  revoting: true,
  showWhoVoted: true,
};

type Screen = "menu" | "poll" | "location" | "activity";

type DateField = "startDate" | "startTime" | "endDate" | "endTime";

export default function AddSheet({
  tripId,
  onClose,
  onActivityCreated,
}: {
  tripId: string;
  onClose: () => void;
  onActivityCreated?: (item: TimelineItem) => void;
}) {
  const [closing, setClosing] = useState(false);
  const [screen, setScreen] = useState<Screen>("menu");
  const [contentVisible, setContentVisible] = useState(true);
  const [fadeDuration, setFadeDuration] = useState(FADE_IN_MS);
  const [toggles, setToggles] = useState<PollToggles>(INITIAL_TOGGLES);
  const [pollQuestion, setPollQuestion] = useState("");
  const [locations, setLocations] = useState<(Location | null)[]>([null]);
  const [locationSheetTarget, setLocationSheetTarget] = useState<number | null>(null);
  const [locationQuery, setLocationQuery] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(DEFAULT_DURATION_MINUTES);
  const [durationPickerOpen, setDurationPickerOpen] = useState(false);
  const [activityTitle, setActivityTitle] = useState("");
  // Only trip members are eligible attendees — the same roster the trip's
  // Members screen shows, not the wider candidate pool used to invite people.
  const [tripMembers] = useState<Member[]>(() => getStoredMembers(tripId, mockMembers));
  const [attendeeIds, setAttendeeIds] = useState<string[]>(() =>
    tripMembers.map((member) => member.id),
  );
  // Defaults to this prototype's fictional "now" (see getMockNow), ending an
  // hour later — not the real device clock, which won't match the trip
  // screen's own status bar.
  const [activityStart, setActivityStart] = useState<Date>(() => getMockNow());
  const [activityEnd, setActivityEnd] = useState<Date>(
    () => new Date(getMockNow().getTime() + 60 * 60 * 1000),
  );
  // Which chip's editor (if any) is expanded inline below the Starts/Ends
  // card — tapping the active chip again collapses it.
  const [activeDateField, setActiveDateField] = useState<DateField | null>(null);
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
  const scrollRef = useRef<HTMLDivElement>(null);

  function panelRefFor(s: Screen) {
    if (s === "menu") return menuPanelRef;
    if (s === "poll") return pollPanelRef;
    if (s === "activity") return activityPanelRef;
    return locationPanelRef;
  }

  // All four screens stay mounted at once (so navigateTo can measure the
  // next screen's height before it fades in), stacked via absolute
  // positioning inside the same relative, overflow-y-auto TouchScroll. Left
  // at their natural height, every inactive screen's content still counts
  // toward that ancestor's scrollable area — even fully transparent, they'd
  // let a drag scroll past the visible screen into blank space sized by
  // whichever screen happens to be tallest. Collapsing inactive screens to
  // height: 0 (with overflow: hidden) removes them from that scrollable
  // area while leaving their own scrollHeight - read by ref - unaffected,
  // since scrollHeight always reports the untruncated content height.
  function screenStyle(target: Screen): React.CSSProperties {
    const active = screen === target;
    return {
      opacity: active && contentVisible ? 1 : 0,
      transitionDuration: `${fadeDuration}ms`,
      height: active ? "auto" : 0,
      overflow: "hidden",
    };
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
  }, [screen, locationsSignature, toggles.limitDuration, activeDateField, locationQuery]);

  const { atTop, atBottom } = useScrollEdges(scrollRef, [screen, bodyHeight]);

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

  function toggleDateField(field: DateField) {
    setActiveDateField((prev) => (prev === field ? null : field));
  }

  function openLocationSearch(index: number) {
    setLocationSheetTarget(index);
    setLocationQuery("");
    navigateTo("location");
  }

  // The trailing "Add an option" action reuses the last slot if it's still
  // empty, rather than stacking a second empty row. Otherwise it targets an
  // index one past the end without actually appending anything yet — that
  // row only gets created in handleLocationSelect once a location is
  // actually picked, so the poll screen never briefly shows a new, empty
  // "Location" row while it fades out into the location search screen.
  function handleAddOption() {
    const lastIndex = locations.length - 1;
    openLocationSearch(locations[lastIndex] === null ? lastIndex : locations.length);
  }

  function handleLocationSelect(location: Location) {
    const target = locationSheetTarget;
    if (target === null) return;
    setLocations((prev) =>
      target < prev.length
        ? prev.map((loc, i) => (i === target ? location : loc))
        : [...prev, location],
    );
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

  // The save tick only turns on (and becomes tappable) once there's a
  // question and at least two options to vote on.
  const filledLocationsCount = locations.filter((loc): loc is Location => loc !== null).length;
  const pollValid = pollQuestion.trim().length > 0 && filledLocationsCount >= 2;

  // Every poll creates its activity — there's no opting out, since a poll
  // with nowhere for its winner to land wouldn't make sense. No one's voted
  // yet either, so the destination is unknown: the entry lands on today's
  // timeline as a pending placeholder (warning icon, no location) rather
  // than waiting for a full voting simulation this prototype doesn't have.
  function handleSavePoll() {
    const pollOptions = locations.filter((loc): loc is Location => loc !== null);
    onActivityCreated?.({
      id: `poll-${Date.now()}`,
      type: "meal",
      emoji: "",
      pending: true,
      title: activityTitle.trim() || smartActivityTitle(activityStart),
      subtitle: "Poll in progress",
      time: formatTimeRange(activityStart, activityEnd),
      pollQuestion,
      pollOptions,
      pollDeadline: Date.now() + durationMinutes * 60 * 1000,
      pollVotes: seedPollVotes(
        attendeeIds,
        pollOptions.map((option) => option.id),
      ),
      pollShowWhoVoted: toggles.showWhoVoted,
      attendeeIds,
    });
    setClosing(true);
  }

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

        {/* Lives outside the crossfading, height-measured TouchScroll body
            below, so it stays put — genuinely sticky — while a screen's own
            content scrolls beneath it instead of scrolling away with it. */}
        {screen === "menu" && (
          <div className="flex items-center justify-between px-4">
            <HeaderPlaceholder />
            <span className="font-karla text-nav font-medium text-content-primary">Add</span>
            <HeaderPlaceholder />
          </div>
        )}
        {screen === "poll" && (
          <div className="flex items-center justify-between px-4">
            <GlassButton ariaLabel="Back" onClick={() => navigateTo("menu")}>
              <CaretLeft size={22} />
            </GlassButton>
            <span className="font-karla text-body font-medium text-content-primary">
              Add poll
            </span>
            <GlassButton
              ariaLabel="Save poll"
              onClick={handleSavePoll}
              disabled={!pollValid}
              style={
                pollValid
                  ? { background: "var(--color-brand)", border: "1px solid var(--color-brand)" }
                  : undefined
              }
            >
              <Check size={22} />
            </GlassButton>
          </div>
        )}
        {screen === "activity" && (
          <div className="flex items-center justify-between px-4">
            <GlassButton ariaLabel="Back" onClick={() => navigateTo("poll")}>
              <CaretLeft size={22} />
            </GlassButton>
            <span className="font-karla text-body font-medium text-content-primary">
              Add activity
            </span>
            <HeaderPlaceholder />
          </div>
        )}
        {screen === "location" && (
          <div className="flex items-center justify-between px-4">
            <GlassButton ariaLabel="Back" onClick={() => navigateTo("poll")}>
              <CaretLeft size={22} />
            </GlassButton>
            <span className="font-karla text-body font-medium text-content-primary">
              Location
            </span>
            <HeaderPlaceholder />
          </div>
        )}

        <div className="relative">
        <TouchScroll
          ref={scrollRef}
          className="no-scrollbar relative overflow-y-auto transition-[height] ease-[cubic-bezier(0.32,0.72,0,1)]"
          style={{ height: bodyHeight ?? undefined, transitionDuration: `${RESIZE_MS}ms` }}
        >
          <div
            ref={menuPanelRef}
            inert={screen !== "menu"}
            className="absolute inset-x-0 top-0 transition-opacity ease-out"
            style={screenStyle("menu")}
          >
            <div className="flex flex-col gap-3 px-4 pt-3 pb-3">
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
            style={screenStyle("poll")}
          >
            <div className="flex flex-col gap-4 px-4 pt-3 pb-3">
              <input
                type="text"
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
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
                  className="flex w-full items-center gap-3 px-4 py-3 text-left"
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
                  disabled
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
                  disabled
                />
                <ToggleRow
                  label="Allow adding options"
                  checked={toggles.addingOptions}
                  onChange={updateToggle("addingOptions")}
                  disabled
                />
                <ToggleRow
                  label="Allow revoting"
                  checked={toggles.revoting}
                  onChange={updateToggle("revoting")}
                  disabled
                />
                <ToggleRow
                  label="Show who voted"
                  checked={toggles.showWhoVoted}
                  onChange={updateToggle("showWhoVoted")}
                  disabled
                />
              </div>

              <button
                type="button"
                onClick={() => navigateTo("activity")}
                className="flex w-full items-center justify-between rounded-card bg-card-light px-4 py-3 text-left"
              >
                <span className="font-karla text-body font-medium text-content-primary">
                  Activity details
                </span>
                <CaretRight size={16} className="shrink-0 text-content-secondary" />
              </button>
            </div>
          </div>

          <div
            ref={activityPanelRef}
            inert={screen !== "activity"}
            className="absolute inset-x-0 top-0 transition-opacity ease-out"
            style={screenStyle("activity")}
          >
            <div className="flex flex-col gap-4 px-4 pt-3 pb-3">
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
                    <DateChip
                      label={formatDateChip(activityStart)}
                      active={activeDateField === "startDate"}
                      onClick={() => toggleDateField("startDate")}
                    />
                    <DateChip
                      label={formatTimeChip(activityStart)}
                      active={activeDateField === "startTime"}
                      onClick={() => toggleDateField("startTime")}
                    />
                  </div>
                </div>
                {(activeDateField === "startDate" || activeDateField === "startTime") && (
                  <div className="border-t border-border-primary">
                    <DateTimeFieldEditor
                      mode={activeDateField === "startDate" ? "date" : "time"}
                      value={activityStart}
                      onChange={setActivityStart}
                    />
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-border-primary px-4 py-3">
                  <span className="font-karla text-body font-medium text-content-primary">
                    Ends
                  </span>
                  <div className="flex items-center gap-2">
                    <DateChip
                      label={formatDateChip(activityEnd)}
                      active={activeDateField === "endDate"}
                      onClick={() => toggleDateField("endDate")}
                    />
                    <DateChip
                      label={formatTimeChip(activityEnd)}
                      active={activeDateField === "endTime"}
                      onClick={() => toggleDateField("endTime")}
                    />
                  </div>
                </div>
                {(activeDateField === "endDate" || activeDateField === "endTime") && (
                  <div className="border-t border-border-primary">
                    <DateTimeFieldEditor
                      mode={activeDateField === "endDate" ? "date" : "time"}
                      value={activityEnd}
                      onChange={setActivityEnd}
                    />
                  </div>
                )}
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
            </div>
          </div>

          <div
            ref={locationPanelRef}
            inert={screen !== "location"}
            className="absolute inset-x-0 top-0 transition-opacity ease-out"
            style={screenStyle("location")}
          >
            <LocationSearchPanel
              query={locationQuery}
              excludeIds={locationExcludeIds}
              onSelect={handleLocationSelect}
            />
          </div>
        </TouchScroll>
        <SheetScrollFade showTop={!atTop} showBottom={!atBottom} />
        </div>

        {/* Floats near the sheet's own bottom edge, same as AddMemberSheet's
            search bar — outside the relative wrapper above so bottom-8
            anchors to the whole sheet, not just the (possibly short)
            TouchScroll body. */}
        {screen === "location" && (
          <div
            className="absolute inset-x-4 bottom-8 z-30 flex min-h-12 items-center gap-2 rounded-full px-4 py-2 text-content-primary"
            style={glassStyle}
          >
            <MagnifyingGlass size={20} className="shrink-0" />
            <input
              ref={locationInputRef}
              type="text"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              placeholder="Search"
              className="flex-1 bg-transparent font-karla text-body text-content-primary placeholder:text-content-secondary focus:outline-none"
            />
          </div>
        )}
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
