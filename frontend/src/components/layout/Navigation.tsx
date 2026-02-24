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
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-[var(--color-accent-blue)] rounded-md flex items-center justify-center text-white font-black text-xl shadow-sm transition-all duration-300">
                O
              </div>
              <span className="text-xl font-black tracking-tighter text-[var(--color-text-primary)]">
                OmerVision
              </span>
            </Link>
            {isMaintenance && (
              <span className="hidden sm:flex items-center gap-2 px-3 py-1 text-[10px] font-black uppercase tracking-[0.15em] rounded-full bg-[#FF3B00]/10 text-[#FF3B00] border border-[#FF3B00]/20 animate-pulse">
                <Info size={12} />
                Bakım Modu
              </span>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="px-5 py-2.5 text-xs font-black uppercase tracking-[0.2em] text-[var(--color-text-secondary)] hover:text-[var(--color-accent-blue)] transition-colors rounded-md hover:bg-[var(--color-accent-blue)]/5"
              >
                {item.name}
              </Link>
            ))}

            <div className="h-6 w-px bg-[var(--color-border)] mx-4" />

            <ThemeToggle />

            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-3 text-[var(--color-text-secondary)] hover:text-[#00BEFF] transition-all rounded-md hover:bg-[#00BEFF]/10"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            <Link
              href="/login"
              className="ml-4 px-6 py-3 bg-[var(--color-accent-blue)] text-white text-[10px] font-black uppercase tracking-widest rounded-md shadow-sm hover:opacity-90 transition-all"
            >
              Dashboard
            </Link>
          </div>

          {/* Mobile Menu Actions */}
          <div className="flex items-center gap-3 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-3 text-[var(--color-text-secondary)] hover:text-[#00BEFF] transition-all rounded-md hover:bg-[#00BEFF]/10"
              aria-label="Search"
            >
              <Search size={22} />
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-3 text-[var(--color-text-primary)] bg-[var(--color-bg-secondary)] rounded-md border border-[var(--color-border)] shadow-sm"
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
              <div className="flex items-center justify-between mb-12">
                <div className="w-10 h-10 bg-[var(--color-accent-blue)] rounded-md flex items-center justify-center text-white font-black text-xl shadow-sm">O</div>
                <button onClick={() => setIsOpen(false)} className="p-3 bg-[var(--color-bg-secondary)] rounded-md border border-[var(--color-border)]">
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
                      className="text-2xl font-black tracking-tighter text-[var(--color-text-primary)] hover:text-[var(--color-accent-blue)] transition-colors"
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="mt-auto pt-10 flex flex-col gap-4">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full h-16 bg-[var(--color-accent-blue)] text-white flex items-center justify-center font-black uppercase tracking-[0.2em] text-xs rounded-md shadow-sm"
                >
                  Admin Paneli
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  className="w-full h-16 bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] border border-[var(--color-border)] flex items-center justify-center font-black uppercase tracking-[0.2em] text-xs rounded-md hover:bg-[var(--color-bg-tertiary)]"
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
