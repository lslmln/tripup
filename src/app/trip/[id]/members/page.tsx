import MembersScreen from "@/components/MembersScreen";
import { mockTrips } from "@/lib/mock-trips";
import { mockMembers } from "@/lib/mock-members";
import { notFound } from "next/navigation";

export default async function TripMembersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const trip = mockTrips.find((t) => t.id === id);
  if (!trip) notFound();

  return <MembersScreen trip={trip} members={mockMembers} />;
}
