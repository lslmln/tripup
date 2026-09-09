import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import { glassStyle } from "./glass";

export default function GlassSearchBar({
  placeholder = "Search",
}: {
  placeholder?: string;
}) {
  return (
    <div className="absolute inset-x-4 bottom-8 z-30">
      <div
        className="flex h-12 items-center gap-2 rounded-full px-4 text-content-primary"
        style={glassStyle}
      >
        <MagnifyingGlass size={28} />
        <span className="font-karla text-nav text-content-secondary">
          {placeholder}
        </span>
      </div>
    </div>
  );
}
