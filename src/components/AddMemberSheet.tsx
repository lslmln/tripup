"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Check, CheckSquare, MagnifyingGlass, Square, X } from "@phosphor-icons/react";
import StatusBar from "./StatusBar";
import { mockCandidates } from "@/lib/mock-candidates";

const DURATION_MS = 300;
const SHEET_EASE = "cubic-bezier(0.32, 0.72, 0, 1)";

export default function AddMemberSheet({ onClose }: { onClose: () => void }) {
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

  return (
    <>
      <div
        ref={backdropRef}
        className="backdrop-enter absolute inset-0 z-40 bg-black/60"
        onClick={() => setClosing(true)}
      />
      <div
        ref={sheetRef}
        className="sheet-enter absolute inset-0 z-50 flex flex-col bg-background-detail"
      >
        <StatusBar light />
        <div className="flex items-center justify-between px-4 py-3">
          <button
            type="button"
            aria-label="Close"
            onClick={() => setClosing(true)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-card-light text-content-primary"
          >
            <X size={20} />
          </button>
          <p className="font-karla text-nav font-medium text-content-primary">
            Add member
          </p>
          <button
            type="button"
            aria-label="Done"
            onClick={() => setClosing(true)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-card-light text-content-primary"
          >
            <Check size={20} weight="bold" />
          </button>
        </div>

        <div className="mx-4 mb-3 flex flex-wrap items-center gap-2 rounded-card bg-card-light px-4 py-2">
          <MagnifyingGlass size={20} className="shrink-0 text-content-secondary" />
          {selected.map((candidate) => (
            <span
              key={candidate.id}
              className="flex items-center gap-1.5 rounded-full bg-card py-1 pr-3 pl-1"
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
            </span>
          ))}
          {selected.length === 0 && (
            <span className="font-karla text-nav text-content-secondary">Search</span>
          )}
        </div>

        <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-6">
          <div className="divide-y divide-border-primary">
            {mockCandidates.map((candidate) => {
              const checked = selectedIds.includes(candidate.id);
              return (
                <button
                  key={candidate.id}
                  type="button"
                  onClick={() => toggle(candidate.id)}
                  className="flex w-full items-center gap-3 py-3 text-left"
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
        </div>
      </div>
    </>
  );
}
