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
    ChevronRight,
    AlertCircle,
    QrCode,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

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
        <div className="space-y-8 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <ShieldCheck className="text-blue-500" size={32} />
                    Güvenlik Ayarları
                </h1>
                <p className="text-gray-400 mt-2">Hesabınızın güvenliğini yönetin ve iki adımlı doğrulamayı yapılandırın.</p>
            </div>

            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-2xl flex items-center gap-3 border ${message.type === 'success'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                        }`}
                >
                    {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <span className="text-sm font-medium">{message.text}</span>
                </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Password Change Card */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-3xl p-6 backdrop-blur-xl"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <KeyRound size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-white">Şifre Değiştir</h2>
                    </div>

                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 ml-1 uppercase tracking-wider">Mevcut Şifre</label>
                            <input
                                type="password"
                                required
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all placeholder:text-gray-700"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 ml-1 uppercase tracking-wider">Yeni Şifre</label>
                            <input
                                type="password"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all placeholder:text-gray-700"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 ml-1 uppercase tracking-wider">Yeni Şifre (Yeniden)</label>
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all placeholder:text-gray-700"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                        >
                            <Lock size={18} />
                            Şifreyi Güncelle
                        </button>
                    </form>

                    <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/5">
                        <h3 className="text-xs font-bold text-gray-400 mb-2 uppercase flex items-center gap-2">
                            <AlertCircle size={12} /> Güvenlik Politikası
                        </h3>
                        <ul className="text-[11px] text-gray-500 space-y-1 leading-relaxed">
                            <li>• Minimum 8 karakter uzunluğunda olmalıdır.</li>
                            <li>• En az bir büyük ve bir küçük harf içermelidir.</li>
                            <li>• En az bir rakam ve bir özel karakter içermelidir.</li>
                        </ul>
                    </div>
                </motion.div>

                {/* MFA Card */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-3xl p-6 backdrop-blur-xl flex flex-col"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                            <Smartphone size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-white">İki Adımlı Doğrulama (MFA)</h2>
                    </div>

                    <p className="text-sm text-gray-400 leading-relaxed">
                        Hesabınıza giriş yaparken şifrenize ek olarak mobil uygulamanızdan üretilen tek kullanımlık kodu kullanarak güvenliğinizi artırın.
                    </p>

                    <div className="flex-1 flex flex-col justify-center py-10">
                        <div className="flex flex-col items-center gap-4">
                            <div className={`p-4 rounded-3xl ${user?.mfa_enabled ? 'bg-emerald-500/10' : 'bg-gray-500/10'} transition-colors`}>
                                {user?.mfa_enabled ? (
                                    <ShieldCheck size={64} className="text-emerald-500" />
                                ) : (
                                    <Smartphone size={64} className="text-gray-500" />
                                )}
                            </div>
                            <div className="text-center">
                                <p className={`text-lg font-bold ${user?.mfa_enabled ? 'text-emerald-400' : 'text-gray-400'}`}>
                                    {user?.mfa_enabled ? 'Aktif' : 'Pasif'}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {user?.mfa_enabled
                                        ? 'Hesabınız koruma altında.'
                                        : 'MFA şu an devre dışı.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {user?.mfa_enabled ? (
                        <button
                            onClick={disableMfa}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold py-3 px-6 rounded-2xl transition-all border border-red-500/20 disabled:opacity-50"
                        >
                            <XCircle size={18} />
                            MFA'yı Devre Dışı Bırak
                        </button>
                    ) : (
                        <button
                            onClick={startMfaSetup}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50"
                        >
                            <QrCode size={18} />
                            MFA'yı Etkinleştir
                        </button>
                    )}
                </motion.div>

            </div>

            {/* MFA Setup Modal */}
            <AnimatePresence>
                {isMfaModalOpen && mfaSetupData && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#0c0c14] border border-white/10 rounded-[32px] p-8 max-w-md w-full shadow-2xl"
                        >
                            <div className="text-center space-y-4">
                                <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-6">
                                    <QrCode size={32} />
                                </div>
                                <h3 className="text-2xl font-bold text-white">MFA Yapılandırması</h3>
                                <p className="text-gray-400 text-sm">
                                    Google Authenticator veya Authy gibi bir uygulama ile QR kodu taratın.
                                </p>

                                <div className="bg-white p-4 rounded-3xl inline-block shadow-xl">
                                    <QRCodeSVG value={mfaSetupData.qr_code_uri} size={180} />
                                </div>

                                <div className="pt-4">
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2">Manuel Anahtar</p>
                                    <code className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-sm font-mono text-blue-400">
                                        {mfaSetupData.secret}
                                    </code>
                                </div>

                                <div className="pt-6 space-y-4 text-left">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Doğrulama Kodu</label>
                                    <input
                                        type="text"
                                        maxLength={6}
                                        value={mfaCode}
                                        onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                                        placeholder="000000"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-center text-2xl font-mono text-white outline-none focus:border-blue-500/50 transition-all"
                                    />
                                    <div className="flex gap-3 pt-2">
                                        <button
                                            onClick={() => { setIsMfaModalOpen(false); setMfaSetupData(null); }}
                                            className="flex-1 py-3 px-6 rounded-2xl bg-white/5 text-gray-400 font-bold hover:bg-white/10 transition-all"
                                        >
                                            İptal
                                        </button>
                                        <button
                                            onClick={confirmMfaEnable}
                                            disabled={mfaCode.length !== 6 || loading}
                                            className="flex-1 py-3 px-6 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
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
