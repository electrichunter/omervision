"use client";

import Link from "next/link";
import { ArrowUpRight, Calendar, Clock } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { FadeIn } from "@/components/animation/FadeIn";
import { blogPosts } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export function LatestPosts() {
  const latestPosts = blogPosts.filter(p => p.featured).slice(0, 3);

  return (
    <section className="py-24 md:py-32 bg-[var(--color-bg-secondary)]">
      <Container>
        {/* Section header */}
        <FadeIn className="mb-16">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h2 className="text-[var(--color-text-primary)] mb-4">Latest Posts</h2>
              <p className="text-[var(--color-text-secondary)] max-w-2xl text-lg">
                Thoughts on development, design, and everything in between.
              </p>
            </div>
            <Link 
              href="/blog" 
              className="text-[var(--color-accent-blue)] hover:text-[var(--color-accent-blue)]/80 font-medium inline-flex items-center gap-1 transition-colors"
            >
              View all posts
              <ArrowUpRight size={18} />
            </Link>
          </div>
        </FadeIn>

        {/* Posts grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {latestPosts.map((post, index) => (
            <FadeIn key={post.id} delay={index * 0.1}>
              <Link href={`/blog/${post.slug}`}>
                <article className="group h-full flex flex-col bg-[var(--color-bg-primary)] rounded-2xl overflow-hidden border border-[var(--color-border)] hover:border-[var(--color-border-hover)] transition-colors">
                  {/* Image placeholder */}
                  <div className="relative aspect-[16/9] overflow-hidden bg-[var(--color-bg-tertiary)]">
                    <div className="absolute inset-0 flex items-center justify-center text-[var(--color-text-muted)] text-sm">
                      {post.title}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6 flex flex-col">
                    {/* Meta */}
                    <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)] mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {formatDate(post.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {post.readingTime}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-blue)] transition-colors mb-3 line-clamp-2">
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-[var(--color-text-secondary)] text-sm line-clamp-3 mb-4 flex-1">
                      {post.excerpt}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mt-auto">
                      {post.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </article>
              </Link>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
}
