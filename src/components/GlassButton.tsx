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
        disabled ? "" : "active:scale-[0.97] hover:scale-[1.04]"
      }`}
      style={{ ...glassStyle, ...style }}
    >
      {/* Matches iOS: the circle itself always reads as a normal button —
          only the icon fades toward invisible while disabled, then snaps to
          full opacity the moment the circle also fills with its enabled
          color (set via the `style` prop at the call site). */}
      <span
        className="flex items-center justify-center transition-opacity duration-150 ease-out"
        style={{ opacity: disabled ? 0.3 : 1 }}
      >
        {children}
      </span>
    </button>
  );
}
