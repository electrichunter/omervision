import { Metadata } from "next";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/animation/FadeIn";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { projects } from "@/lib/data";

export const metadata: Metadata = {
  title: "Projects | Full Stack Developer",
  description: "A collection of my recent work in web development, mobile apps, and design systems.",
};

export default function ProjectsPage() {
  return (
    <>
      <Navigation />
      <main className="pt-32 pb-24">
        <Container>
          {/* Header */}
          <FadeIn className="mb-16">
            <h1 className="text-[var(--color-text-primary)] mb-4">Projects</h1>
            <p className="text-[var(--color-text-secondary)] max-w-2xl text-lg">
              A collection of my recent work. Each project represents a unique challenge and solution.
            </p>
          </FadeIn>

          {/* Projects grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {projects.map((project, index) => (
              <FadeIn key={project.id} delay={index * 0.1}>
                <ProjectCard project={project} />
              </FadeIn>
            ))}
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
