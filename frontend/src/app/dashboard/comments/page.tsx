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
                <h1 className="text-2xl font-bold">Yorum Yönetimi 💬</h1>
                <div className="flex gap-2 bg-white/[0.03] p-1 rounded-xl border border-white/[0.06]">
                    {(['pending', 'approved'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
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
                        <div key={i} className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] animate-pulse">
                            <div className="h-4 w-32 bg-white/10 rounded mb-3" />
                            <div className="h-3 w-full bg-white/5 rounded mb-2" />
                            <div className="h-3 w-2/3 bg-white/5 rounded" />
                        </div>
                    ))}
                </div>
            ) : comments.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16"
                >
                    <span className="text-5xl block mb-4">🎉</span>
                    <p className="text-gray-400 text-lg">
                        {filter === 'pending' ? 'Onay bekleyen yorum yok!' : 'Henüz onaylanmış yorum yok.'}
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
                            className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-colors group"
                        >
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold">
                                            {(comment.user?.display_name || 'A').charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">{comment.user?.display_name || 'Anonim'}</p>
                                            <p className="text-[11px] text-gray-500">
                                                {new Date(comment.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                {' · '}
                                                <span className="text-gray-600">{comment.post_type} #{comment.post_id}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-gray-300 text-sm leading-relaxed">{comment.content}</p>
                                </div>
                                <div className="flex gap-2 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                                    {filter === 'pending' && (
                                        <button
                                            onClick={() => handleApprove(comment.id)}
                                            className="px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-xl text-xs font-bold border border-green-500/20 transition-all"
                                        >
                                            ✓ Onayla
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(comment.id)}
                                        className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-xl text-xs font-bold border border-red-500/20 transition-all"
                                    >
                                        ✕ Sil
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
