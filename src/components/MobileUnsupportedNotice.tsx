import { DeviceTablet } from "@phosphor-icons/react/dist/ssr";

// This prototype is a fixed iPhone-frame mockup (see PhoneFrame) meant to be
// viewed on a tablet or desktop screen. Below md, swap it for this notice
// instead of letting the frame render squeezed/clipped.
export default function MobileUnsupportedNotice() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-background-primary p-8 text-center md:hidden">
      <DeviceTablet size={40} className="text-content-secondary" />
      <p className="font-karla text-header font-semibold text-content-primary">
        Best viewed on tablet or desktop
      </p>
      <p className="max-w-xs font-karla text-subtitle text-content-secondary">
        TripUp is a prototype sized for larger screens. Please open this page
        on a tablet or desktop to view it.
      </p>
    </div>
  );
}
