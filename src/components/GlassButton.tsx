import { glassStyle } from "./glass";

export default function GlassButton({
  children,
  ariaLabel,
}: {
  children: React.ReactNode;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className="flex h-11 w-11 items-center justify-center rounded-full text-content-primary"
      style={glassStyle}
    >
      {children}
    </button>
  );
}
