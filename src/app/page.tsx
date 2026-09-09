import PhoneFrame from "@/components/PhoneFrame";
import StatusBar from "@/components/StatusBar";
import GradientGlow from "@/components/GradientGlow";
import TopNav from "@/components/TopNav";
import TripList from "@/components/TripList";
import GlassSearchBar from "@/components/GlassSearchBar";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-200 p-8">
      <PhoneFrame>
        <div className="relative flex h-full w-full flex-col bg-background-primary">
          <GradientGlow />
          <div className="relative z-10 shrink-0">
            <StatusBar light />
            <TopNav title="Trips" />
          </div>
          <div className="relative min-h-0 flex-1">
            <div className="no-scrollbar relative z-10 h-full overflow-y-auto">
              <TripList />
            </div>
            <div
              className="pointer-events-none absolute inset-x-0 top-0 z-20 h-8"
              style={{
                background:
                  "linear-gradient(to bottom, var(--color-background-primary), transparent)",
              }}
            />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-8"
              style={{
                background:
                  "linear-gradient(to top, var(--color-background-primary), transparent)",
              }}
            />
          </div>
          <GlassSearchBar />
        </div>
      </PhoneFrame>
    </main>
  );
}
