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
                className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]"
            >
                <div className="flex items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 transition-colors ${maintenance
                                ? 'bg-red-500/20 shadow-lg shadow-red-500/10'
                                : 'bg-green-500/20 shadow-lg shadow-green-500/10'
                            }`}>
                            {maintenance ? '🛑' : '🟢'}
                        </div>
                        <div>
                            <h2 className="font-bold text-lg">Bakım Modu</h2>
                            <p className="text-sm text-gray-400 mt-1 leading-relaxed">
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
                        className={`px-6 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50 shrink-0 ${maintenance
                                ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-600/20'
                                : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20'
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
                className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]"
            >
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 flex items-center justify-center text-2xl shrink-0">
                        🔍
                    </div>
                    <div>
                        <h2 className="font-bold text-lg">SEO & Metadata</h2>
                        <p className="text-sm text-gray-400 mt-1">Site başlığı, açıklaması ve arama motoru optimizasyon ayarları.</p>
                        <span className="inline-block mt-3 px-3 py-1 bg-yellow-500/10 text-yellow-400 rounded-full text-xs font-semibold border border-yellow-500/20">
                            Yakında
                        </span>
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]"
            >
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-2xl shrink-0">
                        🔑
                    </div>
                    <div>
                        <h2 className="font-bold text-lg">Güvenlik Ayarları</h2>
                        <p className="text-sm text-gray-400 mt-1">MFA, şifre politikaları ve oturum yönetimi ayarları.</p>
                        <span className="inline-block mt-3 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs font-semibold border border-blue-500/20">
                            Yakında
                        </span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
