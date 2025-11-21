// MOBILE NAV 10X: Smooth scrolling tabs + floating Strategy FAB + upgrade banner fixed — November 20, 2025
// 
// Premium mobile bottom navigation - smoother than Bybit Pro, TradingView Mobile 2025
// Features:
// - Horizontal scrollable tabs with snap-to-center
// - Glassmorphism styling with cyan glow border
// - Floating Action Button (FAB) for Strategy Builder
// - 80px height for larger touch targets (28px icons)
// - Safe area inset handling
// - Smooth inertia scrolling with Framer Motion

import { useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Code, Crown } from '@phosphor-icons/react';
import HolographicBotIcon from '@/components/shared/HolographicBotIcon';
import { soundEffects } from '@/lib/soundEffects';

interface Tab {
  id: string;
  label: string;
  icon: any;
  component: React.LazyExoticComponent<React.ComponentType<any>>;
}

interface MobileBottomNavProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function MobileBottomNav({ tabs, activeTab, onTabChange }: MobileBottomNavProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  
  // Filter out strategy-builder from tabs (will be FAB)
  const navTabs = tabs.filter(tab => tab.id !== 'strategy-builder');
  
  useEffect(() => {
    // Scroll active tab to center when it changes
    if (scrollContainerRef.current) {
      const activeIndex = navTabs.findIndex(tab => tab.id === activeTab);
      if (activeIndex !== -1) {
        const container = scrollContainerRef.current;
        const tabElement = container.children[activeIndex] as HTMLElement;
        if (tabElement) {
          const containerWidth = container.offsetWidth;
          const scrollPosition = tabElement.offsetLeft - (containerWidth / 2) + (tabElement.offsetWidth / 2);
          
          // Smooth scroll with animation
          animate(container.scrollLeft, scrollPosition, {
            type: "spring",
            stiffness: 300,
            damping: 30,
            onUpdate: (latest) => {
              container.scrollLeft = latest;
            }
          });
        }
      }
    }
  }, [activeTab, navTabs]);

  const handleStrategyClick = () => {
    soundEffects.playTabSwitch();
    onTabChange('strategy-builder');
  };

  return (
    <>
      {/* Floating Action Button (FAB) for Strategy Builder */}
      <motion.button
        onClick={handleStrategyClick}
        className="fixed bottom-[96px] left-1/2 -translate-x-1/2 z-[60] w-16 h-16 rounded-full flex items-center justify-center shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
          boxShadow: '0 8px 32px rgba(236, 72, 153, 0.4), 0 0 0 4px rgba(139, 92, 246, 0.2)',
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          boxShadow: [
            '0 8px 32px rgba(236, 72, 153, 0.4), 0 0 0 4px rgba(139, 92, 246, 0.2)',
            '0 8px 40px rgba(236, 72, 153, 0.6), 0 0 0 6px rgba(139, 92, 246, 0.3)',
            '0 8px 32px rgba(236, 72, 153, 0.4), 0 0 0 4px rgba(139, 92, 246, 0.2)',
          ]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="relative">
          <Code size={28} weight="fill" className="text-white" />
          <Crown 
            size={14} 
            weight="fill" 
            className="absolute -top-2 -right-2 text-yellow-300"
            style={{ filter: 'drop-shadow(0 0 4px rgba(253, 224, 71, 0.6))' }}
          />
        </div>
      </motion.button>

      {/* Bottom Navigation Bar */}
      <nav 
        className="fixed bottom-0 left-0 right-0 z-50"
        style={{
          height: '80px',
          paddingBottom: 'env(safe-area-inset-bottom)',
          background: 'rgba(var(--card-rgb, 0 0 0) / 0.95)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderTop: '2px solid rgba(6, 182, 212, 0.4)',
          boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.5), 0 -1px 4px rgba(6, 182, 212, 0.2)',
        }}
      >
        <motion.div
          ref={scrollContainerRef}
          className="flex items-center h-full overflow-x-auto scrollbar-hide px-2 gap-2"
          style={{
            scrollBehavior: 'smooth',
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
          }}
          drag="x"
          dragConstraints={{ left: -1000, right: 0 }}
          dragElastic={0.1}
          dragMomentum={true}
        >
          {navTabs.map((tab, index) => {
            const isActive = activeTab === tab.id;
            const IconComponent = tab.icon;
            
            return (
              <motion.button
                key={tab.id}
                onClick={() => {
                  soundEffects.playTabSwitch();
                  onTabChange(tab.id);
                }}
                onMouseEnter={() => soundEffects.playHover()}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1.5 px-4 py-2 rounded-xl transition-all flex-shrink-0",
                  "min-w-[72px] h-[64px]",
                  isActive ? "opacity-100" : "opacity-80"
                )}
                style={{
                  scrollSnapAlign: 'center',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                data-active={isActive}
              >
                {/* Active indicator - cyan underline with glow */}
                {isActive && (
                  <motion.div
                    layoutId="mobileActiveIndicator"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-1 rounded-t-full"
                    style={{
                      backgroundColor: 'rgb(6, 182, 212)',
                      boxShadow: '0 0 12px rgba(6, 182, 212, 0.8), 0 -2px 16px rgba(6, 182, 212, 0.6)',
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                {/* Icon with pulse glow on active */}
                <motion.div
                  className="relative"
                  animate={isActive ? {
                    scale: [1, 1.08, 1],
                    filter: [
                      'drop-shadow(0 0 4px rgba(6, 182, 212, 0.4))',
                      'drop-shadow(0 0 8px rgba(6, 182, 212, 0.6))',
                      'drop-shadow(0 0 4px rgba(6, 182, 212, 0.4))',
                    ]
                  } : {}}
                  transition={{
                    duration: 2,
                    repeat: isActive ? Infinity : 0,
                    ease: "easeInOut"
                  }}
                >
                  {tab.id === 'multi-agent' ? (
                    <HolographicBotIcon isActive={isActive} size={28} />
                  ) : (
                    <IconComponent 
                      size={28}
                      weight={isActive ? "fill" : "regular"}
                      className={isActive ? "text-cyan-400" : "text-muted-foreground"}
                    />
                  )}
                </motion.div>

                {/* Label - always visible */}
                <span 
                  className={cn(
                    "text-[10px] font-semibold uppercase tracking-wide",
                    isActive ? "text-cyan-400" : "text-muted-foreground"
                  )}
                  style={{
                    textShadow: isActive ? '0 0 8px rgba(6, 182, 212, 0.4)' : 'none',
                  }}
                >
                  {tab.label.split(' ')[0]}
                </span>
              </motion.button>
            );
          })}
        </motion.div>
      </nav>
    </>
  );
}
