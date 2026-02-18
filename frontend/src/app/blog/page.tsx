import { Metadata } from "next";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/animation/FadeIn";
import { BlogCard } from "@/components/blog/BlogCard";
import { blogPosts } from "@/lib/data";

export const metadata: Metadata = {
  title: "Blog | Full Stack Developer",
  description: "Thoughts on development, design, and everything in between.",
};

export default function BlogPage() {
  return (
    <>
      <Navigation />
      <main className="pt-32 pb-24">
        <Container>
          {/* Header */}
          <FadeIn className="mb-16">
            <h1 className="text-[var(--color-text-primary)] mb-4">Blog</h1>
            <p className="text-[var(--color-text-secondary)] max-w-2xl text-lg">
              Thoughts on development, design, and everything in between.
            </p>
          </FadeIn>

          {/* Posts list */}
          <div className="space-y-8">
            {blogPosts.map((post, index) => (
              <FadeIn key={post.id} delay={index * 0.1}>
                <BlogCard post={post} />
              </FadeIn>
            ))}
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
