// GOD-TIER HUD: Circular profit radar with sweeping beam — inspired by The Old Axolotl Allegro

import { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendUp, TrendDown } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface CircularProfitHUDProps {
  data: Array<{ date: string; profit: number }>;
  className?: string;
}

export function CircularProfitHUD({ data, className }: CircularProfitHUDProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{ profit: number; date: string; angle: number } | null>(null);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const currentProfit = data[data.length - 1]?.profit || 0;
  const previousProfit = data[data.length - 2]?.profit || 0;
  const percentageChange = previousProfit !== 0 
    ? ((currentProfit - previousProfit) / Math.abs(previousProfit)) * 100 
    : 0;
  const isPositive = percentageChange >= 0;

  const particles = useRef<Array<{ x: number; y: number; opacity: number; size: number; speed: number }>>([]);
  
  useEffect(() => {
    for (let i = 0; i < 30; i++) {
      particles.current.push({
        x: Math.random() * 800,
        y: Math.random() * 800,
        opacity: Math.random() * 0.02,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.2 + 0.1
      });
    }
  }, []);

  const normalizedData = useMemo(() => {
    if (data.length === 0) return [];
    const maxProfit = Math.max(...data.map(d => Math.abs(d.profit)));
    return data.map((d, i) => ({
      ...d,
      normalizedProfit: maxProfit !== 0 ? (d.profit / maxProfit) : 0,
      angle: (i / (data.length - 1)) * Math.PI * 2
    }));
  }, [data]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    ctx.scale(dpr, dpr);
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const maxRadius = Math.min(centerX, centerY) - 60;

    let animationFrame: number;
    let beamProgress = isLoading ? 0 : 1;
    let pulsePhase = 0;
    let starfieldRotation = 0;

    const drawStarfield = () => {
      particles.current.forEach(particle => {
        ctx.fillStyle = `rgba(0, 255, 255, ${particle.opacity})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        
        particle.x -= particle.speed;
        particle.y += particle.speed * 0.3;
        
        if (particle.x < 0) particle.x = rect.width;
        if (particle.y > rect.height) particle.y = 0;
      });
    };

    const drawConcentricRings = () => {
      const ringCount = 6;
      pulsePhase += 0.02;
      
      for (let i = 1; i <= ringCount; i++) {
        const radius = (maxRadius / ringCount) * i;
        const pulseOpacity = 0.15 + Math.sin(pulsePhase + i * 0.3) * 0.05;
        
        ctx.strokeStyle = `rgba(0, 255, 255, ${pulseOpacity})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();

        if (i % 2 === 0) {
          ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
          ctx.font = '9px Orbitron, monospace';
          ctx.textAlign = 'center';
          const value = Math.round((i / ringCount) * Math.abs(currentProfit));
          ctx.fillText(`$${value}`, centerX, centerY - radius - 8);
        }
      }
    };

    const drawRadialTimeMarkers = () => {
      const markerCount = 12;
      for (let i = 0; i < markerCount; i++) {
        const angle = (i / markerCount) * Math.PI * 2 - Math.PI / 2;
        const innerRadius = maxRadius - 15;
        const outerRadius = maxRadius - 5;
        
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(
          centerX + Math.cos(angle) * innerRadius,
          centerY + Math.sin(angle) * innerRadius
        );
        ctx.lineTo(
          centerX + Math.cos(angle) * outerRadius,
          centerY + Math.sin(angle) * outerRadius
        );
        ctx.stroke();
      }
    };

    const drawCenterCore = () => {
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 40);
      gradient.addColorStop(0, 'rgba(153, 69, 255, 0.4)');
      gradient.addColorStop(0.5, 'rgba(0, 255, 255, 0.2)');
      gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 40, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
      ctx.font = 'bold 24px Orbitron, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Q', centerX, centerY);
    };

    const drawProfitBeam = () => {
      if (normalizedData.length === 0) return;

      const currentBeamEnd = Math.min(beamProgress, 1);
      const endIndex = Math.floor(currentBeamEnd * (normalizedData.length - 1));

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation);

      ctx.globalCompositeOperation = 'lighter';

      for (let i = 0; i <= endIndex; i++) {
        const point = normalizedData[i];
        const nextPoint = normalizedData[i + 1];
        
        if (!nextPoint) continue;

        const radius1 = Math.abs(point.normalizedProfit) * maxRadius * 0.85;
        const radius2 = Math.abs(nextPoint.normalizedProfit) * maxRadius * 0.85;

        const x1 = Math.cos(point.angle - Math.PI / 2) * radius1;
        const y1 = Math.sin(point.angle - Math.PI / 2) * radius1;
        const x2 = Math.cos(nextPoint.angle - Math.PI / 2) * radius2;
        const y2 = Math.sin(nextPoint.angle - Math.PI / 2) * radius2;

        const progress = Math.min(i / Math.max(endIndex, 1), 1);
        const isRecent = i > endIndex - 10;
        
        const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        
        if (point.profit < 0) {
          gradient.addColorStop(0, `rgba(255, 68, 68, ${Math.max(0.6 * progress, 0.1)})`);
          gradient.addColorStop(1, `rgba(255, 68, 68, ${Math.max(0.8 * progress, 0.2)})`);
        } else {
          gradient.addColorStop(0, `rgba(0, 255, 255, ${Math.max(0.6 * progress, 0.1)})`);
          gradient.addColorStop(1, `rgba(153, 69, 255, ${Math.max(0.8 * progress, 0.2)})`);
        }

        ctx.strokeStyle = gradient;
        ctx.lineWidth = isRecent ? 3 : 2;
        ctx.shadowBlur = isRecent ? 20 : 10;
        ctx.shadowColor = point.profit >= 0 ? '#00ffff' : '#ff4444';
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        if (isRecent && i % 2 === 0) {
          const particleX = x2;
          const particleY = y2;
          
          ctx.fillStyle = point.profit >= 0 ? 'rgba(0, 255, 255, 0.6)' : 'rgba(255, 68, 68, 0.6)';
          ctx.shadowBlur = 15;
          ctx.beginPath();
          ctx.arc(particleX, particleY, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (endIndex > 0 && endIndex < normalizedData.length) {
        const lastPoint = normalizedData[endIndex];
        const radius = Math.abs(lastPoint.normalizedProfit) * maxRadius * 0.85;
        const x = Math.cos(lastPoint.angle - Math.PI / 2) * radius;
        const y = Math.sin(lastPoint.angle - Math.PI / 2) * radius;

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 30);
        gradient.addColorStop(0, 'rgba(255, 0, 255, 0.8)');
        gradient.addColorStop(0.5, 'rgba(153, 69, 255, 0.4)');
        gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, 30, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, rect.width, rect.height);

      starfieldRotation += 0.0001;
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(starfieldRotation);
      ctx.translate(-centerX, -centerY);
      drawStarfield();
      ctx.restore();

      drawConcentricRings();
      drawRadialTimeMarkers();
      drawProfitBeam();
      drawCenterCore();

      if (isLoading && beamProgress < 1) {
        beamProgress += 0.01;
        if (beamProgress >= 1) {
          setIsLoading(false);
        }
      }

      animationFrame = requestAnimationFrame(animate);
    };

    setTimeout(() => animate(), 100);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [normalizedData, rotation, isLoading, currentProfit]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging || normalizedData.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const dx = mouseX - centerX;
    const dy = mouseY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    let angle = Math.atan2(dy, dx) + Math.PI / 2;
    if (angle < 0) angle += Math.PI * 2;

    const maxRadius = Math.min(centerX, centerY) - 60;
    if (distance < maxRadius * 0.2 || distance > maxRadius) {
      setHoveredPoint(null);
      return;
    }

    const closestPoint = normalizedData.reduce((closest, point) => {
      const pointAngle = (point.angle - rotation + Math.PI * 2) % (Math.PI * 2);
      const angleDiff = Math.abs(angle - pointAngle);
      const minAngleDiff = Math.min(angleDiff, Math.PI * 2 - angleDiff);
      
      if (!closest || minAngleDiff < closest.diff) {
        return { point, diff: minAngleDiff };
      }
      return closest;
    }, null as { point: typeof normalizedData[0]; diff: number } | null);

    if (closestPoint && closestPoint.diff < 0.2) {
      setHoveredPoint({
        profit: closestPoint.point.profit,
        date: closestPoint.point.date,
        angle: closestPoint.point.angle
      });
    } else {
      setHoveredPoint(null);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDrag = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const dx = mouseX - centerX;
    const dy = mouseY - centerY;
    const angle = Math.atan2(dy, dx);
    
    setRotation(angle);
  };

  return (
    <div className={cn('relative', className)}>
      <div className="flex items-center justify-center gap-3 mb-6">
        <motion.h3 
          className="text-xl font-bold uppercase tracking-wider neon-leak"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Cumulative Profit
        </motion.h3>
        {isPositive ? (
          <TrendUp size={24} weight="bold" className="text-primary" style={{ filter: 'drop-shadow(0 0 6px rgba(0,255,255,0.4))' }} />
        ) : (
          <TrendDown size={24} weight="bold" className="text-destructive" style={{ filter: 'drop-shadow(0 0 6px rgba(255,68,68,0.4))' }} />
        )}
      </div>

      <div className="relative w-full aspect-square max-w-[600px] mx-auto">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          onMouseMove={(e) => {
            handleMouseMove(e);
            handleDrag(e);
          }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            setHoveredPoint(null);
            setIsDragging(false);
          }}
        />

        <motion.div 
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
        >
          <div className="text-center">
            <div 
              className="text-5xl md:text-6xl font-black tabular-nums neon-leak"
              style={{
                filter: `drop-shadow(0 0 8px ${isPositive ? 'rgba(0,255,255,0.4)' : 'rgba(255,68,68,0.4)'})`
              }}
            >
              ${Math.abs(currentProfit).toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </div>
            <motion.div 
              className={cn(
                "text-xl font-bold mt-2",
                isPositive ? "text-primary" : "text-destructive"
              )}
              animate={{ 
                opacity: [1, 0.7, 1],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {isPositive ? '+' : ''}{percentageChange.toFixed(2)}%
            </motion.div>
          </div>
        </motion.div>

        <AnimatePresence>
          {hoveredPoint && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute top-4 right-4 glass-morph-card p-4 min-w-[200px]"
              style={{
                border: '1px solid rgba(0, 255, 255, 0.3)',
                boxShadow: '0 0 20px rgba(0, 255, 255, 0.2)'
              }}
            >
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                {hoveredPoint.date}
              </div>
              <div className={cn(
                "text-2xl font-bold tabular-nums",
                hoveredPoint.profit >= 0 ? "text-primary" : "text-destructive"
              )}>
                ${Math.abs(hoveredPoint.profit).toLocaleString('en-US', { maximumFractionDigits: 2 })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-muted-foreground uppercase tracking-wide text-center">
          <span className="opacity-50">Drag to rotate • Hover for details</span>
        </div>
      </div>
    </div>
  );
}
