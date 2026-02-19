import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/animation/FadeIn";
import { api } from "@/lib/api";

interface ProjectPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const project = await api.getProjectBySlug(slug);
    return {
      title: `${project.title} | Full Stack Developer`,
      description: project.description,
    };
  } catch (e) {
    return { title: "Project Not Found" };
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;

  let project;
  try {
    project = await api.getProjectBySlug(slug);
  } catch (e) {
    notFound();
  }

  return (
    <>
      <Navigation />
      <main className="pt-32 pb-24">
        <Container>
          {/* Back link */}
          <FadeIn>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors mb-8"
            >
              <ArrowLeft size={18} />
              Back to projects
            </Link>
          </FadeIn>

          {/* Header */}
          <FadeIn delay={0.1}>
            <div className="mb-12">
              <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)] mb-4">
                <span>{project.category}</span>
                <span>•</span>
                <span>{project.year}</span>
              </div>
              <h1 className="text-[var(--color-text-primary)] mb-6">{project.title}</h1>
              <p className="text-xl text-[var(--color-text-secondary)] max-w-3xl">
                {project.description}
              </p>
            </div>
          </FadeIn>

          {/* Actions */}
          <FadeIn delay={0.2}>
            <div className="flex flex-wrap gap-4 mb-12">
              {project.githubUrl && (
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="gap-2">
                    <Github size={18} />
                    View Code
                  </Button>
                </a>
              )}
              {project.liveUrl && (
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                  <Button className="gap-2">
                    <ExternalLink size={18} />
                    Live Demo
                  </Button>
                </a>
              )}
            </div>
          </FadeIn>

          {/* Main image */}
          <FadeIn delay={0.3}>
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-[var(--color-bg-secondary)] border border-[var(--color-border)] mb-12">
              <div className="absolute inset-0 flex items-center justify-center text-[var(--color-text-muted)]">
                {project.title}
              </div>
            </div>
          </FadeIn>

          {/* Content */}
          <FadeIn delay={0.4}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Main content */}
              <div className="lg:col-span-2">
                <div className="prose prose-invert max-w-none">
                  <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-4">
                    About the Project
                  </h2>
                  <div className="text-[var(--color-text-secondary)] space-y-4 whitespace-pre-line">
                    {project.longDescription}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div>
                <div className="bg-[var(--color-bg-secondary)] rounded-2xl p-6 border border-[var(--color-border)]">
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
                    Technologies
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech) => (
                      <Badge key={tech} variant="secondary">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </Container>
      </main>
      <Footer />
    </>
  );
}
