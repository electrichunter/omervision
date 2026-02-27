"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search, Info, Zap } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { navigation } from "@/lib/constants";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { springPresets } from "@/lib/animations";
import { SearchModal } from "./SearchModal";
import ThemeToggle from "@/components/ThemeToggle";
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
        ? 'bg-[var(--color-bg-primary)]/80 backdrop-blur-xl border-b border-[var(--color-border)] shadow-lg shadow-black/5 dark:shadow-white/5'
        : 'bg-transparent'
        }`}
    >
      <Container>
        <nav className="flex items-center justify-between h-20 md:h-24">
          {/* Logo Section */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-[var(--color-accent)] flex items-center justify-center text-[var(--color-bg-primary)] font-black text-xl shadow-sm transition-all duration-300">
                O
              </div>
              <span className="text-xl font-black tracking-tighter text-[var(--color-text-primary)]">
                OmerVision
              </span>
            </Link>
            {isMaintenance && (
              <span className="hidden sm:flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-[0.15em] bg-[var(--color-surface)] text-[var(--color-accent)] border border-[var(--color-accent)]">
                <Info size={16} />
                Bakım Modu
              </span>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-all active:scale-95 hover:bg-[var(--color-surface)]"
              >
                {item.name}
              </Link>
            ))}

            <div className="h-8 w-px bg-[var(--color-border)] mx-2" />

            <ThemeToggle />

            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-all active:scale-95 hover:bg-[var(--color-surface)]"
              aria-label="Search"
            >
              <Search size={24} />
            </button>

            <Link
              href="/login"
              className="ml-2 px-8 py-4 bg-[var(--color-accent)] text-[var(--color-bg-primary)] text-xs font-black uppercase tracking-widest shadow-sm hover:opacity-90 transition-all"
            >
              Dashboard
            </Link>
          </div>

          {/* Mobile Menu Actions */}
          <div className="flex items-center gap-2 md:hidden">
            <div className="w-12 h-12 flex items-center justify-center">
              <ThemeToggle />
            </div>
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-12 h-12 flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-all active:scale-95 hover:bg-[var(--color-surface)]"
              aria-label="Search"
            >
              <Search size={24} />
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-12 h-12 flex items-center justify-center text-[var(--color-text-primary)] bg-[var(--color-surface)] border border-[var(--color-border)] transition-all active:scale-95 shadow-sm"
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

      {/* Mobile Menu Implementation */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-xl z-[45] md:hidden"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed top-0 right-0 bottom-0 w-[80%] max-w-[400px] z-50 bg-[var(--color-bg-primary)] p-8 flex flex-col shadow-2xl md:hidden"
            >
              <div className="flex items-center justify-between mb-16">
                <div className="w-12 h-12 bg-[var(--color-accent)] flex items-center justify-center text-[var(--color-bg-primary)] font-black text-xl shadow-sm">O</div>
                <button onClick={() => setIsOpen(false)} className="w-12 h-12 flex items-center justify-center bg-[var(--color-surface)] border border-[var(--color-border)] active:scale-95 transition-all">
                  <X size={24} />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {navigation.map((item, i) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="text-2xl font-black tracking-tighter text-[var(--color-text-primary)] hover:text-[var(--color-accent)] transition-all"
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="mt-auto pt-8 flex flex-col gap-4">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full h-16 bg-[var(--color-accent)] text-[var(--color-bg-primary)] flex items-center justify-center font-black uppercase tracking-[0.2em] text-xs shadow-sm active:scale-95 transition-all hover:opacity-90"
                >
                  Admin Paneli
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  className="w-full h-16 bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--color-border)] flex items-center justify-center font-black uppercase tracking-[0.2em] text-xs hover:bg-[var(--color-bg-primary)] active:scale-95 transition-all"
                >
                  Kayıt Ol
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
