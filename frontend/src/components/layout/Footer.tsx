import Link from "next/link";
import { Github, Linkedin } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { siteConfig, footerLinks } from "@/lib/constants";

const socialIcons = {
  Github,
  Linkedin,
};

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg-primary)]">
      <Container>
        <div className="py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {/* Brand */}
            <div className="space-y-4">
              <Link href="/" className="text-xl font-bold text-[var(--color-text-primary)]">
                {siteConfig.name}
              </Link>
              <p className="text-sm text-[var(--color-text-muted)] max-w-xs">
                {siteConfig.description}
              </p>
            </div>

            {/* Navigation */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">
                Navigation
              </h3>
              <ul className="space-y-3">
                {footerLinks.navigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">
                Connect
              </h3>
              <div className="flex gap-4">
                {footerLinks.social.map((item) => {
                  const Icon = socialIcons[item.icon as keyof typeof socialIcons];
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] rounded-lg transition-all"
                      aria-label={item.name}
                    >
                      <Icon size={20} />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="mt-12 pt-8 border-t border-[var(--color-border)] flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[var(--color-text-muted)]">
              © {currentYear} {siteConfig.name}. All rights reserved.
            </p>
            <p className="text-sm text-[var(--color-text-muted)]">
              Built with Next.js & Tailwind CSS
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
