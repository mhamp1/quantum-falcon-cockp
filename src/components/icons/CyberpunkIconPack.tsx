import React from 'react';

type IconProps = {
  size?: number;
  className?: string;
};

const CyberGlow = ({ children }: { children: React.ReactNode }) => (
  <>
    {children}
    <g filter="url(#glow)">
      {children}
    </g>
  </>
);

const IconWrapper = ({ children, size = 64 }: { children: React.ReactNode; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="glow">
        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <linearGradient id="grad-purple-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#DC1FFF"/>
        <stop offset="100%" stopColor="#00FFFF"/>
      </linearGradient>
      <linearGradient id="grad-pink-cyan" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#FF00FF"/>
        <stop offset="100%" stopColor="#00FFFF"/>
      </linearGradient>
      <linearGradient id="grad-cyan-green" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#00FFFF"/>
        <stop offset="100%" stopColor="#00FFAA"/>
      </linearGradient>
    </defs>
    {children}
  </svg>
);

export const IconWhaleTracker = ({ size, className }: IconProps) => (
  <div className={className}>
    <IconWrapper size={size}>
      <CyberGlow>
        <path d="M20 50 Q10 30, 30 35 Q50 40, 70 30 Q90 40, 80 60 Q70 80, 50 75 Q30 70, 20 50" fill="none" stroke="url(#grad-purple-cyan)" strokeWidth="5"/>
        <circle cx="75" cy="35" r="10" fill="#DC1FFF" opacity="0.8"/>
        <path d="M70 35 H80 M75 30 V40" stroke="#00FFFF" strokeWidth="3"/>
        <path d="M40 50 H60" stroke="#FF00FF" strokeWidth="4" strokeDasharray="5,5"/>
      </CyberGlow>
    </IconWrapper>
  </div>
);

export const IconRSIDivergence = ({ size, className }: IconProps) => (
  <div className={className}>
    <IconWrapper size={size}>
      <CyberGlow>
        <path d="M10 70 Q30 30, 50 70 Q70 110, 90 70" fill="none" stroke="#00FFFF" strokeWidth="6"/>
        <path d="M10 60 Q30 90, 50 50 Q70 10, 90 60" fill="none" stroke="#FF00FF" strokeWidth="5" strokeDasharray="8,8"/>
        <path d="M35 40 L50 20 L65 40" fill="none" stroke="#FF1493" strokeWidth="5"/>
        <path d="M35 60 L50 80 L65 60" fill="none" stroke="#00FF00" strokeWidth="5"/>
      </CyberGlow>
    </IconWrapper>
  </div>
);

export const IconLiquiditySweep = ({ size, className }: IconProps) => (
  <div className={className}>
    <IconWrapper size={size}>
      <CyberGlow>
        <circle cx="50" cy="50" r="35" fill="none" stroke="#00FFAA" strokeWidth="7"/>
        <path d="M20 50 H80 M50 20 V80" stroke="#FF00FF" strokeWidth="6"/>
        <path d="M15 15 L85 85 M15 85 L85 15" stroke="#DC1FFF" strokeWidth="5" opacity="0.7"/>
        <path d="M30 70 Q40 60, 50 70 Q60 80, 70 70" fill="none" stroke="#FFFF00" strokeWidth="4"/>
      </CyberGlow>
    </IconWrapper>
  </div>
);

export const IconVolumeProfile = ({ size, className }: IconProps) => (
  <div className={className}>
    <IconWrapper size={size}>
      <CyberGlow>
        <rect x="20" y="20" width="60" height="60" rx="10" fill="none" stroke="#00FFAA" strokeWidth="5"/>
        <path d="M25 75 L25 25 M40 75 L40 35 M55 75 L55 45 M70 75 L70 30" stroke="#DC1FFF" strokeWidth="6"/>
        <path d="M30 50 L50 30 L70 50" fill="none" stroke="#FF00FF" strokeWidth="4"/>
      </CyberGlow>
    </IconWrapper>
  </div>
);

export const IconFlashExecution = ({ size, className }: IconProps) => (
  <div className={className}>
    <IconWrapper size={size}>
      <CyberGlow>
        <path d="M50 10 L55 40 L90 45 L60 55 L70 90 L50 65 L30 90 L40 55 L10 45 L45 40 Z" fill="none" stroke="#FFFF00" strokeWidth="8"/>
        <path d="M50 20 V80" stroke="#FF00FF" strokeWidth="4"/>
        <path d="M30 50 H70 M40 40 H60 M40 60 H60" stroke="#00FFFF" strokeWidth="3"/>
      </CyberGlow>
    </IconWrapper>
  </div>
);

export const IconAIAgent = ({ size, className }: IconProps) => (
  <div className={className}>
    <IconWrapper size={size}>
      <CyberGlow>
        <circle cx="50" cy="50" r="35" fill="none" stroke="#FF00FF" strokeWidth="6"/>
        <circle cx="35" cy="40" r="8" fill="#00FFFF"/>
        <circle cx="65" cy="40" r="8" fill="#00FFFF"/>
        <path d="M35 60 Q50 75, 65 60" fill="none" stroke="#00FFFF" strokeWidth="5"/>
        <path d="M20 50 H80 M40 30 H60 M40 70 H60" stroke="#DC1FFF" strokeWidth="4"/>
      </CyberGlow>
    </IconWrapper>
  </div>
);

export const IconBollingerBreakout = ({ size, className }: IconProps) => (
  <div className={className}>
    <IconWrapper size={size}>
      <CyberGlow>
        <path d="M10 50 Q30 20, 50 50 Q70 80, 90 50" fill="none" stroke="#00FFFF" strokeWidth="6"/>
        <path d="M10 40 Q30 70, 50 40 Q70 10, 90 40" fill="none" stroke="#FF00FF" strokeWidth="5"/>
        <path d="M10 60 Q30 30, 50 60 Q70 90, 90 60" fill="none" stroke="#00FF00" strokeWidth="4" opacity="0.7"/>
        <path d="M50 80 L50 20" stroke="#FFFF00" strokeWidth="7" strokeDasharray="10,10"/>
      </CyberGlow>
    </IconWrapper>
  </div>
);

export const IconMeanReversion = ({ size, className }: IconProps) => (
  <div className={className}>
    <IconWrapper size={size}>
      <CyberGlow>
        <path d="M20 50 H80" stroke="#DC1FFF" strokeWidth="6"/>
        <path d="M30 30 L50 50 L70 30" fill="none" stroke="#00FFFF" strokeWidth="5"/>
        <path d="M30 70 L50 50 L70 70" fill="none" stroke="#FF00FF" strokeWidth="5"/>
        <path d="M40 40 L60 60 M60 40 L40 60" stroke="#00FF00" strokeWidth="4"/>
      </CyberGlow>
    </IconWrapper>
  </div>
);

export const IconArbitrageBot = ({ size, className }: IconProps) => (
  <div className={className}>
    <IconWrapper size={size}>
      <CyberGlow>
        <circle cx="30" cy="50" r="20" fill="none" stroke="#00FFAA" strokeWidth="5"/>
        <circle cx="70" cy="50" r="20" fill="none" stroke="#FF00FF" strokeWidth="5"/>
        <path d="M30 50 H70" stroke="#DC1FFF" strokeWidth="6"/>
        <path d="M40 40 L60 60 M60 40 L40 60" stroke="#00FFFF" strokeWidth="4"/>
        <path d="M25 30 L35 40 M65 30 L75 40" stroke="#FFFF00" strokeWidth="3"/>
      </CyberGlow>
    </IconWrapper>
  </div>
);

export const IconDCAAccumulator = ({ size, className }: IconProps) => (
  <div className={className}>
    <IconWrapper size={size}>
      <CyberGlow>
        <path d="M20 80 L20 20 L80 20" fill="none" stroke="#00FFFF" strokeWidth="6"/>
        <path d="M30 70 L30 30 M40 60 L40 40 M50 50 L50 50 M60 40 L60 60 M70 30 L70 70" stroke="#DC1FFF" strokeWidth="5"/>
        <circle cx="30" cy="50" r="5" fill="#FF00FF"/>
        <circle cx="40" cy="50" r="5" fill="#00FF00"/>
        <circle cx="60" cy="50" r="5" fill="#FFFF00"/>
      </CyberGlow>
    </IconWrapper>
  </div>
);

export const IconScalperPro = ({ size, className }: IconProps) => (
  <div className={className}>
    <IconWrapper size={size}>
      <CyberGlow>
        <path d="M50 10 L55 40 L90 45 L60 55 L70 90 L50 65 L30 90 L40 55 L10 45 L45 40 Z" fill="none" stroke="#FFFF00" strokeWidth="8"/>
        <path d="M50 20 V80" stroke="#FF00FF" strokeWidth="4"/>
        <path d="M20 50 H80" stroke="#00FFFF" strokeWidth="5" strokeDasharray="10,10"/>
      </CyberGlow>
    </IconWrapper>
  </div>
);

export const IconOnChainAnalytics = ({ size, className }: IconProps) => (
  <div className={className}>
    <IconWrapper size={size}>
      <CyberGlow>
        <path d="M20 50 Q40 30, 60 50 Q80 70, 100 50" fill="none" stroke="#DC1FFF" strokeWidth="6" strokeDasharray="5,5"/>
        <circle cx="50" cy="50" r="25" fill="none" stroke="#00FFFF" strokeWidth="5"/>
        <path d="M60 40 L90 20 L95 30" stroke="#FF00FF" strokeWidth="4"/>
      </CyberGlow>
    </IconWrapper>
  </div>
);

export const IconWhaleAlert = ({ size, className }: IconProps) => (
  <div className={className}>
    <IconWrapper size={size}>
      <CyberGlow>
        <path d="M50 20 Q40 40, 50 60 Q60 40, 50 20" fill="none" stroke="#FF00FF" strokeWidth="6"/>
        <path d="M45 60 L55 80" stroke="#00FFFF" strokeWidth="4"/>
        <path d="M20 50 Q30 40, 40 50 Q50 60, 60 50 Q70 40, 80 50" fill="none" stroke="#DC1FFF" strokeWidth="5"/>
      </CyberGlow>
    </IconWrapper>
  </div>
);

export const IconPumpDetector = ({ size, className }: IconProps) => (
  <div className={className}>
    <IconWrapper size={size}>
      <CyberGlow>
        <path d="M50 90 L30 50 L70 50 Z" fill="none" stroke="#00FF00" strokeWidth="6"/>
        <path d="M50 50 V10" stroke="#FFFF00" strokeWidth="8"/>
        <path d="M40 10 L50 0 L60 10" stroke="#FF00FF" strokeWidth="5"/>
        <circle cx="50" cy="30" r="10" fill="#DC1FFF"/>
      </CyberGlow>
    </IconWrapper>
  </div>
);

export const IconDumpProtection = ({ size, className }: IconProps) => (
  <div className={className}>
    <IconWrapper size={size}>
      <CyberGlow>
        <path d="M50 10 L30 50 L50 90 L70 50 Z" fill="none" stroke="#FF0000" strokeWidth="6"/>
        <path d="M50 30 V70" stroke="#00FFFF" strokeWidth="5" strokeDasharray="5,5"/>
        <circle cx="50" cy="50" r="15" fill="none" stroke="#DC1FFF" strokeWidth="4"/>
      </CyberGlow>
    </IconWrapper>
  </div>
);

export const IconSmartMoneyFlow = ({ size, className }: IconProps) => (
  <div className={className}>
    <IconWrapper size={size}>
      <CyberGlow>
        <path d="M20 20 H80 L60 80 H40 Z" fill="none" stroke="#00FFAA" strokeWidth="6"/>
        <circle cx="50" cy="50" r="10" fill="#DC1FFF"/>
        <circle cx="40" cy="60" r="8" fill="#00FFFF"/>
        <circle cx="60" cy="60" r="8" fill="#FF00FF"/>
      </CyberGlow>
    </IconWrapper>
  </div>
);

export const IconOrderBookHeatmap = ({ size, className }: IconProps) => (
  <div className={className}>
    <IconWrapper size={size}>
      <CyberGlow>
        <rect x="20" y="20" width="60" height="60" fill="none" stroke="#DC1FFF" strokeWidth="5"/>
        <rect x="25" y="25" width="10" height="10" fill="#FF0000" opacity="0.8"/>
        <rect x="40" y="25" width="10" height="10" fill="#FFFF00" opacity="0.8"/>
        <rect x="55" y="25" width="10" height="10" fill="#00FF00" opacity="0.8"/>
        <rect x="25" y="40" width="10" height="10" fill="#00FFFF" opacity="0.8"/>
        <rect x="40" y="40" width="10" height="10" fill="#FF00FF" opacity="0.8"/>
        <rect x="55" y="40" width="10" height="10" fill="#DC1FFF" opacity="0.8"/>
        <rect x="25" y="55" width="10" height="10" fill="#FF6600" opacity="0.8"/>
        <rect x="40" y="55" width="10" height="10" fill="#00FFAA" opacity="0.8"/>
        <rect x="55" y="55" width="10" height="10" fill="#FF1493" opacity="0.8"/>
      </CyberGlow>
    </IconWrapper>
  </div>
);

export const IconVWAPMaster = ({ size, className }: IconProps) => (
  <div className={className}>
    <IconWrapper size={size}>
      <CyberGlow>
        <path d="M10 50 H90" stroke="#00FFFF" strokeWidth="6"/>
        <circle cx="30" cy="50" r="8" fill="#DC1FFF"/>
        <circle cx="50" cy="50" r="8" fill="#FF00FF"/>
        <circle cx="70" cy="50" r="8" fill="#00FF00"/>
        <path d="M20 40 L40 60 M40 40 L60 60 M60 40 L80 60" stroke="#FFFF00" strokeWidth="4"/>
      </CyberGlow>
    </IconWrapper>
  </div>
);

export const IconFibonacciGod = ({ size, className }: IconProps) => (
  <div className={className}>
    <IconWrapper size={size}>
      <CyberGlow>
        <path d="M50 50 Q60 40, 60 50 Q60 60, 50 60 Q40 60, 40 50 Q40 40, 50 40" fill="none" stroke="#DC1FFF" strokeWidth="5"/>
        <path d="M60 50 Q70 40, 70 50 Q70 60, 60 70 Q50 70, 50 60" fill="none" stroke="#00FFFF" strokeWidth="4"/>
        <line x1="20" y1="80" x2="80" y2="20" stroke="#FF00FF" strokeWidth="3"/>
        <text x="25" y="75" fill="#00FF00" fontSize="10">0.618</text>
        <text x="65" y="35" fill="#FFFF00" fontSize="10">0.382</text>
      </CyberGlow>
    </IconWrapper>
  </div>
);

export const IconQuantumReversal = ({ size, className }: IconProps) => (
  <div className={className}>
    <IconWrapper size={size}>
      <CyberGlow>
        <circle cx="50" cy="50" r="40" fill="none" stroke="#00FFAA" strokeWidth="6" strokeDasharray="10,5"/>
        <path d="M50 10 L50 90" stroke="#FF00FF" strokeWidth="5"/>
        <path d="M10 50 L90 50" stroke="#DC1FFF" strokeWidth="5"/>
        <path d="M40 40 L60 60 M60 40 L40 60" stroke="#00FFFF" strokeWidth="4"/>
      </CyberGlow>
    </IconWrapper>
  </div>
);

export const IconNeonGridBot = ({ size, className }: IconProps) => (
  <div className={className}>
    <IconWrapper size={size}>
      <CyberGlow>
        <path d="M20 20 H80 V80 H20 Z" fill="none" stroke="#00FFFF" strokeWidth="5"/>
        <path d="M20 40 H80 M20 60 H80 M40 20 V80 M60 20 V80" stroke="#DC1FFF" strokeWidth="4"/>
        <circle cx="40" cy="40" r="8" fill="#FF00FF"/>
        <circle cx="60" cy="60" r="8" fill="#00FF00"/>
      </CyberGlow>
    </IconWrapper>
  </div>
);

export const IconFlashCrashHunter = ({ size, className }: IconProps) => (
  <div className={className}>
    <IconWrapper size={size}>
      <CyberGlow>
        <path d="M50 20 L20 80 L80 80 Z" fill="none" stroke="#FF0000" strokeWidth="6"/>
        <path d="M50 80 V20" stroke="#00FFFF" strokeWidth="5" strokeDasharray="10,10"/>
        <circle cx="50" cy="50" r="15" fill="none" stroke="#DC1FFF" strokeWidth="4"/>
        <path d="M45 45 L55 55 M55 45 L45 55" stroke="#FFFF00" strokeWidth="3"/>
      </CyberGlow>
    </IconWrapper>
  </div>
);

export const IconTrendReversalScanner = ({ size, className }: IconProps) => (
  <div className={className}>
    <IconWrapper size={size}>
      <CyberGlow>
        <path d="M10 50 Q30 20, 50 50 Q70 80, 90 50" fill="none" stroke="#00FF00" strokeWidth="6"/>
        <path d="M10 50 L90 50" stroke="#FF00FF" strokeWidth="4" strokeDasharray="5,5"/>
        <path d="M50 30 L30 50 L50 70 L70 50 L50 30" fill="none" stroke="#DC1FFF" strokeWidth="5"/>
      </CyberGlow>
    </IconWrapper>
  </div>
);

export const IconMomentumOscillator = ({ size, className }: IconProps) => (
  <div className={className}>
    <IconWrapper size={size}>
      <CyberGlow>
        <path d="M10 50 Q20 40, 30 50 Q40 60, 50 50 Q60 40, 70 50 Q80 60, 90 50" fill="none" stroke="#00FFFF" strokeWidth="6"/>
        <path d="M10 60 Q20 70, 30 60 Q40 50, 50 60 Q60 70, 70 60 Q80 50, 90 60" fill="none" stroke="#FF00FF" strokeWidth="5"/>
        <path d="M50 20 L50 80" stroke="#DC1FFF" strokeWidth="4"/>
      </CyberGlow>
    </IconWrapper>
  </div>
);

export const IconVolatilityBreakout = ({ size, className }: IconProps) => (
  <div className={className}>
    <IconWrapper size={size}>
      <CyberGlow>
        <rect x="30" y="30" width="40" height="40" rx="5" fill="none" stroke="#FF0000" strokeWidth="6"/>
        <path d="M50 50 L20 20 M50 50 L80 20 M50 50 L20 80 M50 50 L80 80" stroke="#FFFF00" strokeWidth="5"/>
        <circle cx="50" cy="50" r="10" fill="#DC1FFF"/>
      </CyberGlow>
    </IconWrapper>
  </div>
);

export const IconSupportResistanceFinder = ({ size, className }: IconProps) => (
  <div className={className}>
    <IconWrapper size={size}>
      <CyberGlow>
        <path d="M10 30 H90 M10 70 H90" stroke="#00FFAA" strokeWidth="6"/>
        <circle cx="30" cy="30" r="10" fill="none" stroke="#DC1FFF" strokeWidth="4"/>
        <circle cx="70" cy="70" r="10" fill="none" stroke="#FF00FF" strokeWidth="4"/>
        <path d="M30 40 L30 60 M70 60 L70 80" stroke="#00FFFF" strokeWidth="5"/>
      </CyberGlow>
    </IconWrapper>
  </div>
);

export const IconMACDCrossover = ({ size, className }: IconProps) => (
  <div className={className}>
    <IconWrapper size={size}>
      <CyberGlow>
        <path d="M10 80 Q30 20, 50 80 Q70 140, 90 80" fill="none" stroke="#DC1FFF" strokeWidth="6"/>
        <path d="M10 70 Q30 100, 50 60 Q70 20, 90 70" fill="none" stroke="#00FFFF" strokeWidth="5"/>
        <path d="M50 50 H90" stroke="#FF00FF" strokeWidth="4" strokeDasharray="5,5"/>
      </CyberGlow>
    </IconWrapper>
  </div>
);

export const IconStochasticOscillator = ({ size, className }: IconProps) => (
  <div className={className}>
    <IconWrapper size={size}>
      <CyberGlow>
        <path d="M10 20 Q30 80, 50 20 Q70 80, 90 20" fill="none" stroke="#FF00FF" strokeWidth="6"/>
        <path d="M10 30 Q30 70, 50 30 Q70 70, 90 30" fill="none" stroke="#00FFFF" strokeWidth="5" strokeDasharray="5,5"/>
        <rect x="10" y="10" width="80" height="10" fill="#FF0000" opacity="0.5"/>
        <rect x="10" y="70" width="80" height="10" fill="#00FF00" opacity="0.5"/>
      </CyberGlow>
    </IconWrapper>
  </div>
);

export const IconParabolicSAR = ({ size, className }: IconProps) => (
  <div className={className}>
    <IconWrapper size={size}>
      <CyberGlow>
        <path d="M10 80 Q50 10, 90 80" fill="none" stroke="#DC1FFF" strokeWidth="6"/>
        <circle cx="20" cy="70" r="4" fill="#00FFFF"/>
        <circle cx="35" cy="50" r="5" fill="#00FFFF"/>
        <circle cx="50" cy="30" r="6" fill="#00FFFF"/>
        <circle cx="65" cy="50" r="5" fill="#FF00FF"/>
        <circle cx="80" cy="70" r="4" fill="#FF00FF"/>
      </CyberGlow>
    </IconWrapper>
  </div>
);

export const IconIchimokuCloud = ({ size, className }: IconProps) => (
  <div className={className}>
    <IconWrapper size={size}>
      <CyberGlow>
        <path d="M10 50 H90" stroke="#00FFAA" strokeWidth="5"/>
        <path d="M10 40 H90" stroke="#FF00FF" strokeWidth="5" strokeDasharray="5,5"/>
        <path d="M10 60 H90" stroke="#DC1FFF" strokeWidth="5" strokeDasharray="5,5"/>
        <rect x="30" y="40" width="40" height="20" fill="#00FFFF" opacity="0.3"/>
      </CyberGlow>
    </IconWrapper>
  </div>
);

export const IconElliottWaveAnalyzer = ({ size, className }: IconProps) => (
  <div className={className}>
    <IconWrapper size={size}>
      <CyberGlow>
        <path d="M10 80 L30 20 L50 80 L70 20 L90 80" fill="none" stroke="#00FFFF" strokeWidth="6"/>
        <text x="15" y="75" fill="#DC1FFF" fontSize="12">1</text>
        <text x="35" y="25" fill="#FF00FF" fontSize="12">2</text>
        <text x="55" y="75" fill="#00FF00" fontSize="12">3</text>
        <text x="75" y="25" fill="#FFFF00" fontSize="12">4</text>
      </CyberGlow>
    </IconWrapper>
  </div>
);

export const IconGannFan = ({ size, className }: IconProps) => (
  <div className={className}>
    <IconWrapper size={size}>
      <CyberGlow>
        <circle cx="20" cy="80" r="5" fill="#DC1FFF"/>
        <path d="M20 80 L90 10" stroke="#00FFFF" strokeWidth="5"/>
        <path d="M20 80 L90 30" stroke="#FF00FF" strokeWidth="5"/>
        <path d="M20 80 L90 50" stroke="#00FF00" strokeWidth="5"/>
        <path d="M20 80 L90 70" stroke="#FFFF00" strokeWidth="5"/>
        <path d="M20 80 L90 90" stroke="#FF6600" strokeWidth="5"/>
      </CyberGlow>
    </IconWrapper>
  </div>
);

export const IconPivotPointCalculator = ({ size, className }: IconProps) => (
  <div className={className}>
    <IconWrapper size={size}>
      <CyberGlow>
        <path d="M50 10 V90" stroke="#DC1FFF" strokeWidth="6"/>
        <path d="M10 30 H90 M10 50 H90 M10 70 H90" stroke="#00FFFF" strokeWidth="5"/>
        <text x="5" y="35" fill="#FF00FF" fontSize="10">R1</text>
        <text x="5" y="55" fill="#00FF00" fontSize="10">Pivot</text>
        <text x="5" y="75" fill="#FFFF00" fontSize="10">S1</text>
      </CyberGlow>
    </IconWrapper>
  </div>
);

export const IconHeikinAshiConverter = ({ size, className }: IconProps) => (
  <div className={className}>
    <IconWrapper size={size}>
      <CyberGlow>
        <rect x="20" y="30" width="10" height="40" fill="#00FF00" stroke="#DC1FFF" strokeWidth="3"/>
        <rect x="35" y="20" width="10" height="60" fill="#FF0000" stroke="#00FFFF" strokeWidth="3"/>
        <rect x="50" y="40" width="10" height="30" fill="#00FF00" stroke="#FF00FF" strokeWidth="3"/>
        <rect x="65" y="25" width="10" height="50" fill="#FF0000" stroke="#FFFF00" strokeWidth="3"/>
      </CyberGlow>
    </IconWrapper>
  </div>
);

export const IconRenkoBrickBuilder = ({ size, className }: IconProps) => (
  <div className={className}>
    <IconWrapper size={size}>
      <CyberGlow>
        <rect x="20" y="70" width="20" height="20" fill="#00FF00" stroke="#DC1FFF" strokeWidth="3"/>
        <rect x="40" y="50" width="20" height="20" fill="#FF0000" stroke="#00FFFF" strokeWidth="3"/>
        <rect x="60" y="30" width="20" height="20" fill="#00FF00" stroke="#FF00FF" strokeWidth="3"/>
        <rect x="40" y="30" width="20" height="20" fill="#FF0000" stroke="#FFFF00" strokeWidth="3"/>
        <rect x="20" y="50" width="20" height="20" fill="#00FF00" stroke="#FF6600" strokeWidth="3"/>
      </CyberGlow>
    </IconWrapper>
  </div>
);

export const IconKagiLineChart = ({ size, className }: IconProps) => (
  <div className={className}>
    <IconWrapper size={size}>
      <CyberGlow>
        <path d="M10 80 L30 20 L50 80 L70 20 L90 80" fill="none" stroke="#00FFFF" strokeWidth="6"/>
        <path d="M30 20 H50 M70 20 H90" stroke="#FF00FF" strokeWidth="4"/>
      </CyberGlow>
    </IconWrapper>
  </div>
);

export const IconPointAndFigure = ({ size, className }: IconProps) => (
  <div className={className}>
    <IconWrapper size={size}>
      <CyberGlow>
        <path d="M20 20 H80 V80 H20 Z" fill="none" stroke="#DC1FFF" strokeWidth="5"/>
        <text x="30" y="40" fill="#00FF00" fontSize="20">X</text>
        <text x="50" y="40" fill="#FF0000" fontSize="20">O</text>
        <text x="70" y="40" fill="#00FF00" fontSize="20">X</text>
        <text x="30" y="60" fill="#FF0000" fontSize="20">O</text>
        <text x="50" y="60" fill="#00FF00" fontSize="20">X</text>
        <text x="70" y="60" fill="#FF0000" fontSize="20">O</text>
      </CyberGlow>
    </IconWrapper>
  </div>
);

export const IconLineBreakChart = ({ size, className }: IconProps) => (
  <div className={className}>
    <IconWrapper size={size}>
      <CyberGlow>
        <path d="M10 30 H90 M10 50 H90 M10 70 H90" stroke="#00FFFF" strokeWidth="6"/>
        <path d="M50 20 V80" stroke="#FF00FF" strokeWidth="4" strokeDasharray="10,10"/>
      </CyberGlow>
    </IconWrapper>
  </div>
);

export const IconThreeLineBreak = ({ size, className }: IconProps) => (
  <div className={className}>
    <IconWrapper size={size}>
      <CyberGlow>
        <rect x="30" y="20" width="10" height="60" fill="#00FF00" stroke="#DC1FFF" strokeWidth="3"/>
        <rect x="45" y="30" width="10" height="50" fill="#FF0000" stroke="#00FFFF" strokeWidth="3"/>
        <rect x="60" y="40" width="10" height="40" fill="#00FF00" stroke="#FF00FF" strokeWidth="3"/>
        <path d="M20 50 H80" stroke="#FFFF00" strokeWidth="5" strokeDasharray="5,5"/>
      </CyberGlow>
    </IconWrapper>
  </div>
);

export const IconRenkoAdvanced = ({ size, className }: IconProps) => (
  <div className={className}>
    <IconWrapper size={size}>
      <CyberGlow>
        <rect x="20" y="60" width="20" height="20" fill="#00FF00" stroke="#DC1FFF" strokeWidth="3"/>
        <rect x="40" y="40" width="20" height="20" fill="#FF0000" stroke="#00FFFF" strokeWidth="3"/>
        <rect x="60" y="60" width="20" height="20" fill="#00FF00" stroke="#FF00FF" strokeWidth="3"/>
        <path d="M30 50 L50 30 L70 50" stroke="#FFFF00" strokeWidth="5"/>
      </CyberGlow>
    </IconWrapper>
  </div>
);

export const IconKlingerOscillator = ({ size, className }: IconProps) => (
  <div className={className}>
    <IconWrapper size={size}>
      <CyberGlow>
        <path d="M10 50 Q30 30, 50 50 Q70 70, 90 50" fill="none" stroke="#00FFFF" strokeWidth="6"/>
        <path d="M10 60 Q30 80, 50 60 Q70 40, 90 60" fill="none" stroke="#FF00FF" strokeWidth="5"/>
        <rect x="20" y="70" width="5" height="20" fill="#00FF00" opacity="0.8"/>
        <rect x="30" y="70" width="5" height="10" fill="#FF0000" opacity="0.8"/>
        <rect x="40" y="70" width="5" height="25" fill="#00FF00" opacity="0.8"/>
        <rect x="50" y="70" width="5" height="15" fill="#FF0000" opacity="0.8"/>
        <rect x="60" y="70" width="5" height="30" fill="#00FF00" opacity="0.8"/>
        <rect x="70" y="70" width="5" height="5" fill="#FF0000" opacity="0.8"/>
        <rect x="80" y="70" width="5" height="20" fill="#00FF00" opacity="0.8"/>
      </CyberGlow>
    </IconWrapper>
  </div>
);

export const IconChandeMomentum = ({ size, className }: IconProps) => (
  <div className={className}>
    <IconWrapper size={size}>
      <CyberGlow>
        <rect x="20" y="50" width="60" height="5" fill="none" stroke="#DC1FFF" strokeWidth="4"/>
        <path d="M20 55 V45 M80 55 V45" stroke="#00FFFF" strokeWidth="3"/>
        <path d="M30 30 L50 50 L70 30" fill="none" stroke="#FF00FF" strokeWidth="5"/>
        <path d="M30 70 L50 50 L70 70" fill="none" stroke="#00FF00" strokeWidth="5"/>
      </CyberGlow>
    </IconWrapper>
  </div>
);

export const IconDetrendedPriceOscillator = ({ size, className }: IconProps) => (
  <div className={className}>
    <IconWrapper size={size}>
      <CyberGlow>
        <path d="M10 50 Q30 20, 50 50 Q70 80, 90 50" fill="none" stroke="#00FFFF" strokeWidth="6"/>
        <path d="M10 50 H90" stroke="#FF00FF" strokeWidth="4" strokeDasharray="5,5"/>
        <circle cx="50" cy="50" r="10" fill="#DC1FFF" opacity="0.7"/>
      </CyberGlow>
    </IconWrapper>
  </div>
);

export const IconEaseOfMovement = ({ size, className }: IconProps) => (
  <div className={className}>
    <IconWrapper size={size}>
      <CyberGlow>
        <path d="M10 50 L90 50" stroke="#DC1FFF" strokeWidth="6"/>
        <path d="M20 40 L30 50 L20 60" fill="none" stroke="#00FFFF" strokeWidth="5"/>
        <path d="M40 40 L50 50 L40 60" fill="none" stroke="#FF00FF" strokeWidth="5"/>
        <path d="M60 40 L70 50 L60 60" fill="none" stroke="#00FF00" strokeWidth="5"/>
        <path d="M80 40 L90 50 L80 60" fill="none" stroke="#FFFF00" strokeWidth="5"/>
      </CyberGlow>
    </IconWrapper>
  </div>
);

export const IconForceIndex = ({ size, className }: IconProps) => (
  <div className={className}>
    <IconWrapper size={size}>
      <CyberGlow>
        <rect x="20" y="40" width="60" height="20" rx="5" fill="none" stroke="#00FFAA" strokeWidth="5"/>
        <path d="M50 50 L90 50" stroke="#FF00FF" strokeWidth="6"/>
        <path d="M85 45 L90 50 L85 55" stroke="#DC1FFF" strokeWidth="4"/>
        <rect x="30" y="45" width="10" height="10" fill="#00FFFF" opacity="0.8"/>
        <rect x="45" y="45" width="10" height="10" fill="#FF0000" opacity="0.8"/>
        <rect x="60" y="45" width="10" height="10" fill="#00FF00" opacity="0.8"/>
      </CyberGlow>
    </IconWrapper>
  </div>
);

export const IconMassIndex = ({ size, className }: IconProps) => (
  <div className={className}>
    <IconWrapper size={size}>
      <CyberGlow>
        <circle cx="50" cy="50" r="30" fill="none" stroke="#DC1FFF" strokeWidth="6"/>
        <path d="M50 20 V80" stroke="#00FFFF" strokeWidth="5"/>
        <rect x="30" y="70" width="40" height="10" fill="#FF00FF" opacity="0.8"/>
        <path d="M40 30 L60 30" stroke="#00FF00" strokeWidth="4"/>
      </CyberGlow>
    </IconWrapper>
  </div>
);

export const IconMoneyFlowIndex = ({ size, className }: IconProps) => (
  <div className={className}>
    <IconWrapper size={size}>
      <CyberGlow>
        <path d="M20 20 H80 L60 80 H40 Z" fill="none" stroke="#00FFAA" strokeWidth="6"/>
        <circle cx="50" cy="40" r="10" fill="#DC1FFF"/>
        <path d="M50 50 V70" stroke="#FF00FF" strokeWidth="4"/>
        <text x="45" y="45" fill="#00FFFF" fontSize="15">$</text>
      </CyberGlow>
    </IconWrapper>
  </div>
);

export const IconNegativeVolumeIndex = ({ size, className }: IconProps) => (
  <div className={className}>
    <IconWrapper size={size}>
      <CyberGlow>
        <rect x="20" y="80" width="60" height="-60" rx="10" fill="none" stroke="#FF0000" strokeWidth="5"/>
        <path d="M25 80 L25 20 M40 80 L40 40 M55 80 L55 30 M70 80 L70 50" stroke="#DC1FFF" strokeWidth="6"/>
      </CyberGlow>
    </IconWrapper>
  </div>
);

export const IconOnBalanceVolume = ({ size, className }: IconProps) => (
  <div className={className}>
    <IconWrapper size={size}>
      <CyberGlow>
        <path d="M50 20 V80" stroke="#00FFFF" strokeWidth="5"/>
        <rect x="20" y="40" width="30" height="20" fill="#00FF00" opacity="0.8"/>
        <rect x="50" y="60" width="30" height="20" fill="#FF0000" opacity="0.8"/>
        <path d="M10 50 H90" stroke="#DC1FFF" strokeWidth="6"/>
      </CyberGlow>
    </IconWrapper>
  </div>
);

export const IconPositiveVolumeIndex = ({ size, className }: IconProps) => (
  <div className={className}>
    <IconWrapper size={size}>
      <CyberGlow>
        <rect x="20" y="20" width="60" height="60" rx="10" fill="none" stroke="#00FF00" strokeWidth="5"/>
        <path d="M25 80 L25 20 M40 80 L40 30 M55 80 L55 40 M70 80 L70 25" stroke="#DC1FFF" strokeWidth="6"/>
      </CyberGlow>
    </IconWrapper>
  </div>
);
