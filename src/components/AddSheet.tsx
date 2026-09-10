"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Lightning,
  ListBullets,
  CaretLeft,
  Check,
  MapPin,
  Plus,
  CaretRight,
} from "@phosphor-icons/react";
import Toggle from "./Toggle";
import GlassButton from "./GlassButton";

// Sheet-level open/close (backdrop + sheet slide).
const DURATION_MS = 300;
const SHEET_EASE = "cubic-bezier(0.32, 0.72, 0, 1)";

// Menu <-> poll screen transition: fade the old content out, resize the
// sheet to the new screen's height, then fade the new content in. Exits are
// shorter than entrances (asymmetric timing); the resize keeps the sheet's
// own established curve for cohesion with its open/close motion.
const FADE_OUT_MS = 100;
const RESIZE_MS = 220;
const FADE_IN_MS = 160;

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
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="font-karla text-body font-medium text-content-primary">
        {label}
      </span>
      <Toggle checked={checked} onChange={onChange} ariaLabel={label} />
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

type Screen = "menu" | "poll";

export default function AddSheet({ onClose }: { onClose: () => void }) {
  const [closing, setClosing] = useState(false);
  const [screen, setScreen] = useState<Screen>("menu");
  const [contentVisible, setContentVisible] = useState(true);
  const [fadeDuration, setFadeDuration] = useState(FADE_IN_MS);
  const [toggles, setToggles] = useState<PollToggles>(INITIAL_TOGGLES);
  const [options, setOptions] = useState<string[]>([""]);
  const [bodyHeight, setBodyHeight] = useState<number | null>(null);

  const backdropRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);
  const pollPanelRef = useRef<HTMLDivElement>(null);
  const pendingScreenRef = useRef<Screen | null>(null);
  const timeoutsRef = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  // The sheet's two screens (menu, poll) are both always mounted, stacked on
  // top of each other. At rest, the wrapper's height tracks whichever one is
  // active (they're absolutely positioned, so they don't contribute to
  // layout height on their own). During a navigateTo() sequence this effect
  // stands down — the sequence drives bodyHeight itself, staged behind the
  // content fade.
  useLayoutEffect(() => {
    if (pendingScreenRef.current) return;
    const activePanel = screen === "menu" ? menuPanelRef.current : pollPanelRef.current;
    if (activePanel) setBodyHeight(activePanel.scrollHeight);
  }, [screen, options.length]);

  // Fade the current screen out, resize the sheet to the target screen's
  // height while both are invisible, then fade the target screen in.
  function navigateTo(target: Screen) {
    if (target === screen || pendingScreenRef.current) return;
    pendingScreenRef.current = target;
    setFadeDuration(FADE_OUT_MS);
    setContentVisible(false);

    const t1 = window.setTimeout(() => {
      const nextPanel = target === "menu" ? menuPanelRef.current : pollPanelRef.current;
      if (nextPanel) setBodyHeight(nextPanel.scrollHeight);
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

        <div
          className="relative overflow-hidden transition-[height] ease-[cubic-bezier(0.32,0.72,0,1)]"
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
                {options.map((option, index) => (
                  <div key={index} className="flex items-center gap-3 px-4 py-4">
                    <input
                      type="text"
                      value={option}
                      placeholder="Option"
                      onChange={(e) =>
                        setOptions((prev) =>
                          prev.map((o, i) => (i === index ? e.target.value : o)),
                        )
                      }
                      className="flex-1 bg-transparent font-karla text-body text-content-primary placeholder:text-content-secondary focus:outline-none"
                    />
                    <MapPin size={20} className="shrink-0 text-content-secondary" />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setOptions((prev) => [...prev, ""])}
                  className="flex w-full items-center gap-3 px-4 py-4 text-left"
                >
                  <span className="flex-1 font-karla text-body text-content-secondary">
                    Add an option
                  </span>
                  <Plus size={20} className="shrink-0 text-content-secondary" />
                </button>
              </div>

              <div className="divide-y divide-border-primary overflow-hidden rounded-card bg-card-light">
                <ToggleRow
                  label="Limit duration"
                  checked={toggles.limitDuration}
                  onChange={updateToggle("limitDuration")}
                />
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

              <div className="flex w-full items-center justify-between rounded-card bg-card-light px-4 py-4">
                <span className="font-karla text-body font-medium text-content-primary">
                  Create activity from poll?
                </span>
                <span className="flex items-center gap-1 font-karla text-body text-content-secondary">
                  No
                  <CaretRight size={16} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
