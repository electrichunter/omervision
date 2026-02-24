"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { BlogPost } from '@/types';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Eye, EyeOff, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function ContentListPage() {
    const router = useRouter();
    const [blogs, setBlogs] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchBlogs = async () => {
        setLoading(true);
        try {
            // parameter signature: cursor, limit, includeDrafts
            const data = await api.getBlogs(undefined, 50, true);
            setBlogs(data);
        } catch (error) {
            console.error(error);
            alert("İçerikler yüklenemedi.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlogs();
    }, []);

    const handleDelete = async (id: string, title: string) => {
        if (!window.confirm(`"${title}" adlı içeriği silmek istediğinize emin misiniz?`)) return;
        try {
            await api.deleteBlog(id);
            setBlogs(blogs.filter(b => b.id !== id));
        } catch (error) {
            console.error(error);
            alert("Silme işlemi başarısız.");
        }
    };

    const handleTogglePublish = async (id: string, isPublished: boolean) => {
        try {
            await api.toggleBlogPublish(id);
            setBlogs(blogs.map(b => b.id === id ? { ...b, is_published: !isPublished } : b));
        } catch (error) {
            console.error(error);
            alert("Yayın durumu değiştirilemedi.");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[500px]">
                <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">İçerik Yönetimi</h1>
                    <p className="text-[var(--color-text-muted)]">Tüm yazılarınızı buradan yönetebilir, yeni içerikler yayınlayabilirsiniz.</p>
                </div>
                <button
                    onClick={() => router.push('/dashboard/content/create')}
                    className="flex items-center gap-2 bg-[var(--color-accent-blue)] hover:bg-[var(--color-accent-blue)]/90 text-white px-5 py-2.5 rounded-md font-medium transition-colors shadow-sm"
                >
                    <Plus size={18} />
                    Yeni İçerik Ekle
                </button>
            </div>

            <div className="grid gap-4">
                {blogs.length === 0 ? (
                    <div className="text-center py-24 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg shadow-sm">
                        <p className="text-[var(--color-text-muted)] mb-4 font-bold uppercase tracking-widest text-xs opacity-60">Henüz hiç içerik oluşturmamışsınız.</p>
                        <button
                            onClick={() => router.push('/dashboard/content/create')}
                            className="text-blue-400 hover:text-blue-300 font-medium"
                        >
                            İlk yazınızı oluşturmak için tıklayın
                        </button>
                    </div>
                ) : (
                    blogs.map((blog, index) => (
                        <motion.div
                            key={blog.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`flex flex-col sm:flex-row gap-8 p-6 rounded-lg border transition-colors shadow-sm bg-[var(--color-bg-secondary)] ${blog.is_published ? 'border-[var(--color-border)] hover:border-[var(--color-accent-blue)]/30' : 'border-dashed border-[var(--color-border)] opacity-80'}`}
                        >
                            {/* Image Placeholder / Thumbnail */}
                            <div className="w-full sm:w-48 aspect-[16/9] sm:aspect-auto rounded-md bg-[var(--color-bg-tertiary)] overflow-hidden shrink-0 border border-[var(--color-border)] relative flex items-center justify-center">
                                {blog.coverImage ? (
                                    <img src={blog.coverImage} className="w-full h-full object-cover absolute inset-0" alt={blog.title} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)] font-mono text-xs opacity-20">
                                        No Image
                                    </div>
                                )}
                                {!blog.is_published && (
                                    <div className="absolute top-2 left-2 bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-[var(--color-text-secondary)] text-[10px] uppercase font-black px-2 py-1 rounded-sm shadow-sm">Taslak</div>
                                )}
                            </div>

                            {/* Content Details */}
                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-4 mb-3">
                                        <h2 className="text-2xl font-black text-[var(--color-text-primary)] tracking-tight truncate" title={blog.title}>
                                            {blog.title}
                                        </h2>
                                        {blog.is_published ? (
                                            <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-black bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-green-500 px-3 py-1.5 rounded-sm shrink-0 shadow-sm">
                                                Yayında
                                            </span>
                                        ) : null}
                                    </div>
                                    <p className="text-[var(--color-text-secondary)] text-sm line-clamp-2 mb-4 leading-relaxed opacity-80">
                                        {blog.excerpt || "Açıklama veya özet girilmemiş..."}
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">
                                        <span className="flex items-center gap-1.5 opacity-70"><Calendar size={14} /> {formatDate(blog.date)}</span>
                                        <span className="px-2.5 py-1 rounded-md bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]">{blog.readingTime} min read</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleTogglePublish(blog.id, blog.is_published ?? true)}
                                            className={`p-2 rounded-md transition-colors shadow-sm flex items-center gap-1 text-sm font-medium border border-transparent ${blog.is_published ? 'hover:border-[var(--color-border)] text-orange-400 hover:bg-[var(--color-bg-tertiary)]' : 'hover:border-[var(--color-border)] text-green-400 hover:bg-[var(--color-bg-tertiary)]'}`}
                                            title={blog.is_published ? "Yayından Kaldır (Taslağa Çevir)" : "Yayınla"}
                                        >
                                            {blog.is_published ? <><EyeOff size={16} /> Yayından Al</> : <><Eye size={16} /> Yayınla</>}
                                        </button>

                                        <button
                                            onClick={() => router.push(`/dashboard/content/edit/${blog.id}`)}
                                            className="p-2 rounded-md text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] border border-transparent hover:border-[var(--color-border)] transition-colors shadow-sm"
                                            title="Düzenle"
                                        >
                                            <Edit size={16} />
                                        </button>

                                        <button
                                            onClick={() => handleDelete(blog.id, blog.title)}
                                            className="p-2 rounded-md text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-colors shadow-sm"
                                            title="Sil"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
