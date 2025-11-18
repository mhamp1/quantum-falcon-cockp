// components/shared/FeatureCardWithTooltip.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  tooltip: {
    title: string;
    description: string;
    preview?: string; // e.g., code snippet or mini chart
  };
  delay?: number;
}

export const FeatureCardWithTooltip: React.FC<FeatureCardProps> = ({ icon, title, subtitle, tooltip, delay = 0 }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(prev => !prev)} // Mobile support
    >
      {/* Main Card */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay, duration: 0.8, ease: "easeOut" }}
        whileHover={{ scale: 1.05, y: -10 }}
        className="group relative bg-black/70 backdrop-blur-xl border border-cyan-500/50 rounded-2xl p-6 shadow-2xl hover:border-cyan-400 hover:shadow-cyan-500/30 transition-all duration-300 cursor-pointer"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-cyan-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative z-10 flex items-start gap-5">
          <div className="p-4 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-xl shadow-lg">
            {icon}
          </div>
          <div>
            <h3 className="text-xl font-bold text-cyan-300 mb-2">{title}</h3>
            <p className="text-gray-300 text-sm leading-relaxed">{subtitle}</p>
          </div>
        </div>
      </motion.div>

      {/* Tooltip Popup */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute z-50 left-1/2 -translate-x-1/2 top-full mt-4 w-96"
          >
            <div className="relative">
              {/* Arrow */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-purple-500/80" />
              
              {/* Tooltip Body */}
              <div className="bg-black/95 backdrop-blur-2xl border-2 border-purple-500/80 rounded-2xl p-6 shadow-2xl shadow-purple-500/50">
                <h4 className="text-2xl font-bold text-cyan-400 mb-3 flex items-center gap-3">
                  <Sparkles className="text-yellow-400" />
                  {tooltip.title}
                </h4>
                <p className="text-cyan-100/90 leading-relaxed mb-4">
                  {tooltip.description}
                </p>
                
                {/* Optional Preview */}
                {tooltip.preview && (
                  <div className="mt-4 p-4 bg-purple-900/30 rounded-xl border border-purple-500/50">
                    <pre className="text-xs text-cyan-300 font-mono overflow-x-auto whitespace-pre-wrap">
                      {tooltip.preview}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FeatureCardWithTooltip;
