"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { SystemStatus } from '@/types';

export default function DashboardPage() {
    const { user, hasRole } = useAuth();
    const [status, setStatus] = useState<SystemStatus | null>(null);
    const [statusError, setStatusError] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (user && (hasRole('admin') || hasRole('developer'))) {
            api.getSystemStatus()
                .then(setStatus)
                .catch(() => setStatusError(true));
        }
    }, [user]);

    // Layout already handles auth redirects, so we just guard rendering
    if (!user) return null;

    const quickActions = [
        { icon: '📝', label: 'Yeni İçerik Ekle', desc: 'Blog yazısı veya proje oluştur', href: '/dashboard/content', gradient: 'from-blue-600/20 to-blue-800/10', border: 'border-blue-500/20', hoverBg: 'hover:border-blue-500/30' },
        { icon: '💬', label: 'Yorumları Yönet', desc: 'Onay bekleyen yorumları incele', href: '/dashboard/comments', gradient: 'from-purple-600/20 to-purple-800/10', border: 'border-purple-500/20', hoverBg: 'hover:border-purple-500/30' },
        { icon: '⚙️', label: 'Genel Ayarlar', desc: 'Sistem ve bakım modu ayarları', href: '/dashboard/settings', gradient: 'from-gray-600/20 to-gray-800/10', border: 'border-gray-500/20', hoverBg: 'hover:border-gray-500/30' },
    ];

    return (
        <div className="space-y-8">
            {/* Welcome Banner */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative p-8 rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 overflow-hidden shadow-2xl shadow-blue-900/30"
            >
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-3xl">👋</span>
                        <h1 className="text-2xl lg:text-3xl font-bold">Hoş Geldin, {user.display_name}</h1>
                    </div>
                    <p className="text-blue-100/70 mt-2">Sistem yönetim paneline hoş geldin. Bugün ne yapmak istersin?</p>
                    <div className="flex gap-2 mt-4">
                        {user.roles?.map((role: string) => (
                            <span key={role} className="px-3 py-1 bg-white/10 text-white/90 rounded-full text-xs font-semibold uppercase tracking-wide backdrop-blur-sm border border-white/10">
                                {role}
                            </span>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Metrics Grid */}
            {(hasRole('admin') || hasRole('developer')) && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 lg:grid-cols-4 gap-4"
                >
                    <MetricCard
                        icon="🔧" label="CPU"
                        value={status ? `${status.cpu}%` : '...'}
                        color="blue"
                        loading={!status && !statusError}
                    />
                    <MetricCard
                        icon="🧠" label="RAM"
                        value={status ? `${status.memory}%` : '...'}
                        color="purple"
                        loading={!status && !statusError}
                    />
                    <MetricCard
                        icon="💾" label="Disk"
                        value={status ? `${status.disk}%` : '...'}
                        color="cyan"
                        loading={!status && !statusError}
                    />
                    <MetricCard
                        icon="⏱️" label="Uptime"
                        value={status ? `${(status.uptime / 3600).toFixed(1)}h` : '...'}
                        color="green"
                        loading={!status && !statusError}
                    />
                </motion.div>
            )}

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <h2 className="text-lg font-bold mb-4 text-gray-300">Hızlı İşlemler</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {quickActions.map((action) => (
                        <button
                            key={action.href}
                            onClick={() => router.push(action.href)}
                            className={`text-left p-6 rounded-2xl bg-gradient-to-br ${action.gradient} border ${action.border} ${action.hoverBg} transition-all duration-300 group hover:shadow-lg`}
                        >
                            <span className="text-3xl block mb-3 group-hover:scale-110 transition-transform duration-200">{action.icon}</span>
                            <h3 className="font-bold text-white mb-1">{action.label}</h3>
                            <p className="text-sm text-gray-400">{action.desc}</p>
                        </button>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}

function MetricCard({ icon, label, value, color, loading }: { icon: string, label: string, value: string, color: string, loading: boolean }) {
    const colorMap: Record<string, string> = {
        blue: 'text-blue-400 border-blue-500/10 shadow-blue-500/5',
        purple: 'text-purple-400 border-purple-500/10 shadow-purple-500/5',
        cyan: 'text-cyan-400 border-cyan-500/10 shadow-cyan-500/5',
        green: 'text-green-400 border-green-500/10 shadow-green-500/5',
    };

    return (
        <div className={`p-5 rounded-2xl bg-white/[0.03] border ${colorMap[color]} shadow-lg transition-all hover:bg-white/[0.05] group`}>
            <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{icon}</span>
                <p className="text-[11px] text-gray-500 uppercase tracking-widest font-bold">{label}</p>
            </div>
            {loading ? (
                <div className="h-8 w-20 bg-white/5 rounded-lg animate-pulse" />
            ) : (
                <p className={`text-2xl font-mono font-bold ${colorMap[color].split(' ')[0]}`}>{value}</p>
            )}
        </div>
    );
}
