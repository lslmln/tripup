import { glassStyle } from "./glass";

export default function GlassButton({
  children,
  ariaLabel,
  onClick,
  style,
  disabled = false,
}: {
  children: React.ReactNode;
  ariaLabel: string;
  onClick?: () => void;
  style?: React.CSSProperties;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-disabled={disabled}
      onClick={disabled ? undefined : onClick}
      className={`flex h-11 w-11 items-center justify-center rounded-full text-content-primary transition-transform duration-150 ease-out focus:outline-none ${
        disabled ? "opacity-40" : "active:scale-[0.97] hover:scale-[1.04]"
      }`}
      style={{ ...glassStyle, ...style }}
    >
      {children}
    </button>
  );
}
