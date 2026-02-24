"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { FadeIn } from '@/components/animation/FadeIn';

export default function RegisterPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.register({
                username,
                email,
                password,
                display_name: displayName,
            });
            // Redirect to login after successful registration
            router.push('/login?registered=true');
        } catch (err: any) {
            setError(err.message || 'Kayıt başarısız');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)] px-4 transition-colors duration-500 relative overflow-hidden bg-noise">
            {/* Background Orbs */}
            <div className="absolute top-0 -right-64 w-[600px] h-[600px] bg-[#00BEFF]/10 blur-[120px] rounded-full animate-float" />
            <div className="absolute bottom-0 -left-64 w-[600px] h-[600px] bg-[#AE4DFF]/10 blur-[120px] rounded-full animate-pulse-subtle" />

            <Container size="sm" className="relative z-10">
                <FadeIn>
                    <div className="max-w-md mx-auto p-10 rounded-[2.5rem] border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/80 backdrop-blur-3xl shadow-premium relative">
                        <div className="text-center mb-10">
                            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#00BEFF] via-[#AE4DFF] to-[#FF3B00] rounded-[1.25rem] flex items-center justify-center text-white shadow-2xl shadow-[#AE4DFF]/30 mb-6 -rotate-3">
                                <span className="text-2xl font-black">OM</span>
                            </div>
                            <h1 className="text-4xl font-black tracking-tighter text-[var(--color-text-primary)] font-heading uppercase">Operatör Kaydı</h1>
                            <p className="text-[10px] uppercase font-black tracking-[0.4em] text-[var(--color-text-muted)] mt-2 opacity-60">System Registration Gate</p>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-8 text-[10px] font-black uppercase tracking-widest text-center animate-shake">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--color-text-muted)] ml-1 uppercase tracking-[0.2em]">Sistem Adı</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-[var(--color-bg-tertiary)] border-2 border-[var(--color-border)] rounded-2xl px-5 py-4 text-[var(--color-text-primary)] font-bold focus:border-[#00BEFF] focus:ring-4 focus:ring-[#00BEFF]/10 transition-all placeholder:text-[var(--color-text-muted)]"
                                    placeholder="Görünen İsim"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--color-text-muted)] ml-1 uppercase tracking-[0.2em]">Operatör Kimliği</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-[var(--color-bg-tertiary)] border-2 border-[var(--color-border)] rounded-2xl px-5 py-4 text-[var(--color-text-primary)] font-bold focus:border-[#AE4DFF] focus:ring-4 focus:ring-[#AE4DFF]/10 transition-all placeholder:text-[var(--color-text-muted)]"
                                    placeholder="Kullanıcı Adı"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--color-text-muted)] ml-1 uppercase tracking-[0.2em]">E-Posta Hattı</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-[var(--color-bg-tertiary)] border-2 border-[var(--color-border)] rounded-2xl px-5 py-4 text-[var(--color-text-primary)] font-bold focus:border-[#FF3B00] focus:ring-4 focus:ring-[#FF3B00]/10 transition-all placeholder:text-[var(--color-text-muted)]"
                                    placeholder="servis@omervision.io"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--color-text-muted)] ml-1 uppercase tracking-[0.2em]">Güvenlik Anahtarı</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full bg-[var(--color-bg-tertiary)] border-2 border-[var(--color-border)] rounded-2xl px-5 py-4 text-[var(--color-text-primary)] font-bold focus:border-[#00BEFF] focus:ring-4 focus:ring-[#00BEFF]/10 transition-all placeholder:text-[var(--color-text-muted)]"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-16 relative group rounded-2xl overflow-hidden shadow-2xl transition-all active:scale-95 disabled:opacity-50"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-[#00BEFF] via-[#AE4DFF] to-[#FF3B00] bg-[length:200%_100%] animate-gradient-shift group-hover:scale-110 transition-transform duration-500" />
                                <span className="relative text-white font-black uppercase tracking-[0.2em] text-sm">
                                    {loading ? 'Yükleniyor...' : 'Protokolü Onayla'}
                                </span>
                            </button>
                        </form>

                        <div className="mt-10 pt-8 border-t border-[var(--color-border)] text-center">
                            <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-4 opacity-40">Zaten bir operatör müsünüz?</p>
                            <button
                                onClick={() => router.push('/login')}
                                className="px-8 py-3 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] font-black text-[10px] uppercase tracking-widest transition-all"
                            >
                                Giriş Yap
                            </button>
                        </div>
                    </div>
                </FadeIn>
            </Container>
        </div>
    );
}
