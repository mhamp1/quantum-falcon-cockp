import React from 'react';

type IconProps = {
  size?: number;
  className?: string;
};

const IconWrapper = ({ children, size = 64, className }: { children: React.ReactNode; size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <filter id="cyber-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="blur"/>
        <feFlood floodColor="#DC1FFF" floodOpacity="0.8"/>
        <feComposite in2="blur" operator="in"/>
        <feMerge>
          <feMergeNode/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>

      <linearGradient id="purple-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#DC1FFF"/>
        <stop offset="100%" stopColor="#00FFFF"/>
      </linearGradient>
      <linearGradient id="pink-cyan" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#FF00FF"/>
        <stop offset="100%" stopColor="#00FFFF"/>
      </linearGradient>
      <linearGradient id="cyan-green" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#00FFFF"/>
        <stop offset="100%" stopColor="#00FFAA"/>
      </linearGradient>
    </defs>
    <g filter="url(#cyber-glow)">
      {children}
    </g>
  </svg>
);

export const IconWhaleTracker = ({ size, className }: IconProps) => (
  <IconWrapper size={size} className={className}>
    <path d="M20 50 Q10 30, 30 35 Q50 40, 70 30 Q90 40, 80 60 Q70 80, 50 75 Q30 70, 20 50" fill="none" stroke="url(#purple-cyan)" strokeWidth="5"/>
    <circle cx="75" cy="35" r="10" fill="#DC1FFF" opacity="0.8"/>
    <path d="M70 35 H80 M75 30 V40" stroke="#00FFFF" strokeWidth="3"/>
    <path d="M40 50 H60" stroke="#FF00FF" strokeWidth="4" strokeDasharray="5,5"/>
  </IconWrapper>
);

export const IconRSIDivergence = ({ size, className }: IconProps) => (
  <IconWrapper size={size} className={className}>
    <path d="M10 70 Q30 30, 50 70 Q70 110, 90 70" fill="none" stroke="#00FFFF" strokeWidth="6"/>
    <path d="M10 60 Q30 90, 50 50 Q70 10, 90 60" fill="none" stroke="#FF00FF" strokeWidth="5" strokeDasharray="8,8"/>
    <path d="M35 40 L50 20 L65 40" fill="none" stroke="#FF1493" strokeWidth="5"/>
    <path d="M35 60 L50 80 L65 60" fill="none" stroke="#00FF00" strokeWidth="5"/>
  </IconWrapper>
);

export const IconLiquiditySweep = ({ size, className }: IconProps) => (
  <IconWrapper size={size} className={className}>
    <circle cx="50" cy="50" r="35" fill="none" stroke="#00FFAA" strokeWidth="7"/>
    <path d="M20 50 H80 M50 20 V80" stroke="#FF00FF" strokeWidth="6"/>
    <path d="M15 15 L85 85 M15 85 L85 15" stroke="#DC1FFF" strokeWidth="5" opacity="0.7"/>
    <path d="M30 70 Q40 60, 50 70 Q60 80, 70 70" fill="none" stroke="#FFFF00" strokeWidth="4"/>
  </IconWrapper>
);

export const IconVolumeProfile = ({ size, className }: IconProps) => (
  <IconWrapper size={size} className={className}>
    <rect x="20" y="20" width="60" height="60" rx="10" fill="none" stroke="#00FFAA" strokeWidth="5"/>
    <path d="M25 75 L25 25 M40 75 L40 35 M55 75 L55 45 M70 75 L70 30" stroke="#DC1FFF" strokeWidth="6"/>
    <path d="M30 50 L50 30 L70 50" fill="none" stroke="#FF00FF" strokeWidth="4"/>
  </IconWrapper>
);

export const IconFlashExecution = ({ size, className }: IconProps) => (
  <IconWrapper size={size} className={className}>
    <path d="M50 10 L55 40 L90 45 L60 55 L70 90 L50 65 L30 90 L40 55 L10 45 L45 40 Z" fill="none" stroke="#FFFF00" strokeWidth="8"/>
    <path d="M50 20 V80" stroke="#FF00FF" strokeWidth="4"/>
    <path d="M30 50 H70 M40 40 H60 M40 60 H60" stroke="#00FFFF" strokeWidth="3"/>
  </IconWrapper>
);

export const IconAIAgent = ({ size, className }: IconProps) => (
  <IconWrapper size={size} className={className}>
    <circle cx="50" cy="50" r="35" fill="none" stroke="#FF00FF" strokeWidth="6"/>
    <circle cx="35" cy="40" r="8" fill="#00FFFF"/>
    <circle cx="65" cy="40" r="8" fill="#00FFFF"/>
    <path d="M35 60 Q50 75, 65 60" fill="none" stroke="#00FFFF" strokeWidth="5"/>
    <path d="M20 50 H80 M40 30 H60 M40 70 H60" stroke="#DC1FFF" strokeWidth="4"/>
  </IconWrapper>
);

export const IconBollingerBreakout = ({ size, className }: IconProps) => (
  <IconWrapper size={size} className={className}>
    <path d="M10 50 Q30 20, 50 50 Q70 80, 90 50" fill="none" stroke="#00FFFF" strokeWidth="6"/>
    <path d="M10 40 Q30 70, 50 40 Q70 10, 90 40" fill="none" stroke="#FF00FF" strokeWidth="5"/>
    <path d="M10 60 Q30 30, 50 60 Q70 90, 90 60" fill="none" stroke="#00FF00" strokeWidth="4" opacity="0.7"/>
    <path d="M50 80 L50 20" stroke="#FFFF00" strokeWidth="7" strokeDasharray="10,10"/>
  </IconWrapper>
);

export const IconMeanReversion = ({ size, className }: IconProps) => (
  <IconWrapper size={size} className={className}>
    <path d="M20 50 H80" stroke="#DC1FFF" strokeWidth="6"/>
    <path d="M30 30 L50 50 L70 30" fill="none" stroke="#00FFFF" strokeWidth="5"/>
    <path d="M30 70 L50 50 L70 70" fill="none" stroke="#FF00FF" strokeWidth="5"/>
    <path d="M40 40 L60 60 M60 40 L40 60" stroke="#00FF00" strokeWidth="4"/>
  </IconWrapper>
);

export const IconArbitrageBot = ({ size, className }: IconProps) => (
  <IconWrapper size={size} className={className}>
    <circle cx="30" cy="50" r="20" fill="none" stroke="#00FFAA" strokeWidth="5"/>
    <circle cx="70" cy="50" r="20" fill="none" stroke="#FF00FF" strokeWidth="5"/>
    <path d="M30 50 H70" stroke="#DC1FFF" strokeWidth="6"/>
    <path d="M40 40 L60 60 M60 40 L40 60" stroke="#00FFFF" strokeWidth="4"/>
    <path d="M25 30 L35 40 M65 30 L75 40" stroke="#FFFF00" strokeWidth="3"/>
  </IconWrapper>
);

export const IconDCAAccumulator = ({ size, className }: IconProps) => (
  <IconWrapper size={size} className={className}>
    <path d="M20 80 L20 20 L80 20" fill="none" stroke="#00FFFF" strokeWidth="6"/>
    <path d="M30 70 L30 30 M40 60 L40 40 M50 50 L50 50 M60 40 L60 60 M70 30 L70 70" stroke="#DC1FFF" strokeWidth="5"/>
    <circle cx="30" cy="50" r="5" fill="#FF00FF"/>
    <circle cx="40" cy="50" r="5" fill="#00FF00"/>
    <circle cx="60" cy="50" r="5" fill="#FFFF00"/>
  </IconWrapper>
);

export const IconScalperPro = ({ size, className }: IconProps) => (
  <IconWrapper size={size} className={className}>
    <path d="M50 10 L55 40 L90 45 L60 55 L70 90 L50 65 L30 90 L40 55 L10 45 L45 40 Z" fill="none" stroke="#FFFF00" strokeWidth="8"/>
    <path d="M50 20 V80" stroke="#FF00FF" strokeWidth="4"/>
    <path d="M20 50 H80" stroke="#00FFFF" strokeWidth="5" strokeDasharray="10,10"/>
  </IconWrapper>
);

export const IconOnChainAnalytics = ({ size, className }: IconProps) => (
  <IconWrapper size={size} className={className}>
    <path d="M20 50 Q40 30, 60 50 Q80 70, 100 50" fill="none" stroke="#DC1FFF" strokeWidth="6" strokeDasharray="5,5"/>
    <circle cx="50" cy="50" r="25" fill="none" stroke="#00FFFF" strokeWidth="5"/>
    <path d="M60 40 L90 20 L95 30" stroke="#FF00FF" strokeWidth="4"/>
  </IconWrapper>
);

export const IconWhaleAlert = ({ size, className }: IconProps) => (
  <IconWrapper size={size} className={className}>
    <path d="M50 20 Q40 40, 50 60 Q60 40, 50 20" fill="none" stroke="#FF00FF" strokeWidth="6"/>
    <path d="M45 60 L55 80" stroke="#00FFFF" strokeWidth="4"/>
    <path d="M20 50 Q30 40, 40 50 Q50 60, 60 50 Q70 40, 80 50" fill="none" stroke="#DC1FFF" strokeWidth="5"/>
  </IconWrapper>
);

export const IconPumpDetector = ({ size, className }: IconProps) => (
  <IconWrapper size={size} className={className}>
    <path d="M50 90 L30 50 L70 50 Z" fill="none" stroke="#00FF00" strokeWidth="6"/>
    <path d="M50 50 V10" stroke="#FFFF00" strokeWidth="8"/>
    <path d="M40 10 L50 0 L60 10" stroke="#FF00FF" strokeWidth="5"/>
    <circle cx="50" cy="30" r="10" fill="#DC1FFF"/>
  </IconWrapper>
);

export const IconDumpProtection = ({ size, className }: IconProps) => (
  <IconWrapper size={size} className={className}>
    <path d="M50 10 L30 50 L50 90 L70 50 Z" fill="none" stroke="#FF0000" strokeWidth="6"/>
    <path d="M50 30 V70" stroke="#00FFFF" strokeWidth="5" strokeDasharray="5,5"/>
    <circle cx="50" cy="50" r="15" fill="none" stroke="#DC1FFF" strokeWidth="4"/>
  </IconWrapper>
);

export const IconSmartMoneyFlow = ({ size, className }: IconProps) => (
  <IconWrapper size={size} className={className}>
    <path d="M20 20 H80 L60 80 H40 Z" fill="none" stroke="#00FFAA" strokeWidth="6"/>
    <circle cx="50" cy="50" r="10" fill="#DC1FFF"/>
    <circle cx="40" cy="60" r="8" fill="#00FFFF"/>
    <circle cx="60" cy="60" r="8" fill="#FF00FF"/>
  </IconWrapper>
);

export const IconOrderBookHeatmap = ({ size, className }: IconProps) => (
  <IconWrapper size={size} className={className}>
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
  </IconWrapper>
);

export const IconVWAPMaster = ({ size, className }: IconProps) => (
  <IconWrapper size={size} className={className}>
    <path d="M10 50 H90" stroke="#00FFFF" strokeWidth="6"/>
    <circle cx="30" cy="50" r="8" fill="#DC1FFF"/>
    <circle cx="50" cy="50" r="8" fill="#FF00FF"/>
    <circle cx="70" cy="50" r="8" fill="#00FF00"/>
    <path d="M20 40 L40 60 M40 40 L60 60 M60 40 L80 60" stroke="#FFFF00" strokeWidth="4"/>
  </IconWrapper>
);

export const IconFibonacciGod = ({ size, className }: IconProps) => (
  <IconWrapper size={size} className={className}>
    <path d="M50 50 Q60 40, 60 50 Q60 60, 50 60 Q40 60, 40 50 Q40 40, 50 40" fill="none" stroke="#DC1FFF" strokeWidth="5"/>
    <path d="M60 50 Q70 40, 70 50 Q70 60, 60 70 Q50 70, 50 60" fill="none" stroke="#00FFFF" strokeWidth="4"/>
    <line x1="20" y1="80" x2="80" y2="20" stroke="#FF00FF" strokeWidth="3"/>
  </IconWrapper>
);

export const IconQuantumReversal = ({ size, className }: IconProps) => (
  <IconWrapper size={size} className={className}>
    <circle cx="50" cy="50" r="40" fill="none" stroke="#00FFAA" strokeWidth="6" strokeDasharray="10,5"/>
    <path d="M50 10 L50 90" stroke="#FF00FF" strokeWidth="5"/>
    <path d="M10 50 L90 50" stroke="#DC1FFF" strokeWidth="5"/>
    <path d="M40 40 L60 60 M60 40 L40 60" stroke="#00FFFF" strokeWidth="4"/>
  </IconWrapper>
);

export const IconNeonGridBot = ({ size, className }: IconProps) => (
  <IconWrapper size={size} className={className}>
    <path d="M20 20 H80 V80 H20 Z" fill="none" stroke="#00FFFF" strokeWidth="5"/>
    <path d="M20 40 H80 M20 60 H80 M40 20 V80 M60 20 V80" stroke="#DC1FFF" strokeWidth="4"/>
    <circle cx="40" cy="40" r="8" fill="#FF00FF"/>
    <circle cx="60" cy="60" r="8" fill="#00FF00"/>
  </IconWrapper>
);

export const IconSniperMode = ({ size, className }: IconProps) => (
  <IconWrapper size={size} className={className}>
    <circle cx="50" cy="50" r="40" fill="none" stroke="#FF0000" strokeWidth="5"/>
    <circle cx="50" cy="50" r="25" fill="none" stroke="#FFFF00" strokeWidth="4"/>
    <circle cx="50" cy="50" r="10" fill="#DC1FFF"/>
    <path d="M20 50 H80 M50 20 V80" stroke="#00FFFF" strokeWidth="3"/>
  </IconWrapper>
);

export const IconMomentumScanner = ({ size, className }: IconProps) => (
  <IconWrapper size={size} className={className}>
    <path d="M10 70 L30 40 L50 60 L70 20 L90 50" fill="none" stroke="#00FFFF" strokeWidth="6"/>
    <path d="M50 60 L50 90" stroke="#FF00FF" strokeWidth="4" strokeDasharray="5,5"/>
    <path d="M70 20 L70 10 L80 10" stroke="#00FF00" strokeWidth="5"/>
  </IconWrapper>
);

export const IconStopLossGuardian = ({ size, className }: IconProps) => (
  <IconWrapper size={size} className={className}>
    <path d="M50 10 L20 40 L30 50 L50 70 L70 50 L80 40 Z" fill="none" stroke="#FF0000" strokeWidth="6"/>
    <circle cx="50" cy="45" r="15" fill="none" stroke="#DC1FFF" strokeWidth="4"/>
    <path d="M40 45 H60 M50 35 V55" stroke="#00FFFF" strokeWidth="5"/>
  </IconWrapper>
);

export const IconTakeProfitZone = ({ size, className }: IconProps) => (
  <IconWrapper size={size} className={className}>
    <path d="M20 80 L50 20 L80 80" fill="none" stroke="#00FF00" strokeWidth="6"/>
    <path d="M30 60 H70 M35 50 H65 M40 40 H60" stroke="#00FFFF" strokeWidth="4"/>
    <circle cx="50" cy="25" r="8" fill="#DC1FFF"/>
  </IconWrapper>
);

export const IconGasOptimizer = ({ size, className }: IconProps) => (
  <IconWrapper size={size} className={className}>
    <path d="M30 80 L30 40 Q30 20, 50 20 Q70 20, 70 40 L70 80" fill="none" stroke="#00FFAA" strokeWidth="6"/>
    <circle cx="50" cy="35" r="10" fill="#DC1FFF"/>
    <path d="M40 60 H60 M40 70 H60" stroke="#00FFFF" strokeWidth="4"/>
  </IconWrapper>
);

export const IconSlippageShield = ({ size, className }: IconProps) => (
  <IconWrapper size={size} className={className}>
    <path d="M50 10 L20 50 L50 90 Z" fill="none" stroke="#00FFFF" strokeWidth="6"/>
    <path d="M50 30 L50 70" stroke="#DC1FFF" strokeWidth="5"/>
    <path d="M35 50 L65 50" stroke="#FF00FF" strokeWidth="5"/>
    <circle cx="50" cy="50" r="12" fill="none" stroke="#FFFF00" strokeWidth="3"/>
  </IconWrapper>
);

export const IconMarketSentiment = ({ size, className }: IconProps) => (
  <IconWrapper size={size} className={className}>
    <circle cx="50" cy="40" r="30" fill="none" stroke="#00FFFF" strokeWidth="5"/>
    <circle cx="35" cy="35" r="6" fill="#DC1FFF"/>
    <circle cx="65" cy="35" r="6" fill="#DC1FFF"/>
    <path d="M30 55 Q50 70, 70 55" fill="none" stroke="#00FF00" strokeWidth="6"/>
  </IconWrapper>
);

export const IconNewsTrader = ({ size, className }: IconProps) => (
  <IconWrapper size={size} className={className}>
    <rect x="20" y="20" width="60" height="60" rx="5" fill="none" stroke="#00FFFF" strokeWidth="5"/>
    <path d="M30 35 H70 M30 50 H70 M30 65 H55" stroke="#DC1FFF" strokeWidth="4"/>
    <path d="M60 60 L80 80 L70 85" stroke="#FF00FF" strokeWidth="5"/>
  </IconWrapper>
);

export const IconTwitterMonitor = ({ size, className }: IconProps) => (
  <IconWrapper size={size} className={className}>
    <path d="M20 60 Q30 40, 50 50 Q70 60, 80 40" fill="none" stroke="#00FFFF" strokeWidth="6"/>
    <circle cx="30" cy="45" r="8" fill="#DC1FFF"/>
    <circle cx="70" cy="45" r="8" fill="#FF00FF"/>
    <path d="M50 50 L50 80 L40 70 M50 80 L60 70" stroke="#00FF00" strokeWidth="4"/>
  </IconWrapper>
);

export const IconContractScanner = ({ size, className }: IconProps) => (
  <IconWrapper size={size} className={className}>
    <rect x="25" y="25" width="50" height="50" rx="8" fill="none" stroke="#00FFAA" strokeWidth="5"/>
    <path d="M35 40 H65 M35 50 H65 M35 60 H60" stroke="#DC1FFF" strokeWidth="3"/>
    <circle cx="70" cy="70" r="15" fill="none" stroke="#00FFFF" strokeWidth="4"/>
    <path d="M75 70 L85 80" stroke="#FF00FF" strokeWidth="4"/>
  </IconWrapper>
);

export const IconRugpullDetector = ({ size, className }: IconProps) => (
  <IconWrapper size={size} className={className}>
    <path d="M50 20 L20 80 L80 80 Z" fill="none" stroke="#FF0000" strokeWidth="6"/>
    <path d="M50 40 L50 60" stroke="#FFFF00" strokeWidth="5"/>
    <circle cx="50" cy="65" r="5" fill="#DC1FFF"/>
    <path d="M35 35 L65 35" stroke="#00FFFF" strokeWidth="4"/>
  </IconWrapper>
);

export const IconLiquidityPoolTracker = ({ size, className }: IconProps) => (
  <IconWrapper size={size} className={className}>
    <circle cx="35" cy="50" r="20" fill="none" stroke="#00FFFF" strokeWidth="5"/>
    <circle cx="65" cy="50" r="20" fill="none" stroke="#FF00FF" strokeWidth="5"/>
    <path d="M45 50 H55" stroke="#DC1FFF" strokeWidth="8"/>
    <circle cx="50" cy="50" r="8" fill="#FFFF00"/>
  </IconWrapper>
);

export const IconYieldFarming = ({ size, className }: IconProps) => (
  <IconWrapper size={size} className={className}>
    <path d="M50 80 L50 40 Q50 20, 30 20 M50 40 Q50 20, 70 20" fill="none" stroke="#00FF00" strokeWidth="6"/>
    <circle cx="30" cy="20" r="8" fill="#DC1FFF"/>
    <circle cx="70" cy="20" r="8" fill="#FF00FF"/>
    <circle cx="50" cy="80" r="10" fill="#00FFFF"/>
  </IconWrapper>
);

export const IconStakingRewards = ({ size, className }: IconProps) => (
  <IconWrapper size={size} className={className}>
    <path d="M50 20 L40 50 L20 55 L40 65 L35 90 L50 75 L65 90 L60 65 L80 55 L60 50 Z" fill="none" stroke="#FFFF00" strokeWidth="5"/>
    <circle cx="50" cy="50" r="12" fill="none" stroke="#DC1FFF" strokeWidth="4"/>
    <path d="M45 50 H55 M50 45 V55" stroke="#00FFFF" strokeWidth="3"/>
  </IconWrapper>
);

export const IconCrossChainBridge = ({ size, className }: IconProps) => (
  <IconWrapper size={size} className={className}>
    <path d="M20 60 Q50 20, 80 60" fill="none" stroke="#00FFFF" strokeWidth="6"/>
    <circle cx="20" cy="60" r="10" fill="none" stroke="#DC1FFF" strokeWidth="4"/>
    <circle cx="80" cy="60" r="10" fill="none" stroke="#FF00FF" strokeWidth="4"/>
    <path d="M20 60 H80" stroke="#00FFAA" strokeWidth="3" strokeDasharray="5,5"/>
  </IconWrapper>
);

export const IconNFTFloorSweeper = ({ size, className }: IconProps) => (
  <IconWrapper size={size} className={className}>
    <rect x="25" y="25" width="50" height="50" rx="5" fill="none" stroke="#FF00FF" strokeWidth="5"/>
    <path d="M35 35 H65 V65 H35 Z" fill="none" stroke="#00FFFF" strokeWidth="3"/>
    <path d="M40 75 Q50 85, 60 75" fill="none" stroke="#DC1FFF" strokeWidth="4"/>
    <circle cx="45" cy="45" r="4" fill="#FFFF00"/>
  </IconWrapper>
);

export const IconTokenLauncher = ({ size, className }: IconProps) => (
  <IconWrapper size={size} className={className}>
    <path d="M50 80 L50 40 L30 50 M50 40 L70 50" fill="none" stroke="#FF00FF" strokeWidth="6"/>
    <circle cx="50" cy="25" r="15" fill="none" stroke="#00FFFF" strokeWidth="5"/>
    <path d="M40 15 L50 5 L60 15" stroke="#DC1FFF" strokeWidth="4"/>
  </IconWrapper>
);

export const IconFrontRunProtector = ({ size, className }: IconProps) => (
  <IconWrapper size={size} className={className}>
    <path d="M50 15 L30 35 L40 50 L30 65 L50 85 L70 65 L60 50 L70 35 Z" fill="none" stroke="#FF0000" strokeWidth="6"/>
    <circle cx="50" cy="50" r="18" fill="none" stroke="#00FFFF" strokeWidth="4"/>
    <path d="M43 50 L50 57 L57 43" fill="none" stroke="#DC1FFF" strokeWidth="4"/>
  </IconWrapper>
);

export const IconMEVBlocker = ({ size, className }: IconProps) => (
  <IconWrapper size={size} className={className}>
    <rect x="25" y="25" width="50" height="50" fill="none" stroke="#FF0000" strokeWidth="6"/>
    <path d="M25 25 L75 75 M75 25 L25 75" stroke="#FFFF00" strokeWidth="5"/>
    <circle cx="50" cy="50" r="20" fill="none" stroke="#00FFFF" strokeWidth="4"/>
  </IconWrapper>
);

export const IconBacktestEngine = ({ size, className }: IconProps) => (
  <IconWrapper size={size} className={className}>
    <path d="M20 70 L35 40 L50 55 L65 30 L80 60" fill="none" stroke="#00FFFF" strokeWidth="5"/>
    <circle cx="35" cy="40" r="6" fill="#DC1FFF"/>
    <circle cx="50" cy="55" r="6" fill="#FF00FF"/>
    <circle cx="65" cy="30" r="6" fill="#00FF00"/>
    <path d="M15 80 H85 M15 80 L15 20" stroke="#00FFAA" strokeWidth="3"/>
  </IconWrapper>
);

export const IconPaperTrading = ({ size, className }: IconProps) => (
  <IconWrapper size={size} className={className}>
    <rect x="25" y="20" width="50" height="60" rx="3" fill="none" stroke="#00FFFF" strokeWidth="5"/>
    <path d="M35 35 H65 M35 50 H65 M35 65 H55" stroke="#DC1FFF" strokeWidth="3"/>
    <path d="M60 60 L75 75 L70 80" stroke="#FF00FF" strokeWidth="4"/>
  </IconWrapper>
);

export const IconRiskCalculator = ({ size, className }: IconProps) => (
  <IconWrapper size={size} className={className}>
    <circle cx="50" cy="50" r="35" fill="none" stroke="#00FFFF" strokeWidth="5"/>
    <path d="M50 25 L50 50 L70 60" stroke="#DC1FFF" strokeWidth="5"/>
    <circle cx="50" cy="50" r="5" fill="#FF00FF"/>
    <path d="M85 50 L90 50 M50 15 L50 10 M15 50 L10 50 M50 85 L50 90" stroke="#00FFAA" strokeWidth="3"/>
  </IconWrapper>
);

export const IconPortfolioRebalancer = ({ size, className }: IconProps) => (
  <IconWrapper size={size} className={className}>
    <circle cx="50" cy="50" r="35" fill="none" stroke="#00FFFF" strokeWidth="5"/>
    <path d="M50 15 L50 50 L75 65" stroke="#DC1FFF" strokeWidth="4"/>
    <path d="M50 50 L25 65" stroke="#FF00FF" strokeWidth="4"/>
    <circle cx="50" cy="50" r="8" fill="#FFFF00"/>
  </IconWrapper>
);

export const IconTaxOptimizer = ({ size, className }: IconProps) => (
  <IconWrapper size={size} className={className}>
    <path d="M50 15 L30 40 L40 40 L40 85 L60 85 L60 40 L70 40 Z" fill="none" stroke="#00FF00" strokeWidth="5"/>
    <circle cx="50" cy="50" r="12" fill="none" stroke="#DC1FFF" strokeWidth="4"/>
    <path d="M45 50 H55 M50 45 V55" stroke="#00FFFF" strokeWidth="3"/>
  </IconWrapper>
);

export const IconAlertManager = ({ size, className }: IconProps) => (
  <IconWrapper size={size} className={className}>
    <path d="M50 20 L20 70 L80 70 Z" fill="none" stroke="#FFFF00" strokeWidth="6"/>
    <path d="M50 35 L50 55 M50 60 L50 65" stroke="#FF0000" strokeWidth="5"/>
    <circle cx="50" cy="50" r="25" fill="none" stroke="#00FFFF" strokeWidth="3" strokeDasharray="5,5"/>
  </IconWrapper>
);

export const IconWebhookIntegration = ({ size, className }: IconProps) => (
  <IconWrapper size={size} className={className}>
    <path d="M30 30 Q50 20, 70 30" fill="none" stroke="#00FFFF" strokeWidth="5"/>
    <path d="M30 70 Q50 80, 70 70" fill="none" stroke="#FF00FF" strokeWidth="5"/>
    <path d="M30 30 L30 70 M70 30 L70 70" stroke="#DC1FFF" strokeWidth="5"/>
    <circle cx="50" cy="50" r="10" fill="#00FFAA"/>
  </IconWrapper>
);

export const IconAPIConnector = ({ size, className }: IconProps) => (
  <IconWrapper size={size} className={className}>
    <circle cx="30" cy="50" r="15" fill="none" stroke="#00FFFF" strokeWidth="5"/>
    <circle cx="70" cy="50" r="15" fill="none" stroke="#FF00FF" strokeWidth="5"/>
    <path d="M45 50 H55" stroke="#DC1FFF" strokeWidth="6"/>
    <path d="M20 35 L40 35 M20 65 L40 65 M60 35 L80 35 M60 65 L80 65" stroke="#00FFAA" strokeWidth="3"/>
  </IconWrapper>
);

export const IconDataStreamLive = ({ size, className }: IconProps) => (
  <IconWrapper size={size} className={className}>
    <path d="M10 50 Q25 30, 40 50 Q55 70, 70 50 Q85 30, 100 50" fill="none" stroke="#00FFFF" strokeWidth="5"/>
    <circle cx="25" cy="40" r="5" fill="#DC1FFF"/>
    <circle cx="55" cy="60" r="5" fill="#FF00FF"/>
    <circle cx="85" cy="40" r="5" fill="#00FF00"/>
    <path d="M75 20 L85 10 L95 20" stroke="#FFFF00" strokeWidth="4"/>
  </IconWrapper>
);
