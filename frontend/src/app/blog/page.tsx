"use client";

import { useEffect, useState } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/animation/FadeIn";
import { BlogCard } from "@/components/blog/BlogCard";
import { api } from "@/lib/api";
import { BlogPost } from "@/types";

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getBlogs()
      .then(setPosts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navigation />
      <main className="pt-32 pb-24 min-h-screen bg-[var(--color-bg-primary)]">
        <Container>
          <FadeIn className="mb-16">
            <h1 className="text-4xl font-bold text-[var(--color-text-primary)] mb-4">Blog</h1>
            <p className="text-[var(--color-text-secondary)] max-w-2xl text-lg">
              Yazılım dünyasından notlar, yeni teknolojiler ve deneyimlerim.
            </p>
          </FadeIn>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-[var(--color-accent-purple)] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-[var(--color-text-muted)] text-lg">Henüz yayınlanmış yazı yok.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {posts.map((post: BlogPost, index: number) => (
                <div key={post.id}>
                  <FadeIn delay={index * 0.1}>
                    <BlogCard post={post} />
                  </FadeIn>
                </div>
              ))}
            </div>
          )}
        </Container>
      </main>
      <Footer />
    </>
  );
}

