"use client";

import Link from "next/link";
import { ArrowUpRight, Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { BlogPost } from "@/types";
import { formatDate } from "@/lib/utils";

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <Link href={`/blog/${post.slug}`}>
      <article className="group flex flex-col md:flex-row gap-6 p-6 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] hover:shadow-md transition-all duration-200">
        {/* Image */}
        <div className="w-full md:w-64 aspect-[16/9] flex-shrink-0 rounded-xl overflow-hidden bg-[var(--color-bg-tertiary)] flex items-center justify-center text-[var(--color-text-muted)] text-sm relative">
          {post.coverImage ? (
            <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover absolute inset-0" />
          ) : (
            <span className="p-4 text-center">{post.title}</span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Meta */}
          <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)] mb-3">
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {formatDate(post.date)}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {post.readingTime} min read
            </span>
          </div>

          {/* Title */}
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-blue)] transition-colors mb-3">
            {post.title}
          </h2>

          {/* Excerpt */}
          <p className="text-[var(--color-text-secondary)] mb-4">
            {post.excerpt}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Arrow */}
        <div className="hidden md:flex items-center">
          <ArrowUpRight
            size={24}
            className="text-[var(--color-text-muted)] group-hover:text-[var(--color-accent-blue)] transition-colors"
          />
        </div>
      </article>
    </Link>
  );
}
