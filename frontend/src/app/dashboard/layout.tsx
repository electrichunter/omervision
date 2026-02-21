"use client";

import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, loading, logout, hasRole } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.replace('/login');
        } else if (!loading && user && !hasRole('admin')) {
            // Non-admin users cannot access dashboard
            router.replace('/');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#07070d]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                    <p className="text-gray-500 text-sm animate-pulse">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (!user || !hasRole('admin')) return null;

    const navItems = [
        { name: 'Genel Bakış', href: '/dashboard', icon: '📊' },
        { name: 'İçerik Yönetimi', href: '/dashboard/content', icon: '📝' },
        { name: 'Profil & Beceriler', href: '/dashboard/profile', icon: '👤' },
        { name: 'Projeler (PaaS)', href: '/dashboard/paas', icon: '🚀' },
        { name: 'Yorumlar', href: '/dashboard/comments', icon: '💬' },
        { name: 'Ayarlar', href: '/dashboard/settings', icon: '⚙️' },
    ];

    return (
        <div className="min-h-screen bg-[#07070d] text-gray-100 flex">
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden fixed top-5 right-5 z-50 p-3 bg-white/10 rounded-xl backdrop-blur-xl border border-white/10 shadow-xl"
            >
                <span className="text-xl">{isMobileMenuOpen ? '✕' : '☰'}</span>
            </button>

            {/* Sidebar */}
            <aside className={`
                fixed lg:sticky top-0 left-0 h-screen w-[280px] bg-[#0c0c14]/95 backdrop-blur-xl border-r border-white/[0.06] flex flex-col z-40 transition-transform duration-300
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Logo */}
                <div className="p-6 pb-2">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-11 h-11 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-shadow">
                            O
                        </div>
                        <div>
                            <span className="text-lg font-bold tracking-tight">OmerVision</span>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Admin Panel</p>
                        </div>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-1">
                    <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold px-3 mb-3">Menü</p>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`
                                    relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                                    ${isActive
                                        ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/10 text-white border border-blue-500/20 shadow-lg shadow-blue-500/10'
                                        : 'text-gray-500 hover:bg-white/[0.04] hover:text-gray-200'
                                    }
                                `}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebar-active"
                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-blue-500 rounded-r-full shadow-[0_0_12px_rgba(59,130,246,0.5)]"
                                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                    />
                                )}
                                <span className="text-lg">{item.icon}</span>
                                <span className="font-medium text-sm">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User Info + Logout */}
                <div className="p-4 border-t border-white/[0.06]">
                    <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-xl bg-white/[0.03]">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-sm font-bold shadow-md">
                            {user.display_name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{user.display_name}</p>
                            <p className="text-[11px] text-gray-500 truncate capitalize">{user.roles?.[0] || 'user'}</p>
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400/80 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all duration-200 text-sm"
                    >
                        <span>🚪</span>
                        <span className="font-medium">Çıkış Yap</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-h-screen overflow-y-auto">
                <div className="max-w-6xl mx-auto p-6 lg:p-10">
                    {children}
                </div>
            </main>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </div>
    );
}
