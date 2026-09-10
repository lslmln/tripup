import ActivityDetailScreen from "@/components/ActivityDetailScreen";
import { mockTrips } from "@/lib/mock-trips";
import { mockTimeline } from "@/lib/mock-timeline";
import { mockMembers } from "@/lib/mock-members";
import { notFound } from "next/navigation";

export default async function ActivityDetailPage({
  params,
}: {
  params: Promise<{ id: string; activityId: string }>;
}) {
  const { id, activityId } = await params;
  const trip = mockTrips.find((t) => t.id === id);
  if (!trip) notFound();

  return (
    <ActivityDetailScreen
      trip={trip}
      activityId={activityId}
      fallbackTimeline={mockTimeline}
      fallbackMembers={mockMembers}
    />
  );
}
