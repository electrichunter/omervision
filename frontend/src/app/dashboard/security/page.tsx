"use client";

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldCheck,
    KeyRound,
    Smartphone,
    Lock,
    AlertCircle,
    QrCode,
    CheckCircle2,
    XCircle,
    ShieldAlert
} from 'lucide-react';
import dynamic from 'next/dynamic';
const QRCodeSVG = dynamic(() => import('qrcode.react').then((mod) => mod.QRCodeSVG), { ssr: false });

export default function SecurityPage() {
    const { user, refreshUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Password states
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // MFA States
    const [isMfaModalOpen, setIsMfaModalOpen] = useState(false);
    const [mfaSetupData, setMfaSetupData] = useState<{ secret: string, qr_code_uri: string } | null>(null);
    const [mfaCode, setMfaCode] = useState('');

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Yeni şifreler eşleşmiyor.' });
            return;
        }

        setLoading(true);
        setMessage(null);
        try {
            await api.changePassword({ old_password: oldPassword, new_password: newPassword });
            setMessage({ type: 'success', text: 'Şifreniz başarıyla güncellendi.' });
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Şifre değiştirilemedi.' });
        } finally {
            setLoading(false);
        }
    };

    const startMfaSetup = async () => {
        setLoading(true);
        try {
            const data = await api.setupMFA();
            setMfaSetupData(data);
            setIsMfaModalOpen(true);
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const confirmMfaEnable = async () => {
        if (!mfaSetupData || !mfaCode) return;
        setLoading(true);
        try {
            await api.enableMFA(mfaSetupData.secret, mfaCode);
            setIsMfaModalOpen(false);
            setMfaSetupData(null);
            setMfaCode('');
            await refreshUser();
            setMessage({ type: 'success', text: 'MFA başarıyla aktifleştirildi.' });
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const disableMfa = async () => {
        const code = prompt("MFA'yı devre dışı bırakmak için 6 haneli kodu girin:");
        if (!code) return;

        setLoading(true);
        try {
            await api.disableMFA(code);
            await refreshUser();
            setMessage({ type: 'success', text: 'MFA devre dışı bırakıldı.' });
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-12 max-w-5xl">
            <header className="space-y-3">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-lg bg-[var(--color-bg-tertiary)] flex items-center justify-center text-[var(--color-text-primary)] border border-[var(--color-border)] shadow-sm">
                        <ShieldCheck size={32} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-[var(--color-text-primary)] tracking-tighter">
                            Güvenlik Kalesi
                        </h1>
                        <p className="text-[10px] uppercase font-black tracking-[0.4em] text-[var(--color-text-muted)] opacity-60">Account Security Station</p>
                    </div>
                </div>
            </header>

            {message && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-6 rounded-3xl flex items-center gap-4 border-2 ${message.type === 'success'
                        ? 'bg-[#00D47B]/10 border-[#00D47B]/20 text-[#00D47B]'
                        : 'bg-[#FF3B00]/10 border-[#FF3B00]/20 text-[#FF3B00]'
                        }`}
                >
                    {message.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                    <span className="text-sm font-black uppercase tracking-widest">{message.text}</span>
                </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

                {/* Password Change Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg p-10 shadow-sm relative overflow-hidden"
                >

                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 rounded-lg bg-[var(--color-bg-tertiary)] flex items-center justify-center text-[var(--color-text-primary)] border border-[var(--color-border)]">
                            <KeyRound size={24} />
                        </div>
                        <h2 className="text-2xl font-black text-[var(--color-text-primary)] tracking-tight">Kripto Değişimi</h2>
                    </div>

                    <form onSubmit={handlePasswordChange} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[var(--color-text-muted)] ml-1 uppercase tracking-[0.2em]">Mevcut Kimlik Doğrulaması</label>
                            <input
                                type="password"
                                required
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-md px-5 py-3 text-[var(--color-text-primary)] font-bold focus:border-[var(--color-accent-blue)] outline-none transition-colors placeholder:text-[var(--color-text-muted)]"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[var(--color-text-muted)] ml-1 uppercase tracking-[0.2em]">Yeni Güvenlik Anahtarı</label>
                            <input
                                type="password"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-md px-5 py-3 text-[var(--color-text-primary)] font-bold focus:border-[var(--color-accent-blue)] outline-none transition-colors placeholder:text-[var(--color-text-muted)]"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[var(--color-text-muted)] ml-1 uppercase tracking-[0.2em]">Anahtarı Doğrula</label>
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-md px-5 py-3 text-[var(--color-text-primary)] font-bold focus:border-[var(--color-accent-blue)] outline-none transition-colors placeholder:text-[var(--color-text-muted)]"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-6 h-12 bg-[var(--color-accent-blue)] hover:bg-[var(--color-accent-blue)]/90 text-white font-black uppercase tracking-[0.2em] text-xs rounded-md transition-colors shadow-sm disabled:opacity-50"
                        >
                            Şifreyi Güncelle
                        </button>
                    </form>

                    <div className="mt-10 p-6 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]">
                        <h3 className="text-[10px] font-black text-[var(--color-text-primary)] mb-5 uppercase tracking-[0.3em] flex items-center gap-2">
                            <ShieldAlert size={14} /> Protokol Kuralları
                        </h3>
                        <ul className="text-xs font-bold text-[var(--color-text-secondary)] space-y-4 leading-relaxed">
                            <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-primary)]" /> Minimum 8 karakter</li>
                            <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-primary)]" /> Büyük & Küçük Harf Kombinasyonu</li>
                            <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-primary)]" /> Rakam & Sembol Gerekliliği</li>
                        </ul>
                    </div>
                </motion.div>

                {/* MFA Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg p-10 shadow-sm relative overflow-hidden flex flex-col"
                >

                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 rounded-lg bg-[var(--color-bg-tertiary)] flex items-center justify-center text-[var(--color-text-primary)] border border-[var(--color-border)]">
                            <Smartphone size={24} />
                        </div>
                        <h2 className="text-2xl font-black text-[var(--color-text-primary)] tracking-tight">İki Aşamalı Güvenlik</h2>
                    </div>

                    <p className="text-sm font-medium text-[var(--color-text-secondary)] leading-relaxed mb-auto">
                        Mobil uygulamanızdan üretilen tek kullanımlık kodlarla hesabınızı aşılmaz bir kaleye dönüştürün.
                    </p>

                    <div className="py-12">
                        <div className="flex flex-col items-center gap-6">
                            <div className={`p-8 rounded-lg relative transition-colors border
                                ${user?.mfa_enabled ? 'bg-[#00D47B]/10 border-[#00D47B]/20 text-[#00D47B]' : 'bg-[var(--color-bg-tertiary)] border-[var(--color-border)] text-[var(--color-text-muted)]'}
                            `}>
                                {user?.mfa_enabled ? (
                                    <ShieldCheck size={64} className="text-[#00D47B]" />
                                ) : (
                                    <Smartphone size={64} className="text-[var(--color-text-muted)] opacity-40" />
                                )}

                                <div className={`absolute -top-2 -right-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg border
                                    ${user?.mfa_enabled ? 'bg-[#00D47B] text-white border-white/20' : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)] border-[var(--color-border)]'}
                                `}>
                                    {user?.mfa_enabled ? 'Aktif' : 'Pasif'}
                                </div>
                            </div>

                            <div className="text-center">
                                <h3 className={`text-xl font-black ${user?.mfa_enabled ? 'text-[#00D47B]' : 'text-[var(--color-text-primary)]'}`}>
                                    {user?.mfa_enabled ? 'Sistem Korumalı' : 'Koruma Devre Dışı'}
                                </h3>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)] mt-2">
                                    {user?.mfa_enabled ? 'Authentication Protokolü Aktif' : 'MFA Yapılandırması Bekleniyor'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {user?.mfa_enabled ? (
                        <button
                            onClick={disableMfa}
                            disabled={loading}
                            className="w-full h-12 flex items-center justify-center gap-3 bg-[var(--color-bg-tertiary)] hover:bg-red-500/10 text-red-500 font-black uppercase tracking-widest text-xs rounded-md transition-colors border border-[var(--color-border)] hover:border-red-500/20 disabled:opacity-50"
                        >
                            <XCircle size={18} />
                            MFA'yı İptal Et
                        </button>
                    ) : (
                        <button
                            onClick={startMfaSetup}
                            disabled={loading}
                            className="w-full h-12 flex items-center justify-center gap-3 bg-[var(--color-accent-blue)] hover:bg-[var(--color-accent-blue)]/90 text-white font-black uppercase tracking-widest text-xs rounded-md transition-colors shadow-sm disabled:opacity-50"
                        >
                            <QrCode size={18} />
                            MFA'yı Etkinleştir
                        </button>
                    )}
                </motion.div>
            </div>

            {/* Premium MFA Setup Modal */}
            <AnimatePresence>
                {isMfaModalOpen && mfaSetupData && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#030305]/95 backdrop-blur-3xl"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg p-12 max-w-lg w-full shadow-lg relative"
                        >
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 p-4 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-md text-[var(--color-text-primary)] shadow-sm">
                                <QrCode size={32} />
                            </div>

                            <div className="text-center space-y-8 mt-6">
                                <div>
                                    <h3 className="text-3xl font-black text-[var(--color-text-primary)] tracking-tighter">Protokol Kurulumu</h3>
                                    <p className="text-sm font-medium text-[var(--color-text-secondary)] mt-2 opacity-80">
                                        Authenticator uygulamasıyla aşağıdaki matrisi taratın.
                                    </p>
                                </div>

                                <div className="bg-[var(--color-bg-tertiary)] p-6 rounded-md inline-block shadow-sm border border-[var(--color-border)]">
                                    <div className="relative z-10">
                                        <QRCodeSVG value={mfaSetupData.qr_code_uri} size={180} />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-[0.4em] font-black">Manuel Anahtar</p>
                                    <code className="bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] px-6 py-3 rounded-md text-sm font-black font-mono text-[var(--color-text-primary)] block tracking-[0.1em] shadow-sm">
                                        {mfaSetupData.secret}
                                    </code>
                                </div>

                                <div className="space-y-6 text-left">
                                    <div>
                                        <label className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.3em] ml-2 mb-4 block">6 Haneli Doğrulama Kodu</label>
                                        <input
                                            type="text"
                                            maxLength={6}
                                            value={mfaCode}
                                            onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                                            placeholder="••• •••"
                                            className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-md px-6 py-4 text-center text-3xl font-black tracking-[0.3em] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent-blue)] transition-colors"
                                        />
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <button
                                            onClick={() => { setIsMfaModalOpen(false); setMfaSetupData(null); }}
                                            className="flex-1 py-3 rounded-md bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-[var(--color-text-secondary)] font-black uppercase tracking-widest text-xs hover:bg-[var(--color-bg-secondary)] transition-colors shadow-sm"
                                        >
                                            İptal
                                        </button>
                                        <button
                                            onClick={confirmMfaEnable}
                                            disabled={mfaCode.length !== 6 || loading}
                                            className="flex-1 py-3 rounded-md bg-[var(--color-accent-blue)] text-white font-black uppercase tracking-widest text-xs hover:bg-[var(--color-accent-blue)]/90 transition-colors shadow-sm disabled:opacity-50"
                                        >
                                            Doğrula
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
