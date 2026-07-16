"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

interface FadeInSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  duration?: number;
  once?: boolean;
}

const directionMap = {
  up:    { y: 40,   x: 0   },
  down:  { y: -40,  x: 0   },
  left:  { y: 0,    x: 50  },
  right: { y: 0,    x: -50 },
  none:  { y: 0,    x: 0   },
};

export default function FadeInSection({
  children,
  className,
  delay = 0,
  direction = "up",
  duration = 0.65,
  once = true,
}: FadeInSectionProps) {
  const ref  = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: "-80px 0px" });
  const { x, y } = directionMap[direction];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x, y }}
      animate={inView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
