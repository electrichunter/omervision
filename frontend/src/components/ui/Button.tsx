"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { springPresets } from "@/lib/animations";

type ButtonProps = HTMLMotionProps<"button"> & {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-blue)] disabled:pointer-events-none disabled:opacity-50";
    
    const variants = {
      primary: "bg-[var(--color-accent-blue)] text-white hover:bg-[var(--color-accent-blue)]/90",
      secondary: "bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]/80",
      ghost: "hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)]",
      outline: "border border-[var(--color-border)] bg-transparent hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)]",
    };

    const sizes = {
      sm: "h-9 px-4 text-sm rounded-lg",
      md: "h-11 px-6 text-sm rounded-xl",
      lg: "h-12 px-8 text-base rounded-xl",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={springPresets.quick}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export { Button };
