export default function StatusBar({ light = false }: { light?: boolean }) {
  const color = light ? "white" : "black";
  return (
    <div
      className={`flex items-center justify-between px-6 pt-4 pb-1 text-[15px] font-semibold ${
        light ? "text-white" : "text-black"
      }`}
    >
      <span className="w-[100px] text-center">9:41</span>
      <div className="flex w-[100px] items-center justify-center gap-1">
        <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
          <rect x="0" y="7" width="3" height="5" rx="0.5" fill={color} />
          <rect x="5" y="5" width="3" height="7" rx="0.5" fill={color} />
          <rect x="10" y="3" width="3" height="9" rx="0.5" fill={color} />
          <rect x="15" y="0" width="3" height="12" rx="0.5" fill={color} />
        </svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
          <path
            d="M8 10.5a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4Z"
            fill={color}
          />
          <path
            d="M4.6 6.9a4.8 4.8 0 0 1 6.8 0l-1.1 1.1a3.2 3.2 0 0 0-4.6 0L4.6 6.9Z"
            fill={color}
          />
          <path
            d="M2.2 4.5a8.2 8.2 0 0 1 11.6 0l-1.1 1.1a6.6 6.6 0 0 0-9.4 0L2.2 4.5Z"
            fill={color}
          />
        </svg>
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
          <rect
            x="0.5"
            y="0.5"
            width="21"
            height="11"
            rx="2.5"
            stroke={color}
            opacity="0.4"
          />
          <rect x="2" y="2" width="18" height="8" rx="1.5" fill={color} />
          <rect x="22.5" y="4" width="1.5" height="4" rx="0.75" fill={color} opacity="0.4" />
        </svg>
      </div>
    </div>
  );
}
