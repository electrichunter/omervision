"use client";

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';

export default function CommentsPage() {
    const [comments, setComments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'pending' | 'approved' | undefined>('pending');

    const fetchComments = async () => {
        setLoading(true);
        try {
            const res = await api.getAdminComments(filter);
            setComments(res);
        } catch (e) {
            console.error('Failed to load comments', e);
            setComments([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [filter]);

    const handleApprove = async (id: number) => {
        try {
            await api.approveComment(id);
            setComments(prev => prev.filter(c => c.id !== id));
        } catch (e) {
            alert('Onaylama başarısız oldu');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Bu yorumu silmek istediğinize emin misiniz?')) return;
        try {
            await api.deleteComment(id);
            setComments(prev => prev.filter(c => c.id !== id));
        } catch (e) {
            alert('Silme başarısız oldu');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Yorum Yönetimi 💬</h1>
                <div className="flex gap-1 bg-[var(--color-bg-secondary)] p-1 rounded-lg border border-[var(--color-border)] shadow-sm">
                    {(['pending', 'approved'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-5 py-2 rounded-md text-[10px] font-black uppercase tracking-widest transition-colors ${filter === f
                                ? 'bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] border border-[var(--color-border)] shadow-sm'
                                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] border border-transparent'
                                }`}
                        >
                            {f === 'pending' ? 'Bekleyenler' : 'Onaylananlar'}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="p-8 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] shadow-sm animate-pulse">
                            <div className="h-4 w-32 bg-[var(--color-bg-tertiary)] rounded mb-4" />
                            <div className="h-3 w-full bg-[var(--color-bg-tertiary)] opacity-50 rounded mb-2" />
                            <div className="h-3 w-2/3 bg-[var(--color-bg-tertiary)] opacity-20 rounded" />
                        </div>
                    ))}
                </div>
            ) : comments.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-24 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg shadow-sm"
                >
                    <p className="text-[var(--color-text-muted)] font-bold uppercase tracking-widest text-xs opacity-60">
                        {filter === 'pending' ? 'Bütün yorumlar onaylanmış.' : 'Henüz onaylanmış yorum yok.'}
                    </p>
                </motion.div>
            ) : (
                <div className="space-y-3">
                    {comments.map((comment, i) => (
                        <motion.div
                            key={comment.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="p-6 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:border-[var(--color-accent-blue)]/30 transition-colors group shadow-sm"
                        >
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-md bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] flex items-center justify-center text-xs font-bold text-[var(--color-text-primary)]">
                                            {(comment.user?.display_name || 'A').charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-[var(--color-text-primary)]">{comment.user?.display_name || 'Anonim'}</p>
                                            <p className="text-[11px] text-[var(--color-text-muted)] font-medium">
                                                {new Date(comment.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                {' · '}
                                                <span className="text-[var(--color-accent-blue)] opacity-60 font-black uppercase tracking-widest text-[9px]">{comment.post_type} #{comment.post_id}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed mt-2 opacity-90">{comment.content}</p>
                                </div>
                                <div className="flex gap-2 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                                    {filter === 'pending' && (
                                        <button
                                            onClick={() => handleApprove(comment.id)}
                                            className="px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded-md text-xs font-bold border border-transparent hover:border-green-500/20 transition-colors shadow-sm"
                                        >
                                            Onayla
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(comment.id)}
                                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-md text-xs font-bold border border-transparent hover:border-red-500/20 transition-colors shadow-sm"
                                    >
                                        Sil
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
