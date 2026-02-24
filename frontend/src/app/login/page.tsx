"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, ShieldAlert, Fingerprint, ArrowRight, User as UserIcon, Lock } from 'lucide-react';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [totpCode, setTotpCode] = useState('');
    const [error, setError] = useState('');
    const [mfaRequired, setMfaRequired] = useState(false);
    const { user, loading, login, hasRole } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            router.replace(hasRole('admin') ? '/dashboard' : '/');
        }
    }, [user, loading, router, hasRole]);

    if (loading || user) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await login({
                username,
                password,
                totp_code: mfaRequired ? totpCode : undefined
            });
        } catch (err: any) {
            if (err.message === 'mfa_required') {
                setMfaRequired(true);
            } else {
                setError(err.message || 'Giriş başarısız');
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)] px-4 transition-colors duration-500 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-0 -left-64 w-[600px] h-[600px] bg-[#FF3B00]/10 blur-[120px] rounded-full animate-float" />
            <div className="absolute bottom-0 -right-64 w-[600px] h-[600px] bg-[#AE4DFF]/10 blur-[120px] rounded-full animate-pulse-subtle" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="max-w-md w-full p-10 rounded-[2.5rem] border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/80 backdrop-blur-3xl shadow-[0_32px_120px_-20px_rgba(0,0,0,0.3)] dark:shadow-[0_32px_120px_-20px_rgba(255,255,255,0.05)] relative z-10"
            >
                <div className="flex flex-col items-center mb-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#FF3B00] to-[#AE4DFF] rounded-[1.25rem] flex items-center justify-center text-white shadow-2xl shadow-[#FF3B00]/30 mb-6 rotate-3">
                        <Fingerprint size={32} />
                    </div>
                    <h1 className="text-4xl font-black text-center tracking-tighter text-[var(--color-text-primary)]">
                        OmerVision
                    </h1>
                    <p className="text-[10px] uppercase font-black tracking-[0.4em] text-[var(--color-text-muted)] mt-2 opacity-60">Admin Gateway</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <AnimatePresence mode="wait">
                        {!mfaRequired ? (
                            <motion.div
                                key="login-fields"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-5"
                            >
                                <div>
                                    <label className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest mb-2 block px-1">Kimlik</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--color-text-muted)] group-focus-within:text-[#FF3B00] transition-colors">
                                            <UserIcon size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="w-full bg-[var(--color-bg-tertiary)]/50 border-2 border-[var(--color-border)] rounded-2xl pl-12 pr-4 py-4 text-[var(--color-text-primary)] font-bold focus:outline-none focus:border-[#FF3B00] focus:ring-4 focus:ring-[#FF3B00]/10 transition-all placeholder:text-[var(--color-text-muted)] hover:border-[var(--color-text-muted)]"
                                            placeholder="Kullanıcı adı"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest mb-2 block px-1">Sırrınız</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--color-text-muted)] group-focus-within:text-[#AE4DFF] transition-colors">
                                            <Lock size={18} />
                                        </div>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-[var(--color-bg-tertiary)]/50 border-2 border-[var(--color-border)] rounded-2xl pl-12 pr-4 py-4 text-[var(--color-text-primary)] font-bold focus:outline-none focus:border-[#AE4DFF] focus:ring-4 focus:ring-[#AE4DFF]/10 transition-all placeholder:text-[var(--color-text-muted)] hover:border-[var(--color-text-muted)]"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="mfa-fields"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <div className="p-4 rounded-2xl bg-[#AE4DFF]/10 border border-[#AE4DFF]/20 flex items-center gap-4 mb-6">
                                    <ShieldAlert className="text-[#AE4DFF]" size={24} />
                                    <p className="text-xs font-bold text-[#AE4DFF] uppercase tracking-wide">MFA Doğrulaması Gerekli</p>
                                </div>

                                <input
                                    type="text"
                                    value={totpCode}
                                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                                    className="w-full bg-[var(--color-bg-tertiary)]/50 border-2 border-[var(--color-border)] rounded-2xl px-4 py-6 text-center text-4xl font-black tracking-[0.4em] text-[var(--color-text-primary)] focus:outline-none focus:border-[#00BEFF] focus:ring-4 focus:ring-[#00BEFF]/10 transition-all outline-none"
                                    placeholder="000000"
                                    maxLength={6}
                                    required
                                    autoFocus
                                />
                                <p className="text-[10px] text-[var(--color-text-muted)] text-center font-bold tracking-widest uppercase mt-4">Uygulamanızdaki 6 haneli kodu girin</p>

                                <button
                                    type="button"
                                    onClick={() => setMfaRequired(false)}
                                    className="pt-4 text-[10px] font-black uppercase tracking-widest text-[#FF3B00] hover:opacity-80 transition-opacity block mx-auto underline underline-offset-4"
                                >
                                    Farklı bir hesapla gir
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {error && (
                        <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest text-center p-3 rounded-xl"
                        >
                            {error}
                        </motion.p>
                    )}

                    <button
                        type="submit"
                        className="w-full relative group h-16 rounded-2xl overflow-hidden shadow-2xl transition-all active:scale-95"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-[#FF3B00] via-[#AE4DFF] to-[#00BEFF] bg-[length:200%_100%] animate-gradient-shift group-hover:scale-110 transition-transform duration-500" />
                        <div className="relative flex items-center justify-center gap-3 text-white font-black uppercase tracking-[0.2em] text-sm">
                            <span className="group-hover:translate-x-[-10px] transition-transform duration-500">
                                {mfaRequired ? 'Doğrula' : 'Sisteme Sız'}
                            </span>
                            <ArrowRight size={20} className="absolute right-8 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-500" />
                        </div>
                    </button>
                </form>

                <div className="mt-10 pt-8 border-t border-[var(--color-border)] text-center">
                    <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-4 opacity-40">Yeni bir operatör müsünüz?</p>
                    <button
                        type="button"
                        onClick={() => router.push('/register')}
                        className="px-8 py-3 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] font-black text-[10px] uppercase tracking-widest transition-all"
                    >
                        Kayıt Oluştur
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
