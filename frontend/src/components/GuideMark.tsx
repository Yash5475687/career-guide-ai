export function GuideMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="url(#gm-bg)" />
      <path
        d="M8 23L13 12L17 18L21 9L24 15"
        stroke="white"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="15" r="2.2" fill="white" />
      <defs>
        <linearGradient id="gm-bg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22C983" />
          <stop offset="0.55" stopColor="#4C7EE0" />
          <stop offset="1" stopColor="#F5A623" />
        </linearGradient>
      </defs>
    </svg>
  );
}
