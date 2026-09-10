"use client";

import { CashRegister } from "@phosphor-icons/react";
import { formatMoney } from "@/lib/bills";

export default function TransactionNotification({
  memberName,
  amount,
  onDismiss,
}: {
  memberName: string;
  amount: number;
  onDismiss: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onDismiss}
      className="notification-enter absolute inset-x-4 top-14 z-30 flex items-center gap-3 rounded-card bg-card px-4 py-3 text-left shadow-lg"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-icon-neutral text-content-primary">
        <CashRegister size={20} weight="fill" />
      </div>
      <div className="flex flex-col">
        <span className="font-karla text-body font-medium text-content-primary">
          Payment received
        </span>
        <span className="font-karla text-subtitle text-content-secondary">
          {memberName} paid you ${formatMoney(amount)}
        </span>
      </div>
    </button>
  );
}
