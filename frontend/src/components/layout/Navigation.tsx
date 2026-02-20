"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { navigation } from "@/lib/constants";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { springPresets } from "@/lib/animations";
import { SearchModal } from "./SearchModal";
import { Search, Info } from "lucide-react";
import { api } from "@/lib/api";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMaintenance, setIsMaintenance] = useState(false);
  const { scrollDirection, scrollY } = useScrollDirection();

  useEffect(() => {
    api.getHealth().then(data => setIsMaintenance(data.maintenance)).catch(() => { });
  }, []);

  const isScrolled = scrollY > 20;
  const isHidden = scrollDirection === "down" && scrollY > 100;

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{
        y: isHidden ? -100 : 0,
      }}
      transition={springPresets.smooth}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
          ? 'bg-white/80 backdrop-blur-xl border-b border-[var(--color-border)] shadow-sm'
          : 'bg-transparent'
        }`}
    >
      <Container>
        <nav className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl font-bold text-[var(--color-text-primary)]">
              Portfolio
            </Link>
            {isMaintenance && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse">
                <Info size={12} />
                Bakımdayız
              </span>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors rounded-lg hover:bg-[var(--color-bg-tertiary)]"
              >
                {item.name}
              </Link>
            ))}

            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 ml-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors rounded-lg hover:bg-[var(--color-bg-tertiary)]"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-[var(--color-text-primary)]"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>
      </Container>

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={springPresets.gentle}
            className="md:hidden glass border-t border-[var(--color-border)]"
          >
            <Container>
              <div className="py-4 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-3 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] rounded-lg transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
