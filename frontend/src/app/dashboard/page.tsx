"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { SystemStatus } from '@/types';
import { Activity, Cpu, HardDrive, Clock, Edit3, MessageSquare, Settings, Zap } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';

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
    }, [user, hasRole]);

    if (!user) return null;

    const quickActions = [
        {
            icon: <Edit3 size={24} />,
            label: 'Yeni İçerik Ekle',
            desc: 'Blog yazısı veya proje oluştur',
            href: '/dashboard/content',
            color: 'var(--color-accent-orange)'
        },
        {
            icon: <MessageSquare size={24} />,
            label: 'Yorumları Yönet',
            desc: 'Onay bekleyen yorumları incele',
            href: '/dashboard/comments',
            color: 'var(--color-accent-purple)'
        },
        {
            icon: <Settings size={24} />,
            label: 'Genel Ayarlar',
            desc: 'Sistem ve bakım modu ayarları',
            href: '/dashboard/settings',
            color: 'var(--color-accent-blue)'
        },
    ];

    return (
        <div className="space-y-12 bg-[var(--color-bg-primary)] min-h-full pb-20">
            {/* Welcome Banner */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative p-10 md:p-14 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] overflow-hidden shadow-sm"
            >

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                    <div className="w-24 h-24 rounded-lg bg-[var(--color-accent-blue)]/10 flex items-center justify-center text-[var(--color-accent-blue)] border border-[var(--color-accent-blue)]/20 shadow-sm">
                        <Zap size={44} />
                    </div>

                    <div className="text-center md:text-left">
                        <h1 className="text-4xl lg:text-5xl font-black text-[var(--color-text-primary)] tracking-tight leading-[1.1] mb-4">
                            Giriş Onaylandı, <br />
                            <span className="text-[var(--color-accent-blue)] uppercase">{user.display_name}</span>
                        </h1>
                        <div className="flex flex-wrap justify-center md:justify-start gap-3">
                            {user.roles?.map((role: string) => (
                                <span key={role} className="px-5 py-2 bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] rounded-md text-[9px] font-black uppercase tracking-[0.3em] border border-[var(--color-border)] shadow-sm">
                                    AUTH_LEVEL: {role}
                                </span>
                            ))}
                            <span className="px-5 py-2 bg-[#00D47B]/10 text-[#00D47B] rounded-md text-[9px] font-black uppercase tracking-[0.3em] border border-[#00D47B]/20">
                                SESSION_SECURE
                            </span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Metrics Section */}
            {(hasRole('admin') || hasRole('developer')) && (
                <div className="space-y-6">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--color-text-muted)] ml-2 opacity-60">Sistem Telemetrisi</h2>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="grid grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        <MetricCard
                            icon={<Cpu size={24} />} label="İşlemci"
                            value={status ? `${status.cpu}%` : '...'}
                            color="var(--color-text-primary)"
                            loading={!status && !statusError}
                        />
                        <MetricCard
                            icon={<Zap size={24} />} label="Bellek"
                            value={status ? `${status.memory}%` : '...'}
                            color="var(--color-text-primary)"
                            loading={!status && !statusError}
                        />
                        <MetricCard
                            icon={<HardDrive size={24} />} label="Depolama"
                            value={status ? `${status.disk}%` : '...'}
                            color="var(--color-text-primary)"
                            loading={!status && !statusError}
                        />
                        <MetricCard
                            icon={<Clock size={24} />} label="Uptime"
                            value={status ? `${(status.uptime / 3600).toFixed(1)}h` : '...'}
                            color="var(--color-text-primary)"
                            loading={!status && !statusError}
                        />
                    </motion.div>
                </div>
            )}

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-8"
            >
                <div className="flex items-center gap-6 px-2">
                    <h2 className="text-2xl font-black text-[var(--color-text-primary)] tracking-tighter uppercase font-heading">Hızlı Komutlar</h2>
                    <div className="h-px flex-1 bg-gradient-to-r from-[var(--color-border)] to-transparent" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {quickActions.map((action) => (
                        <button
                            key={action.href}
                            onClick={() => router.push(action.href)}
                            style={{ '--hover-color': 'var(--color-accent-blue)' } as any}
                            className="text-left p-10 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:border-[var(--hover-color)] transition-colors group relative overflow-hidden shadow-sm"
                        >
                            <div
                                className="w-16 h-16 rounded-md flex items-center justify-center mb-8 border border-[var(--color-border)] shadow-sm bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] group-hover:text-[var(--hover-color)] transition-colors"
                            >
                                {action.icon}
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-[var(--color-text-primary)] mb-3 tracking-tighter font-heading uppercase">{action.label}</h3>
                                <p className="text-sm text-[var(--color-text-secondary)] font-medium leading-relaxed opacity-70 tracking-tight">{action.desc}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}

function MetricCard({ icon, label, value, color, loading }: { icon: React.ReactNode, label: string, value: string, color: string, loading: boolean }) {
    return (
        <div
            className="p-8 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] shadow-sm transition-colors hover:border-[var(--color-accent-blue)]/50 group overflow-hidden relative"
            style={{ '--accent-color': 'var(--color-accent-blue)' } as any}
        >
            <div className="flex items-center justify-between mb-6">
                <div
                    className="w-12 h-12 rounded-md flex items-center justify-center border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] group-hover:text-[var(--accent-color)] transition-colors"
                >
                    {icon}
                </div>
                <p className="text-[9px] uppercase tracking-[0.4em] font-black text-[var(--color-text-muted)] opacity-50">{label}</p>
            </div>

            {loading ? (
                <Skeleton className="h-12 w-3/4" />
            ) : (
                <div className="flex items-end gap-2">
                    <p
                        className="text-5xl font-black tracking-tight"
                        style={{ color: 'var(--color-text-primary)' }}
                    >
                        {value}
                    </p>
                </div>
            )}

            <div className="mt-4 h-1 w-full bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: loading ? 0 : "100%" }}
                    transition={{ duration: 1.5, ease: "circOut" }}
                    className="h-full bg-[var(--color-text-secondary)] opacity-30 group-hover:bg-[var(--accent-color)] transition-colors"
                />
            </div>
        </div>
    );
}
