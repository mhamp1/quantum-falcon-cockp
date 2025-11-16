// Draggable widget component using react-dnd
import { useDrag } from "react-dnd";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface DraggableWidgetProps {
  children: ReactNode;
  id: string;
  type?: string;
}

export const DraggableWidget = ({
  children,
  id,
  type = "widget",
}: DraggableWidgetProps) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type,
    item: { id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <motion.div
      ref={drag}
      whileHover={{
        scale: 1.02,
        boxShadow: "0 10px 30px rgba(20, 241, 149, 0.3)",
      }}
      transition={{ duration: 0.2 }}
      className={`cursor-move ${isDragging ? "opacity-50" : "opacity-100"}`}
      style={{ touchAction: "none" }}
      role="button"
      tabIndex={0}
      aria-label={`Draggable widget ${id}`}
    >
      {children}
    </motion.div>
  );
};
