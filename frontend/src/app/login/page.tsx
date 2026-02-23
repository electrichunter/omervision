"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [totpCode, setTotpCode] = useState('');
    const [error, setError] = useState('');
    const [mfaRequired, setMfaRequired] = useState(false);
    const { user, loading, login, hasRole } = useAuth();
    const router = useRouter();

    // If already logged in, redirect based on role
    useEffect(() => {
        if (!loading && user) {
            router.replace(hasRole('admin') ? '/dashboard' : '/');
        }
    }, [user, loading, router]);

    // Show nothing while checking auth status
    if (loading) return null;
    if (user) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await login({
                username,
                password,
                totp_code: mfaRequired ? totpCode : undefined
            });
            // Login successful — redirect based on role
            // After login, user state is updated, useEffect will handle redirect
        } catch (err: any) {
            if (err.message === 'mfa_required') {
                setMfaRequired(true);
            } else {
                setError(err.message || 'Giriş başarısız');
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)] px-4 transition-colors duration-500">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full p-8 rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/50 backdrop-blur-xl shadow-2xl"
            >
                <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    OmerVision Dashboard
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {!mfaRequired ? (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Kullanıcı Adı</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    placeholder="admin"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Şifre</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    required
                                />
                            </div>
                        </>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <label className="block text-sm font-medium text-gray-400 mb-2">MFA Doğrulama Kodu</label>
                            <input
                                type="text"
                                value={totpCode}
                                onChange={(e) => setTotpCode(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                placeholder="000000"
                                maxLength={6}
                                required
                                autoFocus
                            />
                            <p className="mt-2 text-xs text-gray-500 text-center">
                                Google Authenticator uygulamanızdaki kodu girin.
                            </p>
                            <button
                                type="button"
                                onClick={() => setMfaRequired(false)}
                                className="mt-4 text-xs text-gray-400 hover:text-white transition-colors block mx-auto"
                            >
                                ← Giriş bilgilerine dön
                            </button>
                        </motion.div>
                    )}

                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                    {typeof window !== 'undefined' && window.location.search.includes('registered=true') && (
                        <p className="text-green-400 text-sm text-center">Kayıt başarılı! Şimdi giriş yapabilirsiniz.</p>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-blue-500/20"
                    >
                        {mfaRequired ? 'Doğrula' : 'Giriş Yap'}
                    </button>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        Hesabınız yok mu?{' '}
                        <button
                            type="button"
                            onClick={() => router.push('/register')}
                            className="text-blue-400 hover:text-blue-300 font-medium"
                        >
                            Kayıt Ol
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
