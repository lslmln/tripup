import SimulatorTouch from "./SimulatorTouch";
import PageTransition from "./PageTransition";

// Measured from /public/iphone-frame.png (1800x3680 source), which is a
// real device-mockup image with a transparent, rounded-corner screen cutout.
const IMAGE_WIDTH = 1800;
const IMAGE_HEIGHT = 3680;
const SCREEN_LEFT = 97;
const SCREEN_TOP = 93;
const SCREEN_RIGHT = 1702;
const SCREEN_BOTTOM = 3586;

const SCREEN_WIDTH = SCREEN_RIGHT - SCREEN_LEFT; // 1606
const SCREEN_HEIGHT = SCREEN_BOTTOM - SCREEN_TOP; // 3494

// Display the frame at a size where the screen cutout renders at 402px wide,
// matching the iPhone 17's 402x874 point dimensions.
const SCALE = 402 / SCREEN_WIDTH;
const FRAME_WIDTH = IMAGE_WIDTH * SCALE;
const FRAME_HEIGHT = IMAGE_HEIGHT * SCALE;

export default function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative shrink-0 drop-shadow-2xl"
      style={{ width: FRAME_WIDTH, height: FRAME_HEIGHT }}
    >
      <div
        className="absolute overflow-hidden rounded-[44px] bg-background-primary"
        style={{
          left: SCREEN_LEFT * SCALE,
          top: SCREEN_TOP * SCALE,
          width: SCREEN_WIDTH * SCALE,
          height: SCREEN_HEIGHT * SCALE,
        }}
      >
        <div className="h-full w-full overflow-hidden">
          <SimulatorTouch>
            <PageTransition>{children}</PageTransition>
          </SimulatorTouch>
        </div>
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/iphone-frame.png"
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full select-none"
        draggable={false}
      />
    </div>
  );
}

export { SCREEN_WIDTH, SCREEN_HEIGHT };
