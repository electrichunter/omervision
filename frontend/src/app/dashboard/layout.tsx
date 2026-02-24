"use client";

import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '@/components/ThemeToggle';
import {
    LayoutDashboard,
    FileText,
    User,
    Rocket,
    MessageCircle,
    MessageSquare,
    Shield,
    Settings,
    Menu,
    X,
    LogOut
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, loading, logout, hasRole } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.replace('/login');
        } else if (!loading && user && !hasRole('admin')) {
            router.replace('/');
        }
    }, [user, loading, router, hasRole]);

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-[var(--color-bg-primary)]">
                <div className="flex flex-col items-center gap-6">
                    <div className="w-16 h-16 border-[6px] border-[var(--color-accent-blue)]/20 border-t-[var(--color-accent-blue)] rounded-full animate-spin" />
                    <p className="text-[var(--color-text-primary)] font-black uppercase tracking-[0.3em] text-xs animate-pulse">Sistem Yükleniyor</p>
                </div>
            </div>
        );
    }

    if (!user || !hasRole('admin')) return null;

    const navItems = [
        { name: 'Genel Bakış', href: '/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'İçerik Yönetimi', href: '/dashboard/content', icon: <FileText size={20} /> },
        { name: 'Profil & Beceriler', href: '/dashboard/profile', icon: <User size={20} /> },
        { name: 'Projeler (PaaS)', href: '/dashboard/paas', icon: <Rocket size={20} /> },
        { name: 'Yorumlar', href: '/dashboard/comments', icon: <MessageCircle size={20} /> },
        { name: 'Mesajlar', href: '/dashboard/messages', icon: <MessageSquare size={20} /> },
        { name: 'Güvenlik', href: '/dashboard/security', icon: <Shield size={20} /> },
        { name: 'Ayarlar', href: '/dashboard/settings', icon: <Settings size={20} /> },
    ];

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] flex transition-colors duration-500 overflow-hidden">
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden fixed top-6 right-6 z-50 p-4 bg-[var(--color-bg-secondary)] rounded-2xl border border-[var(--color-border)] shadow-2xl text-[var(--color-text-primary)] hover:scale-105 active:scale-95 transition-all"
            >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar */}
            <aside className={`
                fixed lg:sticky top-0 left-0 h-screen w-[300px] bg-[var(--color-bg-secondary)] border-r border-[var(--color-border)] flex flex-col z-40 transition-transform duration-500 ease-spring
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Logo Section */}
                <div className="p-8 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-4 group">
                        <div className="w-12 h-12 bg-[var(--color-accent-blue)] rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-xl shadow-[var(--color-accent-blue)]/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                            O
                        </div>
                        <div>
                            <span className="text-xl font-black tracking-tighter text-[var(--color-text-primary)]">OmerVision</span>
                            <p className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-[0.4em] font-black leading-none mt-1">Admin Panel</p>
                        </div>
                    </Link>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto custom-scrollbar">
                    <div className="px-4 mb-6">
                        <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-[0.3em] font-black opacity-50">Menü İstasyonu</p>
                    </div>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`
                                    relative flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group
                                    ${isActive
                                        ? 'bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)] shadow-sm'
                                        : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]'
                                    }
                                `}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebar-active-indicator"
                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-[var(--color-accent-blue)] rounded-r-full shadow-[0_0_15px_rgba(0,190,255,0.4)]"
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    />
                                )}
                                <div className={`transition-colors duration-300 ${isActive ? 'text-[var(--color-accent-blue)]' : 'group-hover:text-[var(--color-accent-blue)]'}`}>
                                    {item.icon}
                                </div>
                                <span className="font-black text-sm tracking-tight">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer Section */}
                <div className="p-6 space-y-4">
                    <div className="p-4 rounded-3xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[var(--color-accent-blue)] flex items-center justify-center text-white font-black text-lg shadow-lg">
                            {user.display_name?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-black truncate text-[var(--color-text-primary)] tracking-tight">{user.display_name}</p>
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#00D47B] animate-pulse" />
                                <p className="text-[10px] text-[var(--color-text-muted)] font-black uppercase tracking-widest">{user.roles?.[0] || 'admin'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                        <button
                            onClick={logout}
                            className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl transition-all duration-500 group font-black text-xs uppercase tracking-widest border border-red-500/20"
                        >
                            <LogOut size={16} />
                            <span>Çıkış</span>
                        </button>
                        <ThemeToggle />
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 h-screen overflow-y-auto relative bg-[var(--color-bg-primary)] pb-20 lg:pb-0">
                <div className="max-w-7xl mx-auto p-6 lg:p-12 min-h-full">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={pathname}
                            initial={{ opacity: 0, scale: 0.98, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 1.02, y: -10 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            {/* Mobile Navigation Mesh Overlay */}
            {isMobileMenuOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-xl z-30 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </div>
    );
}
