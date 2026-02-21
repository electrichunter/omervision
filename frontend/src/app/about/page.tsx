"use client";

import { useEffect, useState } from "react";
import { Github, Linkedin, Mail, MapPin, CheckCircle } from "lucide-react";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/animation/FadeIn";
import { Skills } from "../sections/Skills";
import { ContactCTA } from "../sections/ContactCTA";

interface AboutData {
  name: string;
  title: string;
  bio: string;
  location: string;
  email: string;
  github: string;
  twitter: string;
  linkedin: string;
  available: boolean;
  avatar: string;
  avatarPosition?: string;
}

export default function AboutPage() {
  const [about, setAbout] = useState<AboutData | null>(null);

  useEffect(() => {
    fetch("/api/about").then(r => r.json()).then(setAbout).catch(console.error);
  }, []);

  return (
    <>
      <Navigation />
      <main className="pt-32">
        {/* Hero Section */}
        <section className="pb-24">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Content */}
              <FadeIn>
                <div>
                  {about?.available && (
                    <span className="inline-flex items-center gap-2 mb-6 badge-accent">
                      <CheckCircle size={12} />
                      Freelance için müsait
                    </span>
                  )}
                  <h1 className="text-[var(--color-text-primary)] mb-3">
                    {about?.name || "Ömer Faruk Uysal"}
                  </h1>
                  <p className="text-lg text-[var(--color-accent-blue)] font-medium mb-6">
                    {about?.title || "Full Stack Developer"}
                  </p>
                  <div className="space-y-4 text-[var(--color-text-secondary)] text-lg">
                    {about?.bio ? (
                      <p className="whitespace-pre-wrap leading-relaxed">{about.bio}</p>
                    ) : (
                      <p className="text-[var(--color-text-muted)] italic">
                        Dashboard &gt; Profil & Beceriler bölümünden biyografinizi ekleyin.
                      </p>
                    )}
                  </div>

                  {/* Contact info */}
                  <div className="mt-8 space-y-3">
                    {about?.location && (
                      <div className="flex items-center gap-3 text-[var(--color-text-secondary)]">
                        <MapPin size={18} className="text-[var(--color-accent-blue)]" />
                        <span>{about.location}</span>
                      </div>
                    )}
                    {about?.email && (
                      <div className="flex items-center gap-3 text-[var(--color-text-secondary)]">
                        <Mail size={18} className="text-[var(--color-accent-blue)]" />
                        <a href={`mailto:${about.email}`} className="hover:text-[var(--color-text-primary)] transition-colors">
                          {about.email}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Social links */}
                  <div className="flex gap-3 mt-8">
                    {about?.github && (
                      <a href={about.github} target="_blank" rel="noopener noreferrer"
                        className="p-3 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-hover)] transition-colors">
                        <Github size={20} />
                      </a>
                    )}
                    {about?.linkedin && (
                      <a href={about.linkedin} target="_blank" rel="noopener noreferrer"
                        className="p-3 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-hover)] transition-colors">
                        <Linkedin size={20} />
                      </a>
                    )}
                    {about?.email && (
                      <a href={`mailto:${about.email}`}
                        className="p-3 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-hover)] transition-colors">
                        <Mail size={20} />
                      </a>
                    )}
                  </div>
                </div>
              </FadeIn>

              {/* Avatar / Image */}
              <FadeIn delay={0.2}>
                <div className="relative aspect-square rounded-full overflow-hidden bg-[var(--color-bg-secondary)] border-2 border-[var(--color-border)] flex items-center justify-center w-full max-w-[380px] mx-auto shadow-2xl">
                  {about?.avatar ? (
                    <img src={about.avatar} alt={about.name || 'Avatar'} className={`w-full h-full object-cover ${about?.avatarPosition || 'object-center'}`} />
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-[var(--color-text-muted)]">
                      <div className="w-24 h-24 rounded-full bg-[var(--color-bg-tertiary)] flex items-center justify-center text-5xl font-bold text-[var(--color-text-secondary)]">
                        {(about?.name || "Ö")[0]}
                      </div>
                      <span className="text-sm">Fotoğraf eklenmedi</span>
                    </div>
                  )}
                </div>
              </FadeIn>
            </div>
          </Container>
        </section>

        {/* Skills Section */}
        <Skills />

        {/* Contact CTA */}
        <ContactCTA />
      </main>
      <Footer />
    </>
  );
}

