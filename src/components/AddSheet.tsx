"use client";

import { useLayoutEffect, useRef, useState } from "react";
import {
  Lightning,
  ListBullets,
  X,
  Check,
  MapPin,
  Plus,
  CaretRight,
} from "@phosphor-icons/react";
import Toggle from "./Toggle";

const DURATION_MS = 300;
const SHEET_EASE = "cubic-bezier(0.32, 0.72, 0, 1)";

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

function HeaderIconButton({
  icon,
  ariaLabel,
  onClick,
}: {
  icon: React.ReactNode;
  ariaLabel: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-card-light text-content-primary transition-transform duration-150 ease-out active:scale-[0.97]"
    >
      {icon}
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

export default function AddSheet({ onClose }: { onClose: () => void }) {
  const [closing, setClosing] = useState(false);
  const [screen, setScreen] = useState<"menu" | "poll">("menu");
  const [toggles, setToggles] = useState<PollToggles>(INITIAL_TOGGLES);
  const [options, setOptions] = useState<string[]>([""]);
  const [bodyHeight, setBodyHeight] = useState<number | null>(null);

  const backdropRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);
  const pollPanelRef = useRef<HTMLDivElement>(null);

  // The sheet's two screens (menu, poll) are both always mounted, stacked via
  // transform, and slid in/out like an iOS navigation push. Since they're
  // absolutely positioned they don't contribute to layout height on their
  // own, so the wrapper's height is measured off whichever screen is active
  // and animated explicitly.
  useLayoutEffect(() => {
    const activePanel = screen === "menu" ? menuPanelRef.current : pollPanelRef.current;
    if (activePanel) setBodyHeight(activePanel.scrollHeight);
  }, [screen, options.length]);

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
          className="relative overflow-hidden transition-[height] duration-300"
          style={{ height: bodyHeight ?? undefined, transitionTimingFunction: SHEET_EASE }}
        >
          <div
            ref={menuPanelRef}
            inert={screen !== "menu"}
            className="absolute inset-x-0 top-0 transition-transform duration-300"
            style={{
              transitionTimingFunction: SHEET_EASE,
              transform: screen === "menu" ? "translateX(0%)" : "translateX(-100%)",
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
                onClick={() => setScreen("poll")}
              />
            </div>
          </div>

          <div
            ref={pollPanelRef}
            inert={screen !== "poll"}
            className="absolute inset-x-0 top-0 transition-transform duration-300"
            style={{
              transitionTimingFunction: SHEET_EASE,
              transform: screen === "poll" ? "translateX(0%)" : "translateX(100%)",
            }}
          >
            <div className="flex items-center justify-between px-4">
              <HeaderIconButton
                icon={<X size={20} weight="bold" />}
                ariaLabel="Close"
                onClick={() => setClosing(true)}
              />
              <span className="font-karla text-body font-medium text-content-primary">
                Add poll
              </span>
              <HeaderIconButton
                icon={<Check size={20} weight="bold" />}
                ariaLabel="Save poll"
                onClick={() => setClosing(true)}
              />
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
