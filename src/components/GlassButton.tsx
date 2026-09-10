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
      className="flex h-11 w-11 items-center justify-center rounded-full text-content-primary transition-transform duration-150 ease-out active:scale-[0.97] hover:scale-[1.04]"
      style={glassStyle}
    >
      {children}
    </button>
  );
}
