import TripDetailScreen from "@/components/TripDetailScreen";
import { mockTrips } from "@/lib/mock-trips";
import { mockTimeline } from "@/lib/mock-timeline";
import { mockMembers } from "@/lib/mock-members";
import { notFound } from "next/navigation";

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const trip = mockTrips.find((t) => t.id === id);
  if (!trip) notFound();

  return (
    <TripDetailScreen
      trip={trip}
      timeline={mockTimeline}
      fallbackMembers={mockMembers}
    />
  );
}
