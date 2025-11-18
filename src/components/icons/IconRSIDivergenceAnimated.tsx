// components/icons/IconRSIDivergenceAnimated.tsx
import React from 'react';

export const IconRSIDivergenceAnimated = ({ size = 120, className = "" }: { size?: number; className?: string }) => (
  <div className={`relative ${className}`} style={{ width: size, height: size }}>
    {/* Outer Circular Arrow – Spins Slowly */}
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className="absolute inset-0 animate-spin-slow"
      style={{ animationDuration: '20s' }} // Smooth 20-second full rotation
    >
      <defs>
        <linearGradient id="rsi-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00FFFF" />
          <stop offset="50%" stopColor="#FF00FF" />
          <stop offset="100%" stopColor="#DC1FFF" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Circular Arrow Path */}
      <path
        d="M60 10 A50 50 0 1 1 59.9 10.1 L75 30 L60 10 Z"
        fill="none"
        stroke="url(#rsi-gradient)"
        strokeWidth="8"
        filter="url(#glow)"
        opacity="0.9"
      />
    </svg>

    {/* Inner Static Icon (Stays Still) */}
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="bg-black/60 backdrop-blur-sm rounded-full p-6 border-2 border-cyan-500/50 shadow-2xl">
        <svg width="60" height="60" viewBox="0 0 100 100">
          <path d="M10 70 Q30 30, 50 70 Q70 110, 90 70" fill="none" stroke="#00FFFF" strokeWidth="6"/>
          <path d="M10 60 Q30 90, 50 50 Q70 10, 90 60" fill="none" stroke="#FF00FF" strokeWidth="5" strokeDasharray="8,8"/>
          <path d="M35 40 L50 20 L65 40" fill="none" stroke="#FF1493" strokeWidth="5"/>
          <path d="M35 60 L50 80 L65 60" fill="none" stroke="#00FF00" strokeWidth="5"/>
        </svg>
      </div>
    </div>

    {/* Optional "FEATURED" Badge */}
    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg border border-purple-400">
      FEATURED
    </div>
  </div>
);
