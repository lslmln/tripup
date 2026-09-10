import Link from "next/link";
import type { Trip } from "@/lib/mock-trips";

// Only Lisbon babes has a built-out detail screen right now; the rest stay
// tappable (for the press feedback) but don't navigate anywhere yet.
const NAVIGABLE_TRIP_ID = "1";

export default function TripListItem({ trip }: { trip: Trip }) {
  const className =
    "flex items-center gap-3 px-4 py-6 transition-transform duration-150 ease-out active:scale-[0.97]";

  const content = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={trip.image}
        alt=""
        className="h-[60px] w-[60px] shrink-0 rounded-full border border-border-primary object-cover"
      />
      <div className="flex flex-col">
        <span className="font-karla text-body font-medium text-content-primary">
          {trip.name}
        </span>
        <span className="font-karla text-subtitle font-medium text-content-secondary">
          {trip.dates}
        </span>
      </div>
    </>
  );

  if (trip.id !== NAVIGABLE_TRIP_ID) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Link href={`/trip/${trip.id}`} className={className}>
      {content}
    </Link>
  );
}
