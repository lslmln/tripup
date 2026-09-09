import { glassStyle } from "./glass";

export default function GlassButton({
  children,
  ariaLabel,
  onClick,
}: {
  children: React.ReactNode;
  ariaLabel: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className="flex h-11 w-11 items-center justify-center rounded-full text-content-primary"
      style={glassStyle}
    >
      {children}
    </button>
  );
}
