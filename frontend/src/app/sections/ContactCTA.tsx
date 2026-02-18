"use client";

import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/animation/FadeIn";
import { siteConfig } from "@/lib/constants";

export function ContactCTA() {
  return (
    <section className="py-24 md:py-32">
      <Container>
        <FadeIn>
          <div className="relative bg-gradient-to-br from-[var(--color-bg-secondary)] to-[var(--color-bg-tertiary)] rounded-3xl p-8 md:p-16 text-center overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 bg-radial-glow opacity-50" />
            
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--color-text-primary)] mb-6">
                Let&apos;s work together
              </h2>
              
              <p className="text-lg text-[var(--color-text-secondary)] mb-10">
                Have a project in mind? I&apos;d love to hear about it. Let&apos;s discuss how we can bring your ideas to life.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href={`mailto:${siteConfig.links.email}`}>
                  <Button size="lg" className="gap-2">
                    <Mail size={18} />
                    Get in Touch
                  </Button>
                </Link>
                <Link href="/projects">
                  <Button variant="outline" size="lg" className="gap-2">
                    View Projects
                    <ArrowRight size={18} />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
