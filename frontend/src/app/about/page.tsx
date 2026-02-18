import { Metadata } from "next";
import { Github, Twitter, Linkedin, Mail, MapPin } from "lucide-react";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/animation/FadeIn";
import { Skills } from "../sections/Skills";
import { ContactCTA } from "../sections/ContactCTA";
import { siteConfig } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About | Full Stack Developer",
  description: "Learn more about my background, skills, and experience.",
};

export default function AboutPage() {
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
                  <h1 className="text-[var(--color-text-primary)] mb-6">
                    About Me
                  </h1>
                  <div className="space-y-4 text-[var(--color-text-secondary)] text-lg">
                    <p>
                      I&apos;m a full-stack developer with a passion for creating beautiful, 
                      performant, and user-friendly applications. With over 5 years of experience 
                      in the industry, I&apos;ve worked on projects ranging from small startups to 
                      enterprise applications.
                    </p>
                    <p>
                      My approach to development is centered around writing clean, maintainable 
                      code while keeping the user experience at the forefront. I believe that 
                      good design and solid engineering go hand in hand.
                    </p>
                    <p>
                      When I&apos;m not coding, you can find me exploring new technologies, 
                      contributing to open-source projects, or writing about my experiences 
                      in the tech industry.
                    </p>
                  </div>

                  {/* Contact info */}
                  <div className="mt-8 space-y-3">
                    <div className="flex items-center gap-3 text-[var(--color-text-secondary)]">
                      <MapPin size={18} className="text-[var(--color-accent-blue)]" />
                      <span>San Francisco, CA</span>
                    </div>
                    <div className="flex items-center gap-3 text-[var(--color-text-secondary)]">
                      <Mail size={18} className="text-[var(--color-accent-blue)]" />
                      <a href={`mailto:${siteConfig.links.email}`} className="hover:text-[var(--color-text-primary)] transition-colors">
                        {siteConfig.links.email}
                      </a>
                    </div>
                  </div>

                  {/* Social links */}
                  <div className="flex gap-3 mt-8">
                    <a
                      href={siteConfig.links.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-hover)] transition-colors"
                    >
                      <Github size={20} />
                    </a>
                    <a
                      href={siteConfig.links.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-hover)] transition-colors"
                    >
                      <Twitter size={20} />
                    </a>
                    <a
                      href={siteConfig.links.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-hover)] transition-colors"
                    >
                      <Linkedin size={20} />
                    </a>
                  </div>
                </div>
              </FadeIn>

              {/* Image placeholder */}
              <FadeIn delay={0.2}>
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-[var(--color-bg-secondary)] border border-[var(--color-border)] flex items-center justify-center">
                  <span className="text-[var(--color-text-muted)]">Profile Image</span>
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
