import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/animation/FadeIn";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { projects } from "@/lib/data";

export function FeaturedProjects() {
  const featuredProjects = projects.filter(p => p.featured);

  return (
    <section className="py-24 md:py-32">
      <Container>
        {/* Section header */}
        <FadeIn className="mb-16">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h2 className="text-[var(--color-text-primary)] mb-4">Featured Projects</h2>
              <p className="text-[var(--color-text-secondary)] max-w-2xl text-lg">
                A selection of my recent work. Each project represents a unique challenge and solution.
              </p>
            </div>
            <Link 
              href="/projects" 
              className="text-[var(--color-accent-blue)] hover:text-[var(--color-accent-blue)]/80 font-medium inline-flex items-center gap-1 transition-colors"
            >
              View all projects
              <ArrowUpRight size={18} />
            </Link>
          </div>
        </FadeIn>

        {/* Projects grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {featuredProjects.map((project, index) => (
            <FadeIn key={project.id} delay={index * 0.1}>
              <ProjectCard project={project} />
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}
