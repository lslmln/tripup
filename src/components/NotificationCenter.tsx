"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CashRegister, ListBullets } from "@phosphor-icons/react";
import Notification from "./Notification";
import { subscribeToNotifications, type PendingNotification } from "@/lib/notifications-store";

// Lives once at the phone-frame level (outside any page), so it keeps
// showing/queuing notifications scheduled by a page that has since
// unmounted — see notifications-store.ts.
export default function NotificationCenter() {
  const [queue, setQueue] = useState<PendingNotification[]>([]);
  const active = queue[0] ?? null;
  const router = useRouter();

  useEffect(() => {
    return subscribeToNotifications((notification) => {
      setQueue((prev) => [...prev, notification]);
    });
  }, []);

  function dismissActive() {
    setQueue((prev) => prev.slice(1));
  }

  if (!active) return null;

  return (
    <Notification
      key={active.id}
      icon={
        active.icon === "payment" ? (
          <CashRegister size={20} weight="fill" />
        ) : (
          <ListBullets size={20} weight="fill" />
        )
      }
      title={active.title}
      message={active.message}
      onTap={active.href ? () => router.push(active.href!) : undefined}
      onDismiss={dismissActive}
    />
  );
}
