// Draggable widget component using react-dnd
import { useDrag } from 'react-dnd'
import { motion } from 'framer-motion'
import { ReactNode, useRef, useEffect } from 'react'

interface DraggableWidgetProps {
  children: ReactNode
  id: string
  type?: string
  className?: string
}

export const DraggableWidget = ({ children, id, type = 'widget', className = '' }: DraggableWidgetProps) => {
  const ref = useRef<HTMLDivElement>(null)
  
  const [{ isDragging }, drag] = useDrag(() => ({
    type,
    item: { id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }), [id, type])

  useEffect(() => {
    if (ref.current) {
      drag(ref)
    }
  }, [drag])

  return (
    <motion.div
      ref={ref}
      whileHover={{ scale: 1.02, boxShadow: '0 10px 30px rgba(20, 241, 149, 0.3)' }}
      transition={{ duration: 0.2 }}
      className={`cursor-move ${isDragging ? 'opacity-50' : 'opacity-100'} ${className}`}
      style={{ touchAction: 'none' }}
      role="button"
      tabIndex={0}
      aria-label={`Draggable widget ${id}`}
    >
      {children}
    </motion.div>
  )
}
