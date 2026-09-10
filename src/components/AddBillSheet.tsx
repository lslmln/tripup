"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { CheckSquare, Square, X, Check } from "@phosphor-icons/react";
import GlassButton from "./GlassButton";
import StatusBar from "./StatusBar";
import TouchScroll from "./TouchScroll";
import { sanitizeAmountInput, splitShare, formatMoney, type Bill } from "@/lib/bills";
import type { Member } from "@/lib/mock-members";

const DURATION_MS = 300;
const SHEET_EASE = "cubic-bezier(0.32, 0.72, 0, 1)";

export default function AddBillSheet({
  attendees,
  payer,
  initialBill,
  onSave,
  onClose,
}: {
  attendees: Member[];
  payer: Member;
  initialBill?: Bill;
  onSave: (bill: Bill) => void;
  onClose: () => void;
}) {
  const [closing, setClosing] = useState(false);
  const [title, setTitle] = useState(initialBill?.title ?? "");
  const [amountRaw, setAmountRaw] = useState(
    initialBill ? formatMoney(initialBill.amount) : "",
  );
  const [splitIds, setSplitIds] = useState<string[]>(
    initialBill?.splitWith ?? attendees.map((member) => member.id),
  );
  const backdropRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Mirrors AddMemberSheet/PollVoteSheet's entrance on the way out.
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

  const amount = parseFloat(amountRaw) || 0;
  const valid = title.trim().length > 0 && amount > 0 && splitIds.length > 0;
  const share = splitShare(amount, splitIds.length);

  function toggleSplit(id: string) {
    setSplitIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function handleSave() {
    onSave({
      id: initialBill?.id ?? `bill-${Date.now()}`,
      title: title.trim(),
      amount,
      paidBy: payer.id,
      splitWith: splitIds,
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
      {/* Status bar stays crisp above the dimmed backdrop, in the strip the sheet leaves uncovered. */}
      <div className="absolute inset-x-0 top-0 z-50">
        <StatusBar light time="6:45" />
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
          <span className="font-karla text-body font-medium text-content-primary">Add bill</span>
          <GlassButton
            ariaLabel="Save bill"
            onClick={handleSave}
            disabled={!valid}
            style={
              valid
                ? { background: "var(--color-brand)", border: "1px solid var(--color-brand)" }
                : undefined
            }
          >
            <Check size={20} weight="bold" />
          </GlassButton>
        </div>

        <div className="relative min-h-0 flex-1">
          <TouchScroll className="no-scrollbar h-full overflow-y-auto pb-23">
            <div className="flex flex-col gap-4 px-4 pt-1">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                className="w-full rounded-card bg-card-light px-4 py-4 font-karla text-body text-content-primary placeholder:text-content-secondary focus:outline-none"
              />

              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  value={amountRaw}
                  onChange={(e) => setAmountRaw(sanitizeAmountInput(e.target.value))}
                  placeholder="Amount"
                  className="w-full rounded-card bg-card-light py-4 pr-14 pl-4 font-karla text-body text-content-primary placeholder:text-content-secondary focus:outline-none"
                />
                <span className="absolute inset-y-0 right-4 flex items-center font-karla text-subtitle text-content-secondary">
                  USD
                </span>
              </div>

              <div className="flex items-center justify-between rounded-card bg-card-light px-4 py-4">
                <span className="font-karla text-body font-medium text-content-primary">
                  Paid by
                </span>
                <span className="rounded-full bg-toggle-off px-3 py-1.5 font-karla text-subtitle text-content-primary">
                  {payer.name}
                </span>
              </div>

              <div>
                <h2 className="mb-3 font-karla text-header font-medium text-content-primary">
                  Split
                </h2>
                <div className="divide-y divide-border-primary overflow-hidden rounded-card bg-card-light">
                  {attendees.map((member) => {
                    const checked = splitIds.includes(member.id);
                    return (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => toggleSplit(member.id)}
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
                        <span className="flex-1 font-karla text-body font-medium text-content-primary">
                          {member.name}
                        </span>
                        <span className="font-karla text-body text-content-secondary">
                          ${formatMoney(checked ? share : 0)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </TouchScroll>
        </div>
      </div>
    </>
  );
}
