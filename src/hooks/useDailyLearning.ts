// Daily Learning Hook — Runs Learning Cycles Automatically
// November 21, 2025 — Quantum Falcon Cockpit

import { useEffect } from 'react'
import { getLearningSystem } from '@/lib/ai/learning/AdaptiveLearningSystem'

/**
 * Hook that runs daily learning cycles automatically
 * Ensures the bot learns and improves every day
 */
export function useDailyLearning() {
  useEffect(() => {
    // Safe check for window/localStorage availability
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }
    
    const learningSystem = getLearningSystem()
    
    // Check if we need to run daily learning cycle
    const checkAndRunLearning = () => {
      try {
        const lastRun = localStorage.getItem('quantum-falcon-last-learning-run')
        const now = Date.now()
        const oneDay = 24 * 60 * 60 * 1000
        
        if (!lastRun || (now - parseInt(lastRun)) > oneDay) {
          console.log('🧠 Running daily learning cycle...')
          learningSystem.runDailyLearningCycle()
          localStorage.setItem('quantum-falcon-last-learning-run', now.toString())
        }
      } catch (error) {
        console.debug('[useDailyLearning] Failed to access localStorage:', error);
      }
    }
    
    // Run immediately if needed
    checkAndRunLearning()
    
    // Check every hour
    const interval = setInterval(checkAndRunLearning, 60 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])
  
  return {
    getMetrics: () => getLearningSystem().getMetrics(),
    getConfig: () => getLearningSystem().getConfig(),
  }
}

