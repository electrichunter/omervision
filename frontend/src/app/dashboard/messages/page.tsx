"use client";

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, User, Clock, CheckCircle2, Trash2, MessageSquare, ExternalLink } from 'lucide-react';

export default function MessagesPage() {
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const res = await api.getContactMessages();
            setMessages(res);
        } catch (e) {
            console.error('Failed to load messages', e);
            setMessages([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const handleMarkAsRead = async (id: number) => {
        try {
            await api.markMessageAsRead(id);
            setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: true } : m));
        } catch (e) {
            alert('İşlem başarısız oldu');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Bu mesajı silmek istediğinize emin misiniz?')) return;
        try {
            await api.deleteContactMessage(id);
            setMessages(prev => prev.filter(m => m.id !== id));
        } catch (e) {
            alert('Silme başarısız oldu');
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-[var(--color-text-primary)] tracking-tight">Gelen Mesajlar ✉️</h1>
                    <p className="text-[var(--color-text-muted)] text-sm font-medium mt-1">İletişim formu üzerinden gelen talepler</p>
                </div>
                <div className="bg-[var(--color-accent-blue)]/10 px-4 py-2 rounded-2xl border border-[var(--color-accent-blue)]/20">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-accent-blue)]">
                        Toplam: {messages.length} Mesaj
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="p-8 rounded-3xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] shadow-sm animate-pulse">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-[var(--color-bg-tertiary)] rounded-2xl" />
                                <div className="space-y-2">
                                    <div className="h-4 w-32 bg-[var(--color-bg-tertiary)] rounded-lg" />
                                    <div className="h-3 w-48 bg-[var(--color-bg-tertiary)] opacity-50 rounded-lg" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-3 w-full bg-[var(--color-bg-tertiary)] opacity-30 rounded-lg" />
                                <div className="h-3 w-4/5 bg-[var(--color-bg-tertiary)] opacity-20 rounded-lg" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : messages.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-32 bg-[var(--color-bg-secondary)] border-2 border-dashed border-[var(--color-border)] rounded-[40px] shadow-sm"
                >
                    <div className="w-20 h-20 bg-[var(--color-bg-tertiary)] rounded-[30px] flex items-center justify-center mx-auto mb-6 text-[var(--color-text-muted)]">
                        <MessageSquare size={32} />
                    </div>
                    <h3 className="text-xl font-black text-[var(--color-text-primary)]">Mesaj Kutusu Boş</h3>
                    <p className="text-[var(--color-text-muted)] font-bold uppercase tracking-widest text-[10px] mt-2 opacity-60">
                        Henüz kimse sizinle iletişime geçmedi.
                    </p>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AnimatePresence mode="popLayout">
                        {messages.map((msg, i) => (
                            <motion.div
                                key={msg.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8, x: -20 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 400,
                                    damping: 30,
                                    delay: i * 0.05
                                }}
                                className={`
                                    relative p-8 rounded-[32px] bg-[var(--color-bg-secondary)] border-2 transition-all duration-500 group shadow-lg overflow-hidden
                                    ${msg.is_read
                                        ? 'border-[var(--color-border)] opacity-80'
                                        : 'border-[var(--color-accent-blue)]/20 shadow-[var(--color-accent-blue)]/5 hover:border-[var(--color-accent-blue)]'
                                    }
                                `}
                            >
                                {!msg.is_read && (
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-accent-blue)]/5 blur-3xl -z-1" />
                                )}

                                <div className="flex justify-between items-start gap-4 mb-6 relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className={`
                                            w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner transition-colors duration-500
                                            ${msg.is_read
                                                ? 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]'
                                                : 'bg-[var(--color-accent-blue)] text-white shadow-[0_8px_20px_rgba(0,190,255,0.3)]'
                                            }
                                        `}>
                                            {(msg.name || 'U').charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-black text-lg text-[var(--color-text-primary)] tracking-tight leading-none mb-1">
                                                {msg.name}
                                            </h3>
                                            <div className="flex items-center gap-2 text-[var(--color-text-muted)] font-bold text-[10px] uppercase tracking-widest">
                                                <Mail size={10} />
                                                {msg.email}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        {!msg.is_read && (
                                            <span className="bg-[#00D47B] text-white text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full shadow-lg shadow-[#00D47B]/20">
                                                Yeni
                                            </span>
                                        )}
                                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-[var(--color-text-muted)] opacity-60">
                                            <Clock size={10} />
                                            {new Date(msg.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                                        </div>
                                    </div>
                                </div>

                                <div className="relative p-5 rounded-2xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] mb-6 min-h-[100px] group-hover:bg-[var(--color-bg-secondary)] transition-colors duration-500">
                                    <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed font-medium">
                                        {msg.message}
                                    </p>
                                </div>

                                <div className="flex gap-3 relative z-10">
                                    {!msg.is_read && (
                                        <button
                                            onClick={() => handleMarkAsRead(msg.id)}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-500/10 hover:bg-blue-500 text-blue-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-500/20 transition-all duration-300 transform active:scale-95"
                                        >
                                            <CheckCircle2 size={14} />
                                            Okundu İşaretle
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(msg.id)}
                                        className={`
                                            flex items-center justify-center gap-2 py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-500/20 transition-all duration-300 transform active:scale-95
                                            ${msg.is_read ? 'flex-1' : 'px-4'}
                                        `}
                                    >
                                        <Trash2 size={14} />
                                        {msg.is_read && "Sil"}
                                    </button>
                                    <a
                                        href={`mailto:${msg.email}`}
                                        className="px-4 flex items-center justify-center py-3 bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-text-primary)] text-[var(--color-text-primary)] hover:text-[var(--color-bg-primary)] rounded-xl border border-[var(--color-border)] transition-all duration-300"
                                    >
                                        <ExternalLink size={14} />
                                    </a>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
