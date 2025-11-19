// Custom Aggression Slider with Holographic Gradient
// Green → Yellow → Red track with glowing thumb

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface AggressionSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

export default function AggressionSlider({
  value,
  onChange,
  min = 0,
  max = 100,
  className = '',
}: AggressionSliderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const getColor = (val: number) => {
    if (val < 33) return { main: '#14F195', shadow: '0 0 20px rgba(20, 241, 149, 0.8)' };
    if (val < 67) return { main: '#FCD34D', shadow: '0 0 20px rgba(252, 211, 77, 0.8)' };
    return { main: '#FF3B3B', shadow: '0 0 20px rgba(255, 59, 59, 0.8)' };
  };

  const getLabel = (val: number) => {
    if (val < 33) return 'Conservative';
    if (val < 67) return 'Moderate';
    return 'Aggressive';
  };

  const color = getColor(value);
  const label = getLabel(value);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Slider Track */}
      <div className="relative h-16 rounded-full overflow-hidden">
        {/* Holographic gradient background */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to right, #14F195 0%, #FCD34D 50%, #FF3B3B 100%)',
            opacity: 0.3,
          }}
        />
        
        {/* Active fill */}
        <motion.div
          className="absolute inset-y-0 left-0"
          style={{
            width: `${value}%`,
            background: 'linear-gradient(to right, #14F195 0%, #FCD34D 50%, #FF3B3B 100%)',
            boxShadow: `inset 0 2px 8px rgba(0, 0, 0, 0.3), 0 0 20px ${color.main}80`,
          }}
          animate={{
            opacity: isDragging ? 1 : 0.8,
          }}
        />

        {/* Grid lines */}
        <div className="absolute inset-0 flex">
          {Array.from({ length: 11 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 border-r border-white/10 last:border-r-0"
            />
          ))}
        </div>

        {/* Input slider (invisible but functional) */}
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />

        {/* Glowing thumb */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
          style={{
            left: `${value}%`,
            marginLeft: '-20px',
          }}
          animate={{
            scale: isDragging ? 1.2 : 1,
          }}
        >
          <div
            className="w-10 h-10 rounded-full border-4 border-white"
            style={{
              background: color.main,
              boxShadow: color.shadow,
            }}
          />
          {/* Pulse ring when dragging */}
          {isDragging && (
            <motion.div
              className="absolute inset-0 rounded-full border-2"
              style={{ borderColor: color.main }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
              }}
            />
          )}
        </motion.div>
      </div>

      {/* Value Display */}
      <div className="text-center space-y-2">
        <motion.div
          className="text-7xl font-black"
          style={{
            color: color.main,
            textShadow: color.shadow,
            fontFamily: 'Orbitron, sans-serif',
          }}
          animate={{
            scale: isDragging ? 1.1 : 1,
          }}
        >
          {value}
        </motion.div>
        <div className="flex items-center justify-center gap-3">
          <div
            className="w-3 h-3 rounded-full"
            style={{
              backgroundColor: color.main,
              boxShadow: color.shadow,
            }}
          />
          <p className="text-xl font-bold uppercase tracking-wider" style={{ color: color.main }}>
            {label}
          </p>
          <div
            className="w-3 h-3 rounded-full"
            style={{
              backgroundColor: color.main,
              boxShadow: color.shadow,
            }}
          />
        </div>
        {value < 33 && (
          <p className="text-sm text-muted-foreground">
            Low risk • Steady gains • +85% Projected Monthly
          </p>
        )}
        {value >= 33 && value < 67 && (
          <p className="text-sm text-muted-foreground">
            Moderate risk • Balanced approach • +284% Projected Monthly
          </p>
        )}
        {value >= 67 && (
          <p className="text-sm text-muted-foreground">
            High risk • Maximum returns • +521% Projected Monthly
          </p>
        )}
      </div>
    </div>
  );
}
