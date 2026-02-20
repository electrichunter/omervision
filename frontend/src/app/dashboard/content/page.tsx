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
                    <h1 className="text-2xl font-bold text-white mb-2">İçerik Yönetimi</h1>
                    <p className="text-gray-400">Tüm yazılarınızı buradan yönetebilir, yeni içerikler yayınlayabilirsiniz.</p>
                </div>
                <button
                    onClick={() => router.push('/dashboard/content/create')}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20"
                >
                    <Plus size={18} />
                    Yeni İçerik Ekle
                </button>
            </div>

            <div className="grid gap-4">
                {blogs.length === 0 ? (
                    <div className="text-center py-20 bg-white/[0.02] border border-white/5 rounded-3xl">
                        <p className="text-gray-500 mb-4">Henüz hiç içerik oluşturmamışsınız.</p>
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
                            className={`flex flex-col sm:flex-row gap-6 p-5 rounded-2xl border transition-all ${blog.is_published ? 'bg-white/[0.02] border-white/5 hover:border-white/10' : 'bg-orange-500/5 border-orange-500/20 hover:border-orange-500/40'}`}
                        >
                            {/* Image Placeholder / Thumbnail */}
                            <div className="w-full sm:w-48 h-32 rounded-xl bg-[#111] overflow-hidden shrink-0 border border-white/5 relative">
                                {blog.coverImage ? (
                                    <img src={blog.coverImage} className="w-full h-full object-cover" alt={blog.title} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-700 font-mono text-xs">
                                        No Image
                                    </div>
                                )}
                                {!blog.is_published && (
                                    <div className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] uppercase font-bold px-2 py-1 rounded-md">Taslak</div>
                                )}
                            </div>

                            {/* Content Details */}
                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h2 className="text-xl font-bold text-white truncate" title={blog.title}>
                                            {blog.title}
                                        </h2>
                                        {blog.is_published ? (
                                            <span className="flex items-center gap-1 text-[11px] uppercase tracking-wider font-bold bg-green-500/10 text-green-400 px-2.5 py-1 rounded-full shrink-0">
                                                Yayında
                                            </span>
                                        ) : null}
                                    </div>
                                    <p className="text-gray-400 text-sm line-clamp-2 mb-4 leading-relaxed">
                                        {blog.excerpt || "Açıklama veya özet girilmemiş..."}
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                                        <span className="flex items-center gap-1.5"><Calendar size={14} /> {formatDate(blog.date)}</span>
                                        <span className="px-2 py-1 rounded bg-white/5 border border-white/10">{blog.readingTime}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleTogglePublish(blog.id, blog.is_published ?? true)}
                                            className={`p-2 rounded-lg transition-colors shadow-sm flex items-center gap-1 text-sm font-medium ${blog.is_published ? 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20' : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'}`}
                                            title={blog.is_published ? "Yayından Kaldır (Taslağa Çevir)" : "Yayınla"}
                                        >
                                            {blog.is_published ? <><EyeOff size={16} /> Yayından Al</> : <><Eye size={16} /> Yayınla</>}
                                        </button>

                                        <button
                                            onClick={() => router.push(`/dashboard/content/edit/${blog.id}`)}
                                            className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors shadow-sm"
                                            title="Düzenle"
                                        >
                                            <Edit size={16} />
                                        </button>

                                        <button
                                            onClick={() => handleDelete(blog.id, blog.title)}
                                            className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors shadow-sm"
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
