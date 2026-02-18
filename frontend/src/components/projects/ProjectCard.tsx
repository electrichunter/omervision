"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Project } from "@/types";
import { springPresets } from "@/lib/animations";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.slug}`}>
      <motion.article
        whileHover={{ y: -4 }}
        transition={springPresets.gentle}
        className="group relative bg-[var(--color-bg-secondary)] rounded-2xl overflow-hidden border border-[var(--color-border)] hover:border-[var(--color-border-hover)] transition-colors"
      >
        {/* Image */}
        <div className="relative aspect-video overflow-hidden">
          <div className="absolute inset-0 bg-[var(--color-bg-tertiary)] flex items-center justify-center text-[var(--color-text-muted)]">
            <span className="text-sm">{project.title}</span>
          </div>
          <div className="absolute inset-0 bg-[var(--color-accent-blue)]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">
                {project.category} • {project.year}
              </span>
              <h2 className="text-xl font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-blue)] transition-colors mt-1">
                {project.title}
              </h2>
            </div>
            <ArrowUpRight 
              size={20} 
              className="text-[var(--color-text-muted)] group-hover:text-[var(--color-accent-blue)] transition-colors flex-shrink-0 mt-1"
            />
          </div>
          
          <p className="text-[var(--color-text-secondary)] mb-4 line-clamp-2">
            {project.description}
          </p>

          {/* Tech stack */}
          <div className="flex flex-wrap gap-2">
            {project.technologies.slice(0, 4).map((tech) => (
              <Badge key={tech} variant="outline">
                {tech}
              </Badge>
            ))}
            {project.technologies.length > 4 && (
              <Badge variant="outline">+{project.technologies.length - 4}</Badge>
            )}
          </div>
        </div>
      </motion.article>
    </Link>
  );
}
