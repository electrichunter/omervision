"use client";

import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <motion.button
            whileHover={{ scale: 1.05, backgroundColor: 'var(--color-bg-tertiary)' }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="p-3 rounded-2xl bg-[var(--color-bg-secondary)] border-2 border-[var(--color-border)] hover:border-[var(--color-accent-blue)]/50 transition-all flex items-center justify-center text-[var(--color-text-primary)] shadow-premium relative group overflow-hidden"
            aria-label="Temayı Değiştir"
        >
            <div className="absolute inset-0 bg-noise opacity-[0.05] pointer-events-none" />
            {theme === 'light' ? (
                <Moon size={20} className="text-[var(--color-accent-blue)] relative z-10" fill="currentColor" fillOpacity={0.1} />
            ) : (
                <Sun size={20} className="text-amber-400 relative z-10" fill="currentColor" fillOpacity={0.2} />
            )}
        </motion.button>
    );
}
