"use client";

import RichTextEditor from '@/components/RichTextEditor';
import { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Image as ImageIcon, Settings } from 'lucide-react';

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
    const [isPublished, setIsPublished] = useState(true);
    const [audioUrl, setAudioUrl] = useState('');
    const [selectedVoice, setSelectedVoice] = useState('none');

    const titleInputRef = useRef<HTMLTextAreaElement>(null);

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
        let finalAudioUrl = audioUrl;

        try {
            // Background task handles TTS now
            await api.createBlog({
                title,
                slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                content,
                tags,
                excerpt,
                image: coverImage,
                featured: false,
                is_published: isPublished,
                audio_url: audioUrl,
                generate_audio: selectedVoice !== 'none',
                voice: selectedVoice !== 'none' ? selectedVoice : undefined
            });
            alert('İçerik başarıyla oluşturuldu!');
            router.push('/dashboard/content');
        } catch (err: any) {
            console.error(err);
            alert(err.message || 'İçerik oluşturulurken hata oluştu');
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

    return (
        <div className="min-h-screen text-[var(--color-text-primary)] bg-[var(--color-bg-primary)]">
            {/* Top Navigation Bar - Minimalist */}
            <header className="sticky top-0 z-50 py-5 px-8 flex items-center justify-between border-b border-[var(--color-border)] backdrop-blur-3xl bg-[var(--color-bg-primary)]/80">
                <button
                    onClick={() => router.push('/dashboard')}
                    className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                    <ArrowLeft size={16} /> Dashboard'a Dön
                </button>
                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] font-medium">
                        <input
                            type="checkbox"
                            checked={isPublished}
                            onChange={(e) => setIsPublished(e.target.checked)}
                            className="bg-transparent border-[var(--color-border)] rounded accent-[var(--color-accent-blue)] w-4 h-4 cursor-pointer"
                        />
                        Aktif Yayın
                    </label>
                    <button
                        onClick={handleSubmit}
                        disabled={saving || !title || !content || content === '<p></p>'}
                        className="px-5 py-2 bg-[var(--color-accent-blue)] hover:bg-[var(--color-accent-blue)]/90 rounded-md font-medium transition-colors disabled:opacity-50 text-white text-sm flex items-center gap-2 shadow-sm"
                    >
                        {saving ? '⏳ Kaydediliyor...' : 'Kaydet'}
                    </button>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-12 md:py-20 lg:max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    {/* Title Input */}
                    <div className="relative">
                        <textarea
                            ref={titleInputRef}
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value);
                                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                            }}
                            className="w-full bg-transparent text-4xl md:text-5xl lg:text-6xl font-black text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] placeholder-opacity-50 outline-none resize-none overflow-hidden leading-tight"
                            placeholder="Başlık..."
                            rows={1}
                        />
                    </div>

                    {/* Cover Image Minimal Upload */}
                    <div className="group relative pt-2 pb-6">
                        {coverImage ? (
                            <div className="relative mb-8 group">
                                <img src={coverImage} alt="Kapak" className="w-full h-auto max-h-[500px] object-cover rounded-md border border-[var(--color-border)] shadow-sm" />
                                <button
                                    onClick={() => setCoverImage('')}
                                    className="absolute top-4 right-4 bg-red-500/90 text-white px-4 py-2 rounded-md text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur"
                                >
                                    Kaldır
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <label className="inline-flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer transition-colors px-4 py-2.5 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-[var(--color-accent-blue)]/50 text-sm font-medium shadow-sm">
                                    <ImageIcon size={18} />
                                    <span>Kapak Resmi Ekle</span>
                                    <input type="file" accept="image/*" onChange={handleCoverImageUpload} className="hidden" />
                                </label>
                                {uploading && <span className="text-sm text-blue-400 animate-pulse font-medium">Yükleniyor...</span>}
                            </div>
                        )}
                    </div>

                    {/* Tiptap Editor */}
                    <div className="prose-container -mx-4 md:mx-0 min-h-[400px]">
                        <RichTextEditor
                            value={content}
                            onChange={setContent}
                            placeholder="Hikayeni anlatmaya başla..."
                        />
                    </div>

                    {/* Meta Info (Slug, Excerpt, Tags) - Collapsible or Footer style */}
                    <div className="mt-32 pt-10 border-t border-[var(--color-border)] space-y-8 bg-[var(--color-bg-secondary)] p-8 rounded-lg shadow-sm">
                        <h3 className="text-xl font-bold flex items-center gap-3 text-[var(--color-text-primary)]">
                            <Settings size={22} className="text-[var(--color-accent-blue)]" /> Yayın Ayarları
                        </h3>

                        <div className="grid gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-3">Kısa Açıklama (Özet)</label>
                                <textarea
                                    value={excerpt}
                                    onChange={(e) => setExcerpt(e.target.value)}
                                    className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-md px-5 py-4 text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:border-[var(--color-accent-blue)] outline-none transition-colors resize-none h-28"
                                    placeholder="Yazının kısa bir özeti..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-3">Özel URL (Slug)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] text-sm">/blog/</span>
                                        <input
                                            type="text"
                                            value={slug}
                                            onChange={(e) => setSlug(e.target.value)}
                                            className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-md pl-14 pr-5 py-4 text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:border-[var(--color-accent-blue)] outline-none transition-colors font-mono text-sm"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-3">Etiketler</label>
                                    <input
                                        type="text"
                                        value={tags}
                                        onChange={(e) => setTags(e.target.value)}
                                        className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-md px-5 py-4 text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:border-[var(--color-accent-blue)] outline-none transition-colors"
                                        placeholder="Teknoloji, Kodlama (virgülle ayırın)"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-[var(--color-border)] mt-2">
                                <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-3">Yazı Seslendirmesi</label>
                                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                                    <select
                                        value={selectedVoice}
                                        onChange={e => setSelectedVoice(e.target.value)}
                                        className="bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-md px-4 py-2.5 text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent-blue)] text-sm"
                                    >
                                        <option value="none">Ses Oluşturma</option>
                                        <option value="tr-TR-AhmetNeural">Türkçe (Erkek)</option>
                                        <option value="tr-TR-EmelNeural">Türkçe (Kadın)</option>
                                        <option value="en-US-JennyNeural">İngilizce (Kadın)</option>
                                        <option value="en-US-GuyNeural">İngilizce (Erkek)</option>
                                        <option value="de-DE-KatjaNeural">Almanca (Kadın)</option>
                                    </select>
                                    {audioUrl && (
                                        <div className="flex-1 w-full mt-2 md:mt-0">
                                            <audio controls src={audioUrl} className="w-full h-10 rounded-md outline-none" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div >
    );
}
