"use client";

import { motion } from "framer-motion";

interface SkeletonProps {
    className?: string;
    variant?: 'default' | 'shimmer' | 'glass';
}

export function Skeleton({ className = "", variant = 'shimmer' }: SkeletonProps) {
    if (variant === 'glass') {
        return (
            <div className={`relative overflow-hidden bg-[var(--color-bg-tertiary)] backdrop-blur-md border border-[var(--color-border)] rounded-2xl ${className}`}>
                <motion.div
                    animate={{
                        x: ["-100%", "200%"],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-[var(--color-text-primary)]/5 to-transparent skew-x-12"
                />
            </div>
        );
    }

    return (
        <div className={`relative overflow-hidden bg-[var(--color-bg-tertiary)] rounded-2xl ${className}`}>
            <motion.div
                animate={{
                    x: ["-100%", "200%"],
                }}
                transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--color-accent-blue)]/5 via-[var(--color-accent-purple)]/10 via-[var(--color-accent-blue)]/5 to-transparent"
                style={{ width: "60%" }}
            />
        </div>
    );
}
