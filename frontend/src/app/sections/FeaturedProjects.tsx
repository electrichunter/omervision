"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Github, Activity, Zap } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/animation/FadeIn";
import { api, PaaSProject } from "@/lib/api";
import { motion } from "framer-motion";
import { springPresets } from "@/lib/animations";

export function FeaturedProjects() {
  const [projects, setProjects] = useState<PaaSProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPublicPaaSProjects()
      .then(res => setProjects(res.slice(0, 4)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (projects.length === 0) return null;

  return (
    <section className="py-24 md:py-40 relative overflow-hidden bg-[var(--color-bg-primary)]">
      {/* Flat background, no glows */}

      <Container className="relative z-10">
        <FadeIn className="mb-24">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-10">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="w-16 h-1 bg-[var(--color-accent-blue)] rounded-full" />
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--color-accent-blue)]">OPERASYONEL MERKEZ</span>
              </div>
              <h2 className="text-[var(--color-text-primary)] font-black text-5xl sm:text-6xl lg:text-7xl tracking-tighter leading-[0.95] font-heading">
                Dijital <br /><span className="text-[var(--color-accent-blue)] drop-shadow-[0_10px_30px_rgba(0,190,255,0.2)]">İstasyonlar</span>
              </h2>
              <p className="text-[var(--color-text-secondary)] max-w-2xl text-xl font-medium opacity-70 leading-relaxed tracking-tight">
                VDS sunucularım üzerinde Docker ile izole edilmiş, yüksek performanslı uygulama ekosistemim.
              </p>
            </div>
            <Link
              href="/projects"
              className="px-10 py-5 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:border-[var(--color-accent-blue)] text-[var(--color-text-primary)] font-black text-[10px] uppercase tracking-[0.3em] rounded-md transition-colors group flex items-center gap-4 shadow-sm"
            >
              Arşivi İncele
              <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform text-[var(--color-accent-blue)]" />
            </Link>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {projects.map((project, index) => (
            <FadeIn key={project.id} delay={index * 0.1}>
              <Link href={`/paas/${project.id}`} className="block h-full group">
                <motion.article
                  className="relative h-full flex flex-col bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg overflow-hidden shadow-sm transition-colors duration-300 group-hover:border-[var(--color-accent-blue)]/50"
                >
                  {/* High Impact Media Section */}
                  <div className="relative aspect-[16/10] overflow-hidden border-b border-[var(--color-border)]">
                    <div className="absolute inset-0 bg-[#000000]" />

                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 p-10">
                      <div
                        className="w-28 h-28 rounded-md flex items-center justify-center shadow-sm transition-colors duration-300 bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] group-hover:bg-[var(--color-accent-blue)]/10 group-hover:text-[var(--color-accent-blue)] border border-[var(--color-border)] group-hover:border-[var(--color-accent-blue)]/20"
                      >
                        <Activity size={56} />
                      </div>
                      <div className="text-center space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--color-text-muted)] opacity-50">Sistem ID: {String(project.id).slice(0, 8)}</span>
                        <h3 className="text-3xl font-black text-white tracking-tighter line-clamp-1 font-heading uppercase">{project.name}</h3>
                      </div>
                    </div>

                    <div className="absolute top-8 right-8">
                      <div className="p-4 bg-[var(--color-bg-primary)] rounded-md border border-[var(--color-border)] text-[var(--color-text-secondary)] opacity-0 group-hover:opacity-100 group-hover:text-[var(--color-accent-blue)] group-hover:border-[var(--color-accent-blue)]/50 transition-all duration-300">
                        <ArrowUpRight size={24} />
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-12 flex-1 flex flex-col">
                    <div className="flex flex-wrap items-center gap-4 mb-8">
                      <span className="px-5 py-2 bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] text-[9px] font-black uppercase tracking-[0.3em] rounded-md border border-[var(--color-border)]">
                        {project.project_type || 'CORE SERVICE'}
                      </span>
                      <span className="px-5 py-2 text-[9px] font-black uppercase tracking-[0.3em] rounded-md border bg-[var(--color-bg-primary)] text-[var(--color-text-secondary)] border-[var(--color-border)]">
                        {project.status === 'running' ? '• System Online' : '• Deploying Node'}
                      </span>
                    </div>

                    <p className="text-[var(--color-text-secondary)] font-medium text-lg leading-relaxed mb-10 flex-1 opacity-80 tracking-tight">
                      {project.description || "Yüksek erişilebilirlik ve performans odaklı mikro-servis mimarisi."}
                    </p>

                    <div className="flex items-center justify-between pt-10 border-t border-[var(--color-border)]">
                      <div className="flex items-center gap-4 text-[var(--color-text-muted)] hover:text-[#00BEFF] transition-all group/repo">
                        <Github size={20} className="group-hover/repo:scale-125 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">{project.repo_url.split("/").pop()}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-muted)] hidden sm:block">Ping: 24ms</span>
                        <div className="w-3 h-3 rounded-full bg-[var(--color-text-secondary)]" />
                      </div>
                    </div>
                  </div>
                </motion.article>
              </Link>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}
