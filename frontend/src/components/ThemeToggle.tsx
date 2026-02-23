"use client";

import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center justify-center text-text-primary"
            aria-label="Temayı Değiştir"
        >
            {theme === 'light' ? (
                <Moon size={18} className="text-accent-blue" />
            ) : (
                <Sun size={18} className="text-amber-400" />
            )}
        </motion.button>
    );
}
