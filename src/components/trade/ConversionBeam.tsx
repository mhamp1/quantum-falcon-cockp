import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface ConversionBeamProps {
  isActive: boolean;
}

export default function ConversionBeam({ isActive }: ConversionBeamProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!isActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;

    let progress = 0;
    const duration = 2000;
    const startTime = Date.now();

    const animate = () => {
      if (!ctx) return;

      ctx.clearRect(0, 0, width, height);

      const elapsed = Date.now() - startTime;
      progress = Math.min(elapsed / duration, 1);

      const centerX = width / 2;
      const startY = height * 0.3;
      const endY = height * 0.7;

      const gradient = ctx.createLinearGradient(centerX, startY, centerX, endY);
      gradient.addColorStop(0, "rgba(20, 241, 149, 0)");
      gradient.addColorStop(0.5, `rgba(247, 147, 26, ${0.8 * (1 - progress)})`);
      gradient.addColorStop(1, "rgba(247, 147, 26, 0)");

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 20 + Math.sin(elapsed / 100) * 5;
      ctx.lineCap = "round";

      ctx.beginPath();
      ctx.moveTo(centerX, startY);
      ctx.lineTo(centerX, startY + (endY - startY) * progress);
      ctx.stroke();

      for (let i = 0; i < 5; i++) {
        const offset = (elapsed / 50 + i * 100) % height;
        const sparkSize = 3 + Math.random() * 4;
        const sparkX = centerX + (Math.random() - 0.5) * 30;

        ctx.fillStyle = `rgba(247, 147, 26, ${Math.random() * 0.8})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#F7931A";
        ctx.beginPath();
        ctx.arc(sparkX, offset, sparkSize, 0, Math.PI * 2);
        ctx.fill();
      }

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 pointer-events-none"
    >
      <canvas ref={canvasRef} className="w-full h-full" />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: [0, 1, 1, 0] }}
        transition={{ duration: 2, times: [0, 0.2, 0.8, 1] }}
        className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <div className="text-2xl font-bold text-accent drop-shadow-[0_0_20px_currentColor]">
          SOL
        </div>
      </motion.div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: [0, 0, 1, 1] }}
        transition={{ duration: 2, times: [0, 0.5, 0.7, 1] }}
        className="absolute top-[70%] left-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <div className="text-2xl font-bold text-[#F7931A] drop-shadow-[0_0_20px_currentColor]">
          BTC
        </div>
      </motion.div>
    </motion.div>
  );
}
