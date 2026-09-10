import Link from "next/link";
import { CaretLeft, DotsThreeOutline } from "@phosphor-icons/react/dist/ssr";
import GlassButton from "@/components/GlassButton";
import StatusBar from "@/components/StatusBar";
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

  return (
    <div className="flex h-full w-full flex-col bg-background-detail">
      <div
        className="relative shrink-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${trip.image})`, height: "45%" }}
      >
        <StatusBar light />
        <div className="flex items-center justify-between px-4 py-3">
          <Link href={`/trip/${trip.id}`}>
            <GlassButton ariaLabel="Back">
              <CaretLeft size={22} />
            </GlassButton>
          </Link>
          <GlassButton ariaLabel="More">
            <DotsThreeOutline size={20} weight="fill" />
          </GlassButton>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-black/80" />
        <div className="absolute inset-x-0 bottom-0 px-4 py-3">
          <p className="font-karla text-header font-medium text-content-primary">
            {trip.name}
          </p>
          <p className="font-karla text-subtitle text-content-secondary">
            {trip.dates}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-3">
        <div className="divide-y divide-border-primary overflow-hidden rounded-card bg-card">
          <button
            type="button"
            className="w-full px-4 py-3 text-left font-karla text-body font-medium text-blue-400"
          >
            Add a member
          </button>
          {mockMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-3 px-4 py-3"
            >
              <div className="h-11 w-11 shrink-0 rounded-full bg-icon-neutral" />
              <span className="flex-1 font-karla text-body font-medium text-content-primary">
                {member.name}
              </span>
              {member.isOrganiser && (
                <span className="font-karla text-body text-content-primary">
                  Organiser
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
