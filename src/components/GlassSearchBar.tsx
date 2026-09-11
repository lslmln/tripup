import { MagnifyingGlass, Plus } from "@phosphor-icons/react/dist/ssr";
import { glassStyle } from "./glass";
import GlassButton from "./GlassButton";

// iOS search-bar-to-cancel-button morph timing: a strong ease-out so the
// collapse (and the search pill growing into the freed space) settles
// quickly rather than snapping. A CSS transition, not a keyframe animation,
// so switching tabs back and forth mid-transition redirects smoothly from
// wherever the button currently is instead of restarting.
const TRANSITION_MS = 220;
const EASE = "cubic-bezier(0.19, 1, 0.22, 1)";

export default function GlassSearchBar({
  placeholder = "Search",
  onAddClick,
}: {
  placeholder?: string;
  onAddClick?: () => void;
}) {
  const showAdd = Boolean(onAddClick);
  return (
    <div className="absolute inset-x-4 bottom-8 z-30 flex items-center">
      <div
        className="flex h-12 flex-1 items-center gap-2 rounded-full px-4 text-content-primary"
        style={glassStyle}
      >
        <MagnifyingGlass size={28} />
        <span className="font-karla text-nav text-content-secondary">
          {placeholder}
        </span>
      </div>
      {/* Always mounted — never conditionally rendered — so the collapse
          itself animates via this transition instead of the button just
          vanishing and the search pill snapping to fill the row. Width,
          opacity and scale settle together rather than the button merely
          getting clipped by a shrinking box. */}
      <div
        className="shrink-0 overflow-hidden"
        style={{
          width: showAdd ? 44 : 0,
          marginLeft: showAdd ? 12 : 0,
          opacity: showAdd ? 1 : 0,
          transform: showAdd ? "scale(1)" : "scale(0.8)",
          transition: `width ${TRANSITION_MS}ms ${EASE}, margin-left ${TRANSITION_MS}ms ${EASE}, transform ${TRANSITION_MS}ms ${EASE}, opacity ${Math.round(TRANSITION_MS * 0.8)}ms ease-out`,
        }}
      >
        <GlassButton ariaLabel="Add" onClick={onAddClick} disabled={!showAdd}>
          <Plus size={28} />
        </GlassButton>
      </div>
    </div>
  );
}
