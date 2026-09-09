import { mockTrips } from "@/lib/mock-trips";
import TripListItem from "./TripListItem";

export default function TripList() {
  const sortedTrips = [...mockTrips].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
  );

  return (
    <div>
      {sortedTrips.map((trip) => (
        <TripListItem key={trip.id} trip={trip} />
      ))}
    </div>
  );
}
