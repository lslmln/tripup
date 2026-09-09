import { List, Plus } from "@phosphor-icons/react/dist/ssr";
import GlassButton from "./GlassButton";

export default function TopNav({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <GlassButton ariaLabel="Menu">
        <List size={28} />
      </GlassButton>
      <span className="font-karla text-nav font-medium text-content-primary">
        {title}
      </span>
      <GlassButton ariaLabel="Add">
        <Plus size={28} />
      </GlassButton>
    </div>
  );
}
