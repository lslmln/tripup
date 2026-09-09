import PhoneFrame from "@/components/PhoneFrame";
import StatusBar from "@/components/StatusBar";
import GradientGlow from "@/components/GradientGlow";
import TopNav from "@/components/TopNav";
import TripList from "@/components/TripList";
import GlassSearchBar from "@/components/GlassSearchBar";
import TouchScroll from "@/components/TouchScroll";

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
          <TouchScroll className="no-scrollbar relative z-10 min-h-0 flex-1 overflow-y-auto">
            <TripList />
          </TouchScroll>
          <GlassSearchBar />
        </div>
      </PhoneFrame>
    </main>
  );
}
