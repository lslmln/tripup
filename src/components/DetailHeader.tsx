import { CaretLeft } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import GlassButton from "./GlassButton";

export default function DetailHeader({
  tripId,
  title,
  avatar,
}: {
  tripId: string;
  title: string;
  avatar: string;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <Link href="/">
        <GlassButton ariaLabel="Back">
          <CaretLeft size={22} />
        </GlassButton>
      </Link>
      <span className="font-karla text-nav font-medium text-content-primary">
        {title}
      </span>
      <Link href={`/trip/${tripId}/members`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatar}
          alt=""
          className="h-11 w-11 shrink-0 rounded-full border border-border-primary object-cover"
        />
      </Link>
    </div>
  );
}
