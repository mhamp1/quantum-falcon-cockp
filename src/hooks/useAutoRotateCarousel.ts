import { useEffect, useCallback, useRef } from 'react'
import type { CarouselApi } from '@/components/ui/carousel'

interface UseAutoRotateCarouselOptions {
  api: CarouselApi | undefined
  delay?: number
  stopOnInteraction?: boolean
}

/**
 * Hook to add smooth auto-rotation to carousels
 * @param api - Carousel API from embla
 * @param delay - Delay in milliseconds between rotations (default: 5000)
 * @param stopOnInteraction - Whether to stop auto-rotation on user interaction (default: true)
 */
export function useAutoRotateCarousel({
  api,
  delay = 5000,
  stopOnInteraction = true,
}: UseAutoRotateCarouselOptions) {
  const timeoutRef = useRef<NodeJS.Timeout>()
  const isInteractingRef = useRef(false)

  const scrollNext = useCallback(() => {
    if (!api || (stopOnInteraction && isInteractingRef.current)) return

    // Smooth scroll to next slide
    if (api.canScrollNext()) {
      api.scrollNext()
    } else {
      // Loop back to start smoothly
      api.scrollTo(0)
    }
  }, [api, stopOnInteraction])

  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(scrollNext, delay)
  }, [scrollNext, delay])

  useEffect(() => {
    if (!api) return

    const handleInteraction = () => {
      if (stopOnInteraction) {
        isInteractingRef.current = true
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
      }
    }

    const handleSettle = () => {
      if (stopOnInteraction) {
        // Resume after 2 seconds of no interaction
        setTimeout(() => {
          isInteractingRef.current = false
          resetTimeout()
        }, 2000)
      } else {
        resetTimeout()
      }
    }

    // Start auto-rotation
    resetTimeout()

    // Listen for user interactions
    api.on('pointerDown', handleInteraction)
    api.on('settle', handleSettle)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      api.off('pointerDown', handleInteraction)
      api.off('settle', handleSettle)
    }
  }, [api, resetTimeout, stopOnInteraction])

  // Return function to manually trigger rotation
  return {
    triggerRotation: scrollNext,
    resetTimer: resetTimeout,
  }
}
