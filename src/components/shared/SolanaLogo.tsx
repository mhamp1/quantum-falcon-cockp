interface SolanaLogoProps {
  className?: string;
}

export default function SolanaLogo({ className = "w-8 h-8" }: SolanaLogoProps) {
  return (
    <svg viewBox="0 0 397.7 311.7" className={className} fill="currentColor">
      <defs>
        <linearGradient
          id="solana-gradient"
          x1="360.9"
          y1="351.5"
          x2="141.2"
          y2="131.9"
          gradientUnits="userSpaceOnUse"
          gradientTransform="matrix(1, 0, 0, -1, 0, 400)"
        >
          <stop offset="0" stopColor="oklch(0.92 0.17 154)" />
          <stop offset="1" stopColor="oklch(0.72 0.20 195)" />
        </linearGradient>
      </defs>
      <path
        fill="url(#solana-gradient)"
        d="M64.6,237.9c2.4-2.4,5.7-3.8,9.2-3.8h317.4c5.8,0,8.7,7,4.6,11.1l-62.7,62.7c-2.4,2.4-5.7,3.8-9.2,3.8H6.5c-5.8,0-8.7-7-4.6-11.1L64.6,237.9z"
      />
      <path
        fill="url(#solana-gradient)"
        d="M64.6,3.8C67.1,1.4,70.4,0,73.8,0h317.4c5.8,0,8.7,7,4.6,11.1l-62.7,62.7c-2.4,2.4-5.7,3.8-9.2,3.8H6.5c-5.8,0-8.7-7-4.6-11.1L64.6,3.8z"
      />
      <path
        fill="url(#solana-gradient)"
        d="M333.1,120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8,0-8.7,7-4.6,11.1l62.7,62.7c2.4,2.4,5.7,3.8,9.2,3.8h317.4c5.8,0,8.7-7,4.6-11.1L333.1,120.1z"
      />
    </svg>
  );
}
