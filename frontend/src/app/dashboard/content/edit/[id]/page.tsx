"use client";

import RichTextEditor from '@/components/RichTextEditor';
import { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Image as ImageIcon, Settings } from 'lucide-react';

export default function EditContentPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;

    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [coverImage, setCoverImage] = useState('');
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isPublished, setIsPublished] = useState(true);

    const titleInputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const fetchBlog = async () => {
            if (!id) return;
            try {
                const blog = await api.getBlogById(id);
                setTitle(blog.title || '');
                setSlug(blog.slug || '');
                setContent(blog.content || '');
                setTags(Array.isArray(blog.tags) ? blog.tags.join(', ') : (blog.tags || ''));
                setExcerpt(blog.excerpt || '');
                setCoverImage(blog.coverImage || '');
                setIsPublished(blog.is_published ?? true);
            } catch (err) {
                console.error(err);
                alert('Blog bulunamadı veya yüklenemedi.');
                router.push('/dashboard/content');
            } finally {
                setLoading(false);
            }
        };
        fetchBlog();
    }, [id, router]);

    const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const res = await api.uploadFile(file);
            setCoverImage(res.url);
        } catch (err) {
            alert('Kapak resmi yüklenemedi');
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!title || !content) {
            alert('Başlık ve içerik zorunludur');
            return;
        }
        setSaving(true);
        try {
            await api.updateBlog(id, {
                title,
                slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                content,
                tags,
                excerpt,
                image: coverImage,
                featured: false,
                is_published: isPublished
            });
            alert('İçerik başarıyla güncellendi!');
            router.push('/dashboard/content');
        } catch (err) {
            console.error(err);
            alert('İçerik güncellenirken hata oluştu');
        } finally {
            setSaving(false);
        }
    };

    // Auto resize title text area to feel like Medium
    useEffect(() => {
        if (titleInputRef.current) {
            titleInputRef.current.style.height = 'auto';
            titleInputRef.current.style.height = titleInputRef.current.scrollHeight + 'px';
        }
    }, [title]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[500px]">
                <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen text-gray-200" style={{ background: '#0A0A0B' }}>
            <header className="sticky top-0 z-50 py-4 px-6 flex items-center justify-between border-b border-white/5 backdrop-blur-xl bg-[#0A0A0B]/80">
                <button
                    onClick={() => router.push('/dashboard/content')}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={16} /> İçeriklere Dön
                </button>
                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm text-gray-300 font-medium">
                        <input
                            type="checkbox"
                            checked={isPublished}
                            onChange={(e) => setIsPublished(e.target.checked)}
                            className="bg-transparent border-white/20 rounded accent-blue-600 w-4 h-4 cursor-pointer"
                        />
                        Aktif Yayın
                    </label>
                    <button
                        onClick={handleSubmit}
                        disabled={saving || !title || !content || content === '<p></p>'}
                        className="px-5 py-2 bg-blue-600 hover:bg-blue-500 rounded-full font-medium transition-all disabled:opacity-50 text-white text-sm flex items-center gap-2 shadow-lg shadow-blue-500/20"
                    >
                        {saving ? '⏳ Güncelleniyor...' : 'Güncelle'}
                    </button>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-12 md:py-20 lg:max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    <div className="relative">
                        <textarea
                            ref={titleInputRef}
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value);
                            }}
                            className="w-full bg-transparent text-4xl md:text-5xl lg:text-6xl font-black text-white placeholder-gray-600 outline-none resize-none overflow-hidden leading-tight"
                            placeholder="Başlık..."
                            rows={1}
                        />
                    </div>

                    <div className="group relative pt-2 pb-6">
                        {coverImage ? (
                            <div className="relative mb-8 group">
                                <img src={coverImage} alt="Kapak" className="w-full h-auto max-h-[500px] object-cover rounded-2xl border border-white/5 shadow-2xl" />
                                <button
                                    onClick={() => setCoverImage('')}
                                    className="absolute top-4 right-4 bg-red-500/90 text-white px-4 py-2 rounded-xl text-sm font-medium opacity-0 group-hover:opacity-100 transition-all backdrop-blur transform hover:scale-105"
                                >
                                    Kaldır
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <label className="inline-flex items-center gap-2 text-gray-400 hover:text-white cursor-pointer transition-colors px-4 py-2.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] text-sm font-medium">
                                    <ImageIcon size={18} />
                                    <span>Kapak Resmi Ekle</span>
                                    <input type="file" accept="image/*" onChange={handleCoverImageUpload} className="hidden" />
                                </label>
                                {uploading && <span className="text-sm text-blue-400 animate-pulse font-medium">Yükleniyor...</span>}
                            </div>
                        )}
                    </div>

                    <div className="prose-container -mx-4 md:mx-0 min-h-[400px]">
                        <RichTextEditor
                            value={content}
                            onChange={setContent}
                            placeholder="Hikayeni anlatmaya başla..."
                        />
                    </div>

                    <div className="mt-32 pt-10 border-t border-white/10 space-y-8 bg-white/[0.01] p-8 rounded-3xl border border-white/5">
                        <h3 className="text-xl font-bold flex items-center gap-3 text-white">
                            <Settings size={22} className="text-blue-400" /> Yayın Ayarları
                        </h3>

                        <div className="grid gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-3">Kısa Açıklama (Özet)</label>
                                <textarea
                                    value={excerpt}
                                    onChange={(e) => setExcerpt(e.target.value)}
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-white placeholder-gray-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all resize-none h-28"
                                    placeholder="Yazının kısa bir özeti..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-300 mb-3">Özel URL (Slug)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">/blog/</span>
                                        <input
                                            type="text"
                                            value={slug}
                                            onChange={(e) => setSlug(e.target.value)}
                                            className="w-full bg-white/5 border border-white/5 rounded-2xl pl-14 pr-5 py-4 text-white placeholder-gray-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all font-mono text-sm"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-300 mb-3">Etiketler</label>
                                    <input
                                        type="text"
                                        value={tags}
                                        onChange={(e) => setTags(e.target.value)}
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-white placeholder-gray-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all"
                                        placeholder="Teknoloji, Kodlama (virgülle ayırın)"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
