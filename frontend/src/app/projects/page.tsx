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
            <div className="text-center text-gray-400 py-20">
              Henüz yayında olan bir proje bulunmuyor.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {projects.map((project, index) => (
                <FadeIn key={project.id} delay={index * 0.1}>
                  <Link href={`/paas/${project.id}`}>
                    <motion.article
                      whileHover={{ y: -4 }}
                      transition={springPresets.gentle}
                      className="group relative bg-[#0a0a0f] border border-white/5 rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-blue-900/10 hover:border-blue-500/30 transition-all duration-300 h-full flex flex-col"
                    >
                      {/* Placeholder Image / Banner */}
                      <div className="relative aspect-video overflow-hidden border-b border-white/5">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/40 to-black flex flex-col items-center justify-center text-gray-500 gap-3">
                          <Activity size={32} className={project.status === "running" ? "text-emerald-500" : "text-blue-500 animate-pulse"} />
                          <span className="text-lg font-medium text-gray-300 px-4 text-center line-clamp-1">
                            {project.name}
                          </span>
                        </div>
                        <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>

                      {/* Content */}
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <span className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1 block">
                              {project.project_type || 'Uygulama'} • {project.status === 'running' ? 'Yayında' : 'Dağıtılıyor'}
                            </span>
                            <h2 className="text-xl font-semibold text-gray-200 group-hover:text-blue-400 transition-colors">
                              {project.name}
                            </h2>
                          </div>
                          <ArrowUpRight
                            size={20}
                            className="text-gray-600 group-hover:text-blue-400 transition-colors flex-shrink-0 mt-1"
                          />
                        </div>

                        <p className="text-gray-400 mb-6 text-sm flex-1">
                          {project.description || "Bu proje için bir açıklama girilmemiş."}
                        </p>

                        {/* Git Repo Info */}
                        <div className="flex items-center gap-2 pt-4 border-t border-white/5 text-gray-500 text-xs">
                          <Github size={14} />
                          <span className="truncate max-w-[250px]">{project.repo_url.replace("https://github.com/", "")}</span>
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

