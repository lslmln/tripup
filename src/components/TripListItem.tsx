import type { Trip } from "@/lib/mock-trips";

export default function TripListItem({ trip }: { trip: Trip }) {
  return (
    <div className="flex cursor-pointer items-center gap-3 px-4 py-6 transition-transform duration-150 ease-out active:scale-[0.97]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={trip.image}
        alt=""
        className="h-[60px] w-[60px] shrink-0 rounded-full object-cover"
      />
      <div className="flex flex-col">
        <span className="font-karla text-body font-medium text-content-primary">
          {trip.name}
        </span>
        <span className="font-karla text-subtitle font-medium text-content-secondary">
          {trip.dates}
        </span>
      </div>
    </div>
  );
}
