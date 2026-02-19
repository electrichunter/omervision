"use client";

import { useState } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function CreateContentPage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [coverImage, setCoverImage] = useState('');
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !content) {
            alert('Başlık ve içerik zorunludur');
            return;
        }
        setSaving(true);
        try {
            await api.createBlog({
                title,
                slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                content,
                tags,
                excerpt,
                image: coverImage,
                featured: false
            });
            alert('İçerik başarıyla oluşturuldu!');
            router.push('/dashboard');
        } catch (err) {
            console.error(err);
            alert('İçerik oluşturulurken hata oluştu');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Yeni İçerik Ekle 📝</h1>
                <button
                    onClick={() => router.push('/dashboard')}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                    ← Geri Dön
                </button>
            </div>

            <motion.form
                onSubmit={handleSubmit}
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {/* Title & Slug Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Başlık *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value);
                                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                            }}
                            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all"
                            placeholder="Harika Blog Başlığı"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Slug (URL)</label>
                        <input
                            type="text"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all font-mono text-sm"
                            placeholder="harika-blog-basligi"
                        />
                    </div>
                </div>

                {/* Cover Image */}
                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                    <label className="block text-sm font-medium text-gray-400 mb-3">Kapak Resmi</label>
                    <div className="flex items-center gap-4">
                        <label className="cursor-pointer px-5 py-2.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-xl text-sm font-semibold border border-blue-500/20 transition-all">
                            {uploading ? 'Yükleniyor...' : '📷 Resim Seç'}
                            <input type="file" accept="image/*" onChange={handleCoverImageUpload} className="hidden" />
                        </label>
                        {coverImage && <span className="text-xs text-green-400">✓ Yüklendi</span>}
                    </div>
                    {coverImage && (
                        <div className="mt-4 relative group">
                            <img src={coverImage} alt="Kapak" className="h-48 w-full object-cover rounded-xl border border-white/10" />
                            <button
                                type="button"
                                onClick={() => setCoverImage('')}
                                className="absolute top-2 right-2 w-8 h-8 bg-red-600/80 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-sm"
                            >
                                ✕
                            </button>
                        </div>
                    )}
                </div>

                {/* Content - Rich Text Area */}
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">İçerik * (HTML destekler)</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all min-h-[400px] font-mono text-sm leading-relaxed resize-y"
                        placeholder="<h2>Başlık</h2>&#10;<p>İçerik buraya yazılır...</p>"
                        required
                    />
                </div>

                {/* Excerpt */}
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Özet</label>
                    <textarea
                        value={excerpt}
                        onChange={(e) => setExcerpt(e.target.value)}
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all h-24 resize-none"
                        placeholder="İçeriğin kısa açıklaması..."
                    />
                </div>

                {/* Tags */}
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Etiketler</label>
                    <input
                        type="text"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all"
                        placeholder="Teknoloji, Kodlama, Next.js (virgülle ayırın)"
                    />
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-bold transition-all disabled:opacity-50 text-white shadow-xl shadow-blue-600/20 text-lg"
                >
                    {saving ? '⏳ Kaydediliyor...' : '🚀 Yayınla'}
                </button>
            </motion.form>
        </div>
    );
}
