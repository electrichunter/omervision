"use client";

import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/animation/FadeIn";
import { siteConfig } from "@/lib/constants";

export function ContactCTA() {
  return (
    <section className="py-24 md:py-32 bg-[var(--color-bg-primary)]">
      <Container>
        <FadeIn>
          <div className="max-w-2xl mx-auto text-center">
            {/* Divider line */}
            <div className="flex items-center gap-4 mb-12">
              <div className="flex-1 h-px bg-[var(--color-border)]" />
              <span className="text-xs font-semibold tracking-widest uppercase text-[var(--color-text-muted)]">İletişim</span>
              <div className="flex-1 h-px bg-[var(--color-border)]" />
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-[var(--color-text-primary)] mb-5 leading-tight">
              Birlikte bir şeyler<br />
              <span className="text-[var(--color-accent-blue)]">üretelim.</span>
            </h2>

            <p className="text-lg text-[var(--color-text-secondary)] mb-10 max-w-lg mx-auto">
              Aklınızda bir proje mi var? Fikirlerinizi hayata geçirmek için konuşalım.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href={`mailto:${siteConfig.links.email}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-text-primary)] text-white rounded-xl font-medium text-sm hover:opacity-90 transition-opacity shadow-lg shadow-black/10"
              >
                <Mail size={17} />
                E-posta Gönder
              </Link>
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 px-6 py-3 border border-[var(--color-border)] text-[var(--color-text-secondary)] rounded-xl font-medium text-sm hover:border-[var(--color-border-hover)] hover:text-[var(--color-text-primary)] transition-colors bg-white"
              >
                Projeleri İncele
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
