"use client";

import { Lightning, ListBullets } from "@phosphor-icons/react";

function SheetOption({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <button
      type="button"
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

export default function AddSheet({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div
        className="backdrop-enter absolute inset-0 z-40 bg-black/60"
        onClick={onClose}
      />
      <div className="sheet-enter absolute inset-x-0 bottom-0 z-50 rounded-t-[32px] bg-card pb-16 pt-3">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-white/30" />
        <p className="mb-4 text-center font-karla text-nav font-medium text-content-primary">
          Add
        </p>
        <div className="flex flex-col gap-3 px-4">
          <SheetOption icon={<Lightning size={20} weight="fill" />} title="Activity" />
          <SheetOption
            icon={<ListBullets size={20} />}
            title="Poll"
            subtitle="When you can't choose where to eat"
          />
        </div>
      </div>
    </>
  );
}
