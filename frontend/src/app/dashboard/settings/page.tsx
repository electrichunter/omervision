"use client";

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';

export default function SettingsPage() {
    const [maintenance, setMaintenance] = useState(false);
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState(false);

    useEffect(() => {
        api.getSystemStatus()
            .then(status => {
                setMaintenance(status.maintenance_mode || false);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleToggle = async () => {
        setToggling(true);
        try {
            await api.toggleMaintenance(!maintenance);
            setMaintenance(!maintenance);
        } catch (e) {
            alert('İşlem başarısız oldu');
        } finally {
            setToggling(false);
        }
    };

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold">Genel Ayarlar ⚙️</h1>

            {/* Maintenance Mode */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] shadow-sm"
            >
                <div className="flex items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-md flex items-center justify-center text-2xl shrink-0 transition-colors border ${maintenance
                            ? 'bg-red-500/10 border-red-500/20 text-red-500'
                            : 'bg-green-500/10 border-green-500/20 text-green-500'
                            }`}>
                            {maintenance ? '🛑' : '🟢'}
                        </div>
                        <div>
                            <h2 className="font-bold text-lg">Bakım Modu</h2>
                            <p className="text-sm text-[var(--color-text-muted)] mt-1 leading-relaxed">
                                Bakım modu açıldığında ziyaretçiler siteye erişemez. Sadece admin kullanıcılar giriş yapabilir.
                            </p>
                            <div className="mt-3 flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${maintenance ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                                <span className={`text-xs font-semibold ${maintenance ? 'text-red-400' : 'text-green-400'}`}>
                                    {loading ? 'Durum kontrol ediliyor...' : maintenance ? 'Bakım Modu Aktif' : 'Sistem Yayında'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleToggle}
                        disabled={loading || toggling}
                        className={`px-6 py-3 rounded-md font-bold text-sm transition-colors disabled:opacity-50 shrink-0 shadow-sm ${maintenance
                            ? 'bg-green-600 hover:bg-green-500 text-white'
                            : 'bg-red-600 hover:bg-red-500 text-white'
                            }`}
                    >
                        {toggling ? '...' : maintenance ? 'Yayına Al' : 'Bakıma Al'}
                    </button>
                </div>
            </motion.div>

            {/* Placeholder Sections */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-8 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] shadow-sm"
            >
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-md bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] flex items-center justify-center text-2xl shrink-0">
                        🔍
                    </div>
                    <div>
                        <h2 className="font-bold text-lg">SEO & Metadata</h2>
                        <p className="text-sm text-[var(--color-text-muted)] mt-1">Site başlığı, açıklaması ve arama motoru optimizasyon ayarları.</p>
                        <span className="inline-block mt-3 px-3 py-1 bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)] rounded-md text-[10px] uppercase font-black tracking-widest border border-[var(--color-border)]">
                            Yakında
                        </span>
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-8 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] shadow-sm"
            >
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-md bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] flex items-center justify-center text-2xl shrink-0">
                        🔑
                    </div>
                    <div>
                        <h2 className="font-bold text-lg">Güvenlik Ayarları</h2>
                        <p className="text-sm text-[var(--color-text-muted)] mt-1">MFA, şifre politikaları ve oturum yönetimi ayarları.</p>
                        <span className="inline-block mt-3 px-3 py-1 bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)] rounded-md text-[10px] uppercase font-black tracking-widest border border-[var(--color-border)]">
                            Yakında
                        </span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
