"use client";

// Dashboard for administration and system metrics

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

import { SystemStatus } from '@/types';

export default function DashboardPage() {
    const { user, loading, logout, hasRole } = useAuth();
    const [status, setStatus] = useState<SystemStatus | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) router.push('/login');

        if (user && (hasRole('admin') || hasRole('developer'))) {
            api.getSystemStatus().then(setStatus).catch(console.error);
        }
    }, [user, loading, router]);

    if (loading) return <div className="h-screen flex items-center justify-center bg-[#0a0a0f] text-white">Yükleniyor...</div>;
    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white p-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">Hoş Geldin, {user.display_name}</h1>
                        <div className="flex gap-2">
                            {user.roles.map((role: string) => (
                                <span key={role} className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-semibold uppercase tracking-wider">
                                    {role}
                                </span>
                            ))}
                        </div>
                    </div>
                    <button
                        onClick={() => logout()}
                        className="px-6 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl transition-all"
                    >
                        Çıkış Yap
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Developer Metrics */}
                    {status && (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="col-span-1 lg:col-span-2 p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm"
                        >
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                Sistem Durumu (Real-time)
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                                    <p className="text-gray-500 text-xs mb-1 uppercase">CPU</p>
                                    <p className="text-2xl font-mono text-blue-400">{status.cpu}%</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                                    <p className="text-gray-500 text-xs mb-1 uppercase">RAM</p>
                                    <p className="text-2xl font-mono text-purple-400">{status.memory}%</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                                    <p className="text-gray-500 text-xs mb-1 uppercase">DİSK</p>
                                    <p className="text-2xl font-mono text-cyan-400">{status.disk}%</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                                    <p className="text-gray-500 text-xs mb-1 uppercase">UPTIME</p>
                                    <p className="text-lg font-mono text-gray-300">{(status.uptime / 3600).toFixed(1)}h</p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Quick Actions */}
                    <div className="p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm">
                        <h2 className="text-xl font-bold mb-6">Hızlı İşlemler</h2>
                        <div className="space-y-4">
                            <button className="w-full text-left p-4 rounded-2xl bg-blue-600/10 hover:bg-blue-600/20 border border-blue-600/20 transition-all">
                                📝 Yeni İçerik Ekle
                            </button>
                            <button className="w-full text-left p-4 rounded-2xl bg-purple-600/10 hover:bg-purple-600/20 border border-purple-600/20 transition-all">
                                🗳️ Yorumları Yönet
                            </button>
                            <button className="w-full text-left p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                                ⚙️ Genel Ayarlar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
