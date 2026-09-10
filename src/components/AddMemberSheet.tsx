"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Check, CheckSquare, MagnifyingGlass, Square, X } from "@phosphor-icons/react";
import GlassButton from "./GlassButton";
import StatusBar from "./StatusBar";
import TouchScroll from "./TouchScroll";
import { glassStyle } from "./glass";
import { mockCandidates, type Candidate } from "@/lib/mock-candidates";

const DURATION_MS = 300;
const SHEET_EASE = "cubic-bezier(0.32, 0.72, 0, 1)";

export default function AddMemberSheet({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: (candidates: Candidate[]) => void;
}) {
  const [closing, setClosing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const backdropRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Mirrors AddSheet's entrance (sheet-enter/backdrop-enter's @starting-style
  // slide + fade) on the way out: play the reverse transform/opacity
  // imperatively, then unmount via onClose only once it's finished.
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

  const toggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((existing) => existing !== id) : [...prev, id],
    );
  };

  const selected = mockCandidates.filter((candidate) => selectedIds.includes(candidate.id));

  const handleDone = () => {
    onConfirm(selected);
    setClosing(true);
  };

  return (
    <>
      <div
        ref={backdropRef}
        className="backdrop-enter absolute inset-0 z-40 bg-black/60"
        onClick={() => setClosing(true)}
      />
      {/* Status bar stays crisp above the dimmed backdrop, in the strip the sheet leaves uncovered. */}
      <div className="absolute inset-x-0 top-0 z-50">
        <StatusBar light />
      </div>
      <div
        ref={sheetRef}
        className="sheet-enter absolute inset-x-0 top-17 bottom-0 z-50 flex flex-col overflow-hidden rounded-t-[32px] bg-card"
      >
        <div className="mx-auto mt-3 mb-1 h-1.5 w-10 shrink-0 rounded-full bg-white/30" />

        <div className="flex shrink-0 items-center justify-between px-4 py-3">
          <GlassButton ariaLabel="Close" onClick={() => setClosing(true)}>
            <X size={20} />
          </GlassButton>
          <p className="font-karla text-nav font-medium text-content-primary">
            Add member
          </p>
          <GlassButton
            ariaLabel="Done"
            onClick={handleDone}
            disabled={selected.length === 0}
            style={
              selected.length > 0
                ? { background: "var(--color-brand)", border: "1px solid var(--color-brand)" }
                : undefined
            }
          >
            <Check size={20} weight="bold" />
          </GlassButton>
        </div>

        <div className="relative min-h-0 flex-1">
          <TouchScroll className="no-scrollbar h-full overflow-y-auto pt-3 pb-23">
            <div className="divide-y divide-border-primary">
              {mockCandidates.map((candidate) => {
                const checked = selectedIds.includes(candidate.id);
                return (
                  <button
                    key={candidate.id}
                    type="button"
                    onClick={() => toggle(candidate.id)}
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
                      src={candidate.avatar}
                      alt=""
                      className="h-11 w-11 shrink-0 rounded-full object-cover"
                    />
                    <span className="font-karla text-body font-medium text-content-primary">
                      {candidate.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </TouchScroll>
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-20"
            style={{
              background:
                "linear-gradient(to top, var(--color-card) 0%, color-mix(in srgb, var(--color-card) 70%, transparent) 40%, color-mix(in srgb, var(--color-card) 25%, transparent) 75%, transparent 100%)",
            }}
            aria-hidden
          />
        </div>

        <div
          className="absolute inset-x-4 bottom-8 z-30 flex min-h-12 flex-wrap items-center gap-2 rounded-full px-4 py-2 text-content-primary"
          style={glassStyle}
        >
          <MagnifyingGlass size={20} className="shrink-0" />
          {selected.map((candidate) => (
            <span
              key={candidate.id}
              className="flex items-center gap-1.5 rounded-full bg-card py-1 pr-1 pl-1"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={candidate.avatar}
                alt=""
                className="h-6 w-6 rounded-full object-cover"
              />
              <span className="font-karla text-subtitle text-content-primary">
                {candidate.name}
              </span>
              <button
                type="button"
                aria-label={`Remove ${candidate.name}`}
                onClick={() => toggle(candidate.id)}
                className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-content-secondary focus:outline-none"
              >
                <X size={12} weight="bold" />
              </button>
            </span>
          ))}
          {selected.length === 0 && (
            <span className="font-karla text-nav text-content-secondary">Search</span>
          )}
        </div>
      </div>
    </>
  );
}
