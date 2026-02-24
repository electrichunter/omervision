"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Github, Linkedin, Terminal, Rocket, Github as GitHubIcon } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/lib/constants";
import { springPresets } from "@/lib/animations";

const socialLinks = [
  { icon: GitHubIcon, href: siteConfig.links.github, label: "GitHub" },
  { icon: Linkedin, href: siteConfig.links.linkedin, label: "LinkedIn" },
];

export function Hero() {
  return (
    <section className="relative min-h-[100svh] flex items-center justify-center pt-32 pb-24 overflow-hidden bg-[var(--color-bg-primary)]">
      {/* No ambient effects for maximum minimalism */}

      {/* Flat Background - No dots, no noise, no particles */}

      <Container className="relative z-20">
        <div className="max-w-5xl mx-auto text-center">
          {/* Social Links at the Top */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <div className="flex items-center justify-center gap-4">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2.5 rounded-md bg-[var(--color-bg-tertiary)]/50 backdrop-blur-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-accent-blue)] hover:border-[var(--color-accent-blue)]/50 transition-colors flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em]"
                >
                  <social.icon size={16} />
                  {social.label}
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-10 leading-[0.85] text-[var(--color-text-primary)] font-heading"
          >
            <span className="inline-block text-[var(--color-accent-blue)] filter drop-shadow-[0_10px_30px_rgba(0,190,255,0.2)]">
              İmkansızı
            </span>
            <br />
            <span className="relative text-[var(--color-text-primary)]">
              İnşa Et
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-xl sm:text-2xl text-[var(--color-text-secondary)] max-w-3xl mx-auto mb-16 leading-[1.6] font-medium tracking-tight"
          >
            Geleceğin dijital mimarisini bugünden kurun.
            <span className="text-[var(--color-text-primary)] font-black"> PaaS mimarileri</span> ve
            <span className="text-[var(--color-text-primary)] font-black"> yüksek performanslı veri hatları</span> ile
            sınırları zorluyoruz.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-24"
          >
            <Link href="/projects" className="w-full sm:w-auto">
              <Button size="lg" className="relative w-full sm:w-auto gap-4 h-20 px-10 rounded-md bg-[var(--color-accent-blue)] text-white hover:bg-[var(--color-accent-blue)]/90 transition-colors font-black uppercase tracking-widest text-xs border-none active:scale-95 shadow-sm">
                <Rocket size={22} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                Projelerimi Keşfet
              </Button>
            </Link>
            <Link href="/contact" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto gap-4 h-20 px-10 rounded-md border border-[var(--color-border)] hover:bg-[var(--color-bg-tertiary)] transition-colors font-black uppercase tracking-widest text-xs active:scale-95">
                <Terminal size={22} />
                Temasa Geç
              </Button>
            </Link>
          </motion.div>

          {/* Bottom social links removed */}
        </div>
      </Container>

      {/* Scroll indicator - Refined */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 cursor-pointer hidden sm:flex flex-col items-center gap-3"
      >
        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--color-text-muted)] opacity-50">Scoll</span>
        <div className="w-8 h-14 rounded-full border-2 border-[var(--color-accent-blue)]/30 flex items-start justify-center p-2 backdrop-blur-md">
          <motion.div
            animate={{
              y: [0, 16, 0],
              opacity: [1, 0, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1.5 h-3 rounded-full bg-[var(--color-accent-blue)]"
          />
        </div>
      </motion.div>
    </section>
  );
}
