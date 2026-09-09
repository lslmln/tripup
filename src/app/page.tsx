"use client";

import { useState } from "react";
import StatusBar from "@/components/StatusBar";
import GradientGlow from "@/components/GradientGlow";
import TopNav from "@/components/TopNav";
import TripList from "@/components/TripList";
import GlassSearchBar from "@/components/GlassSearchBar";
import TouchScroll from "@/components/TouchScroll";
import AddSheet from "@/components/AddSheet";

export default function Home() {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="flex h-full w-full flex-col bg-background-primary">
      <GradientGlow />
      <div className="relative z-10 shrink-0">
        <StatusBar light />
        <TopNav title="Trips" onAddClick={() => setSheetOpen(true)} />
      </div>
      <TouchScroll className="no-scrollbar relative z-10 min-h-0 flex-1 overflow-y-auto">
        <TripList />
      </TouchScroll>
      <GlassSearchBar />
      {sheetOpen && <AddSheet onClose={() => setSheetOpen(false)} />}
    </div>
  );
}
