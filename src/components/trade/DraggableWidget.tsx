// Draggable Widget — ULTIMATE v2025.1.0
// November 26, 2025 — Quantum Falcon Cockpit
// God Mode support, reorderable, mobile + desktop ready

import { useDrag, useDrop } from 'react-dnd'
import { motion } from 'framer-motion'
import { ReactNode, useRef, useEffect, useState } from 'react'
import { DotsSixVertical, Crown, Sparkle } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface DraggableWidgetProps {
  children: ReactNode
  id: string
  index?: number
  type?: string
  className?: string
  onMove?: (dragIndex: number, hoverIndex: number) => void
  isGodMode?: boolean
}

const ITEM_TYPE = 'widget'

export const DraggableWidget = ({ 
  children, 
  id, 
  index = 0,
  type = ITEM_TYPE, 
  className = '',
  onMove,
  isGodMode = false
}: DraggableWidgetProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const dragHandleRef = useRef<HTMLDivElement>(null)
  const [isHovering, setIsHovering] = useState(false)
  
  // Drop zone for reordering
  const [{ handlerId, isOver }, drop] = useDrop({
    accept: type,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
        isOver: monitor.isOver()
      }
    },
    hover(item: { id: string; index: number }, monitor) {
      if (!ref.current || !onMove) return
      
      const dragIndex = item.index
      const hoverIndex = index
      
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) return
      
      // Get rectangle on screen
      const hoverBoundingRect = ref.current.getBoundingClientRect()
      
      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
      
      // Get mouse position
      const clientOffset = monitor.getClientOffset()
      if (!clientOffset) return
      
      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top
      
      // Only perform the move when the mouse has crossed half of the item's height
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return
      
      // Perform the move
      onMove(dragIndex, hoverIndex)
      
      // Update the index for the dragged item
      item.index = hoverIndex
    },
  })

  // Drag source
  const [{ isDragging }, drag, dragPreview] = useDrag({
    type,
    item: () => ({ id, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    }),
  })

  // Connect refs
  useEffect(() => {
    drag(dragHandleRef)
    drop(ref)
  }, [drag, drop])

  return (
    <motion.div
      ref={(node) => {
        dragPreview(node)
        if (ref.current !== node) {
          (ref as any).current = node
        }
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: isDragging ? 0.5 : 1, 
        y: 0,
        scale: isDragging ? 1.05 : 1
      }}
      whileHover={{ 
        scale: isGodMode ? 1.03 : 1.01,
      }}
      transition={{ duration: 0.2 }}
      onHoverStart={() => setIsHovering(true)}
      onHoverEnd={() => setIsHovering(false)}
      className={cn(
        "relative group transition-all duration-200",
        isDragging && "z-50 shadow-2xl",
        isOver && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        isGodMode && "ring-1 ring-yellow-500/30",
        className
      )}
      style={{ 
        touchAction: 'none',
        boxShadow: isDragging 
          ? isGodMode 
            ? '0 20px 50px rgba(251, 191, 36, 0.4)' 
            : '0 20px 40px rgba(0, 255, 255, 0.3)'
          : isHovering
            ? isGodMode
              ? '0 10px 30px rgba(251, 191, 36, 0.2)'
              : '0 10px 30px rgba(20, 241, 149, 0.2)'
            : undefined
      }}
      data-handler-id={handlerId}
      role="button"
      tabIndex={0}
      aria-label={`Draggable widget ${id}`}
    >
      {/* God Mode Crown */}
      {isGodMode && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-3 -right-3 z-20"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <Crown 
              size={28} 
              weight="fill" 
              className="text-yellow-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]" 
            />
          </motion.div>
        </motion.div>
      )}

      {/* Drag Handle - Shows on hover */}
      <motion.div
        ref={dragHandleRef}
        initial={{ opacity: 0, x: -10 }}
        animate={{ 
          opacity: isHovering || isDragging ? 1 : 0, 
          x: isHovering || isDragging ? 0 : -10 
        }}
        className={cn(
          "absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center z-10",
          "cursor-grab active:cursor-grabbing",
          "bg-gradient-to-r from-black/60 to-transparent",
          "rounded-l-lg"
        )}
      >
        <DotsSixVertical 
          size={24} 
          weight="bold"
          className={cn(
            "transition-colors",
            isGodMode ? "text-yellow-400" : "text-cyan-400"
          )} 
        />
      </motion.div>

      {/* God Mode Sparkle Effect */}
      {isGodMode && isHovering && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center"
        >
          <Sparkle 
            size={32} 
            weight="fill"
            className="text-yellow-400/40" 
          />
        </motion.div>
      )}

      {/* Drop indicator line */}
      {isOver && !isDragging && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          className={cn(
            "absolute -top-1 left-0 right-0 h-1 rounded-full",
            isGodMode ? "bg-yellow-400" : "bg-primary"
          )}
          style={{
            boxShadow: isGodMode 
              ? '0 0 10px rgba(251, 191, 36, 0.8)' 
              : '0 0 10px rgba(20, 241, 149, 0.8)'
          }}
        />
      )}

      {/* Widget Content */}
      <div className="relative z-0">
        {children}
      </div>
    </motion.div>
  )
}

export default DraggableWidget
