"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Github, Linkedin, Twitter } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/lib/constants";
import { springPresets } from "@/lib/animations";

const socialLinks = [
  { icon: Github, href: siteConfig.links.github, label: "GitHub" },
  { icon: Twitter, href: siteConfig.links.twitter, label: "Twitter" },
  { icon: Linkedin, href: siteConfig.links.linkedin, label: "LinkedIn" },
];

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 pb-16 overflow-hidden bg-mesh">
      {/* Subtle dot grid overlay */}
      <div className="absolute inset-0 bg-dot-grid opacity-40 pointer-events-none" />
      {/* Radial top glow */}
      <div className="absolute inset-0 bg-radial-glow pointer-events-none" />

      <Container className="relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springPresets.gentle, delay: 0.1 }}
          >
            <span className="inline-flex items-center gap-2 mb-8 badge-accent">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_theme(colors.emerald.400)] animate-pulse" />
              Available for freelance work
            </span>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springPresets.cinematic, delay: 0.2 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6"
          >
            <span className="text-gradient">Full Stack</span>
            <br />
            <span className="text-[var(--color-text-primary)]">Developer</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springPresets.gentle, delay: 0.3 }}
            className="text-lg sm:text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-10"
          >
            Building digital experiences with modern technologies. Focused on performance,
            accessibility, and beautiful design.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springPresets.gentle, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link href="/projects">
              <Button size="lg" className="gap-2">
                View Projects
                <ArrowRight size={18} />
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg">
                Get in Touch
              </Button>
            </Link>
          </motion.div>

          {/* Social links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ...springPresets.gentle, delay: 0.5 }}
            className="flex items-center justify-center gap-4"
          >
            {socialLinks.map((social, index) => (
              <motion.a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...springPresets.gentle, delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.1, y: -2 }}
                className="p-3 rounded-xl card text-[var(--color-text-secondary)] hover:text-[var(--color-accent-blue)] transition-colors"
                aria-label={social.label}
              >
                <social.icon size={20} />
              </motion.a>
            ))}
          </motion.div>
        </div>
      </Container>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-6 h-10 rounded-full border-2 border-[var(--color-border-hover)] flex items-start justify-center p-2 bg-white/60 backdrop-blur"
        >
          <motion.div className="w-1 h-2 rounded-full bg-[var(--color-accent-blue)]" />
        </motion.div>
      </motion.div>
    </section>
  );
}
