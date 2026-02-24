"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoveLeft, CloudUpload, Github, FileCode2, AlertTriangle, Code2 } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";

export default function CreatePaasProject() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [repoUrl, setRepoUrl] = useState("");
    const [description, setDescription] = useState("");
    const [composeCode, setComposeCode] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.createPaaSProject({
                name,
                repo_url: repoUrl,
                description,
                compose_code: composeCode || undefined
            });
            router.push("/dashboard/paas");
        } catch (error: any) {
            alert(`Deploy başlatılamadı: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/paas" className="p-2 hover:bg-[var(--color-bg-secondary)] rounded-md transition-colors text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
                    <MoveLeft size={24} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Yeni Repository'yi Canlıya Al</h1>
                    <p className="text-[var(--color-text-secondary)] mt-1 opacity-80">Dinamik Next.js, FastAPI veya statik HTML projenizi saniyeler içinde ayağa kaldırın.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Sol Taraf Form */}
                <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-8 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] p-10 rounded-lg shadow-sm">
                    <div className="space-y-4">
                        <div>
                            <label className="text-[var(--color-text-secondary)] mb-1.5 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] opacity-80">
                                <Github size={14} /> Repository URL (Public)
                            </label>
                            <input
                                required
                                type="url"
                                placeholder="https://github.com/ornek-kullanici/nextjs-portfolyo"
                                className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-md px-5 py-3 text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:border-[var(--color-accent-blue)] transition-colors outline-none font-mono text-sm"
                                value={repoUrl}
                                onChange={(e) => setRepoUrl(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="text-[var(--color-text-secondary)] mb-1.5 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] opacity-80">
                                <FileCode2 size={14} /> Proje Adı
                            </label>
                            <input
                                required
                                type="text"
                                placeholder="My Awesome NextJS Blog"
                                className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-md px-5 py-3 text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:border-[var(--color-accent-blue)] transition-colors outline-none text-sm"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="text-[var(--color-text-secondary)] mb-1.5 block text-[10px] font-black uppercase tracking-[0.2em] opacity-80">
                                Açıklama
                            </label>
                            <textarea
                                placeholder="İsteğe bağlı kısa not..."
                                className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-md px-5 py-3 text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:border-[var(--color-accent-blue)] transition-colors outline-none resize-none h-20 text-sm"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="text-[var(--color-text-secondary)] mb-1.5 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] opacity-80">
                                <Code2 size={14} className="text-[var(--color-accent-blue)]" /> Docker Compose Kodu (İsteğe Bağlı)
                            </label>
                            <textarea
                                placeholder="version: '3.8'\nservices:\n  app: ..."
                                className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-md px-5 py-3 text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:border-[var(--color-accent-blue)] transition-colors outline-none resize-none h-48 text-sm font-mono"
                                value={composeCode}
                                onChange={(e) => setComposeCode(e.target.value)}
                            />
                            <p className="text-[10px] text-[var(--color-text-muted)] mt-1.5 italic font-medium opacity-80">* Belirtilirse, sistem repo analizi yerine bu kodu kullanacaktır.</p>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-[var(--color-border)]">
                        <button
                            type="submit"
                            disabled={loading || !name || !repoUrl}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[var(--color-accent-blue)] hover:bg-[var(--color-accent-blue)]/90 text-white rounded-md transition-colors font-black uppercase tracking-[0.2em] text-[10px] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm border border-[var(--color-accent-blue)]/20"
                        >
                            <CloudUpload size={16} />
                            {loading ? "Sistem Hazırlanıyor..." : "Deploy'u Başlat"}
                        </button>
                    </div>
                </form>

                {/* Sağ Taraf - Info Card */}
                <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-accent-blue)]/20 rounded-lg p-6 h-fit space-y-6 shadow-sm">
                    <div className="flex items-start gap-3 text-[var(--color-accent-blue)]">
                        <AlertTriangle size={24} className="flex-shrink-0 mt-1 opacity-80" />
                        <div className="text-sm">
                            <h3 className="font-bold text-[var(--color-text-primary)] mb-1">Desteklenen Mimariler</h3>
                            <p className="text-[var(--color-text-secondary)] opacity-80 mb-4 leading-relaxed">Sistem yüklenen projeleri ağaç yapısından otomatik analiz eder ve uygun Docker konteynerini ayağa kaldırır.</p>

                            <ul className="space-y-3 font-mono text-xs text-[var(--color-text-secondary)]">
                                <li className="flex items-center gap-2 bg-[var(--color-bg-tertiary)] p-2.5 rounded-md border border-[var(--color-border)]">
                                    <Code2 size={14} className="opacity-70" /> package.json <span className="text-[var(--color-text-muted)] mx-1">&rarr;</span> <span className="text-[var(--color-text-primary)] font-bold ml-auto">Next.js / Node</span>
                                </li>
                                <li className="flex items-center gap-2 bg-[var(--color-bg-tertiary)] p-2.5 rounded-md border border-[var(--color-border)]">
                                    <Code2 size={14} className="opacity-70" /> requirements.txt <span className="text-[var(--color-text-muted)] mx-1">&rarr;</span> <span className="text-[var(--color-text-primary)] font-bold ml-auto">FastAPI / Python</span>
                                </li>
                                <li className="flex items-center gap-2 bg-[var(--color-bg-tertiary)] p-2.5 rounded-md border border-[var(--color-border)]">
                                    <Code2 size={14} className="opacity-70" /> index.html (Saf) <span className="text-[var(--color-text-muted)] mx-1">&rarr;</span> <span className="text-[var(--color-text-primary)] font-bold ml-auto">NginX / Statik</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-5 border-t border-[var(--color-border)] flex flex-col gap-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)] opacity-80">Sistem İzolasyonu Aktif</span>
                        <div className="flex gap-2 flex-wrap mt-1">
                            <span className="px-2 py-1 bg-[var(--color-bg-tertiary)] rounded border border-[var(--color-border)] text-[10px] font-bold text-[var(--color-text-secondary)]">256MB RAM Limit</span>
                            <span className="px-2 py-1 bg-[var(--color-bg-tertiary)] rounded border border-[var(--color-border)] text-[10px] font-bold text-[var(--color-text-secondary)]">0.5 CPU Quota</span>
                            <span className="px-2 py-1 bg-[var(--color-bg-tertiary)] rounded border border-[var(--color-border)] text-[10px] font-bold text-[var(--color-text-secondary)]">On-Failure Restart</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
