"use client";

import { useEffect, useState } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/animation/FadeIn";
import { api, PaaSProject } from "@/lib/api";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Github, Activity } from "lucide-react";
import { springPresets } from "@/lib/animations";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<PaaSProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPublicPaaSProjects()
      .then(setProjects)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navigation />
      <main className="pt-32 pb-24 min-h-screen bg-[var(--color-bg-primary)]">
        <Container>
          <FadeIn className="mb-16">
            <h1 className="text-4xl font-bold text-[var(--color-text-primary)] mb-4">Canlı Projelerim</h1>
            <p className="text-[var(--color-text-secondary)] max-w-2xl text-lg">
              Kendi geliştirdiğim ve izole ortamlarda barındırdığım canlı (PaaS) web uygulamalarım ve sistem araçlarım.
            </p>
          </FadeIn>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center text-[var(--color-text-muted)] py-20 font-medium">
              Henüz yayında olan bir proje bulunmuyor.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {projects.map((project, index) => (
                <FadeIn key={project.id} delay={index * 0.1}>
                  <Link href={`/paas/${project.id}`}>
                    <motion.article
                      whileHover={{ y: -8, scale: 1.01 }}
                      transition={springPresets.gentle}
                      className="group relative bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-[2.5rem] overflow-hidden hover:shadow-2xl hover:shadow-[var(--color-accent-blue)]/10 hover:border-[var(--color-accent-blue)]/30 transition-all duration-500 h-full flex flex-col shadow-premium"
                    >
                      {/* Placeholder Image / Banner */}
                      <div className="relative aspect-video overflow-hidden border-b border-[var(--color-border)]">
                        <div className="absolute inset-0 bg-dot-grid opacity-10" />
                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-bg-tertiary)] to-[var(--color-bg-primary)] flex flex-col items-center justify-center gap-4">
                          <Activity size={40} className={project.status === "running" ? "text-[var(--color-accent-green)] filter drop-shadow-[0_0_10px_rgba(0,212,123,0.3)]" : "text-[var(--color-accent-blue)] animate-pulse"} />
                          <span className="text-sm font-black text-[var(--color-text-primary)] px-6 text-center line-clamp-1 uppercase tracking-widest opacity-80">
                            {project.name}
                          </span>
                        </div>
                        <div className="absolute inset-0 bg-[var(--color-accent-blue)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </div>

                      {/* Content */}
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-[0.3em] font-black mb-2 block opacity-70">
                              {project.project_type || 'Uygulama'} • {project.status === 'running' ? 'Yayında' : 'Dağıtılıyor'}
                            </span>
                            <h2 className="text-2xl font-black text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-blue)] transition-colors uppercase tracking-tight">
                              {project.name}
                            </h2>
                          </div>
                          <div className="p-3 bg-[var(--color-bg-tertiary)] rounded-xl border border-[var(--color-border)] text-[var(--color-text-muted)] group-hover:text-[var(--color-accent-blue)] group-hover:border-[var(--color-accent-blue)]/30 transition-all flex-shrink-0">
                            <ArrowUpRight size={18} />
                          </div>
                        </div>

                        <p className="text-[var(--color-text-secondary)] mb-8 text-sm font-medium opacity-80 leading-relaxed flex-1">
                          {project.description || "Bu proje için bir açıklama girilmemiş."}
                        </p>

                        {/* Git Repo Info */}
                        <div className="flex items-center justify-between pt-6 border-t border-[var(--color-border)]">
                          <div className="flex items-center gap-3 text-[var(--color-text-muted)] hover:text-[var(--color-accent-blue)] transition-colors">
                            <Github size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest truncate max-w-[180px]">
                              {project.repo_url.split('/').pop()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${project.status === 'running' ? 'bg-[var(--color-accent-green)] shadow-[0_0_8px_var(--color-accent-green)]' : 'bg-[var(--color-accent-blue)] animate-pulse'}`} />
                            <span className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-muted)] opacity-50">Online</span>
                          </div>
                        </div>
                      </div>
                    </motion.article>
                  </Link>
                </FadeIn>
              ))}
            </div>
          )}
        </Container>
      </main>
      <Footer />
    </>
  );
}

