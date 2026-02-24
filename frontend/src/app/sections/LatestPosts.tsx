"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Calendar, Clock } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { FadeIn } from "@/components/animation/FadeIn";
import { api } from "@/lib/api";
import { BlogPost } from "@/types";
import { formatDate } from "@/lib/utils";

export function LatestPosts() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getBlogs(undefined, 3)
      .then(res => setPosts(res.filter(p => p.featured)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (posts.length === 0) return null;

  return (
    <section className="py-24 md:py-32 bg-[var(--color-bg-primary)]">
      <Container>
        <FadeIn className="mb-16">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h2 className="text-[var(--color-text-primary)] mb-4 font-bold text-3xl">Latest Posts</h2>
              <p className="text-[var(--color-text-secondary)] max-w-2xl text-lg">
                Thoughts on development, design, and everything in between.
              </p>
            </div>
            <Link
              href="/blog"
              className="text-[var(--color-accent-blue)] hover:text-[var(--color-accent-blue)]/80 font-medium inline-flex items-center gap-1 transition-colors group"
            >
              View all posts
              <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map((post, index) => (
            <FadeIn key={post.id} delay={index * 0.1}>
              <Link href={`/blog/${post.slug}`}>
                <article className="group h-full flex flex-col card overflow-hidden">
                  <div className="relative aspect-[16/9] overflow-hidden bg-[var(--color-bg-tertiary)]">
                    {post.coverImage ? (
                      <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-[var(--color-text-muted)] text-xs p-4 text-center italic">
                        {post.title}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 p-6 flex flex-col">
                    <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)] mb-3 text-xs">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {formatDate(post.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {post.readingTime} min read
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-blue)] transition-colors mb-3 line-clamp-2">
                      {post.title}
                    </h3>

                    <p className="text-[var(--color-text-secondary)] text-sm line-clamp-3 mb-4 flex-1">
                      {post.excerpt}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-auto">
                      {post.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-[10px] uppercase tracking-wider px-2 py-0">
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
