"use client";

import { useEffect, useState } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/animation/FadeIn";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { api } from "@/lib/api";
import { Project } from "@/types";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProjects()
      .then(setProjects)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navigation />
      <main className="pt-32 pb-24 min-h-screen bg-[#0a0a0f]">
        <Container>
          <FadeIn className="mb-16">
            <h1 className="text-4xl font-bold text-white mb-4">Projeler</h1>
            <p className="text-gray-400 max-w-2xl text-lg">
              Son teknoloji ile geliştirdiğim modern web uygulamaları, sistem araçları ve tasarım çalışmalarımdan bir seçki.
            </p>
          </FadeIn>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {projects.map((project, index) => (
                <FadeIn key={project.id} delay={index * 0.1}>
                  <ProjectCard project={project} />
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
