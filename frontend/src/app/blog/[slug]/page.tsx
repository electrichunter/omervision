import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { FadeIn } from "@/components/animation/FadeIn";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { VoicePlayer } from "@/components/ui/VoicePlayer";

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await api.getBlogBySlug(slug);
    return {
      title: `${post.title} | Full Stack Developer`,
      description: post.excerpt,
    };
  } catch (e) {
    return { title: "Post Not Found" };
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;

  let post;
  try {
    post = await api.getBlogBySlug(slug);
  } catch (e) {
    notFound();
  }

  return (
    <>
      <Navigation />
      <main className="pt-32 pb-24">
        <Container size="md">
          {/* Back link */}
          <FadeIn>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors mb-8"
            >
              <ArrowLeft size={18} />
              Blog'a dön
            </Link>
          </FadeIn>

          {/* Header */}
          <FadeIn delay={0.1}>
            <header className="mb-12">
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Title */}
              <h1 className="text-[var(--color-text-primary)] mb-6">{post.title}</h1>

              {/* Meta */}
              <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)]">
                <span className="flex items-center gap-1">
                  <Calendar size={16} />
                  {formatDate(post.date)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={16} />
                  {post.readingTime} dk okuma
                </span>
              </div>
            </header>
          </FadeIn>

          {/* Cover image */}
          {post.coverImage && (
            <FadeIn delay={0.2}>
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-[var(--color-bg-secondary)] border border-[var(--color-border)] mb-12">
                <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
              </div>
            </FadeIn>
          )}

          {/* AI Voice Player */}
          <VoicePlayer content={post.content} title={post.title} />

          {/* Content */}
          <FadeIn delay={0.3}>
            <article className="prose prose-slate prose-lg max-w-none">
              <div
                className="text-[var(--color-text-secondary)]"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </article>
          </FadeIn>
        </Container>
      </main>
      <Footer />
    </>
  );
}
