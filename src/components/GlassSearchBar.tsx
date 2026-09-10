import { MagnifyingGlass, Plus } from "@phosphor-icons/react/dist/ssr";
import { glassStyle } from "./glass";
import GlassButton from "./GlassButton";

export default function GlassSearchBar({
  placeholder = "Search",
  onAddClick,
}: {
  placeholder?: string;
  onAddClick?: () => void;
}) {
  return (
    <div className="absolute inset-x-4 bottom-8 z-30 flex items-center gap-3">
      <div
        className="flex h-12 flex-1 items-center gap-2 rounded-full px-4 text-content-primary"
        style={glassStyle}
      >
        <MagnifyingGlass size={28} />
        <span className="font-karla text-nav text-content-secondary">
          {placeholder}
        </span>
      </div>
      {onAddClick && (
        <GlassButton ariaLabel="Add" onClick={onAddClick}>
          <Plus size={28} />
        </GlassButton>
      )}
    </div>
  );
}
