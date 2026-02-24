"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api, PaaSProject } from "@/lib/api";
import { TerminalSquare, AlertCircle, MoveLeft, ExternalLink } from "lucide-react";

export default function PaasViewerPage() {
    const params = useParams();
    const router = useRouter();
    const id = Number(params.id);
    const [project, setProject] = useState<PaaSProject | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProject = async () => {
        try {
            const data = await api.getPaaSProject(id);
            setProject(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProject();
        // Poll every 3 seconds if not running or failed
        const interval = setInterval(() => {
            fetchProject();
        }, 3000);
        return () => clearInterval(interval);
    }, [id]);

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-[var(--color-bg-primary)]">
                <div className="w-12 h-12 border-4 border-[var(--color-accent-blue)] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="h-screen flex items-center justify-center bg-[var(--color-bg-primary)] text-white flex-col gap-4">
                <AlertCircle size={48} className="text-red-500" />
                <h2 className="text-2xl font-bold">Proje Bulunamadı</h2>
            </div>
        );
    }

    const isRunning = project.status === "running";
    const isDeploying = project.status === "deploying" || project.status === "pending";

    return (
        <div className="flex flex-col h-screen bg-[var(--color-bg-primary)]">
            {/* Unified Nav & Info Bar */}
            <div className="h-14 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)] flex items-center justify-between px-4 lg:px-6 flex-shrink-0 z-50 shadow-premium">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors bg-[var(--color-bg-tertiary)] p-1.5 rounded-lg border border-[var(--color-border)]">
                        <MoveLeft size={18} />
                    </button>
                    <div className="h-4 w-px bg-[var(--color-border)] opacity-30" />
                    <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : isDeploying ? 'bg-blue-500 animate-pulse' : 'bg-red-500'}`} />
                        <h1 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                            {project.name}
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] uppercase font-mono text-[var(--color-text-muted)] ml-1">
                                {project.project_type || 'Bilinmiyor'}
                            </span>
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-6 text-sm">
                    {project.host_url && (
                        <div className="flex items-center gap-2">
                            <a href={project.host_url || '#'} target="_blank" className="text-blue-400 hover:text-blue-300 font-mono text-xs bg-blue-500/10 px-3 py-1.5 rounded border border-blue-500/20 flex items-center gap-1.5 transition-colors shadow-sm">
                                Canlı Önizleme <ExternalLink size={12} />
                            </a>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Viewing Area */}
            <div className="flex-1 overflow-hidden relative flex items-center justify-center p-4 lg:p-8 bg-[var(--color-bg-primary)] custom-scrollbar">
                {isRunning && project.host_url ? (
                    <div className="w-full max-w-[1400px] aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-blue-900/10 bg-[var(--color-bg-secondary)] relative ring-1 ring-white/5">
                        <iframe
                            src={project.host_url}
                            className="w-full h-full border-none"
                            title={`PaaS Viewer: ${project.name}`}
                            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                        />
                    </div>
                ) : (
                    <div className="w-full max-w-[1400px] aspect-video rounded-[2.5rem] overflow-hidden border border-[var(--color-border)] shadow-premium bg-[var(--color-bg-secondary)] p-6 lg:p-10 overflow-y-auto font-mono text-sm relative">
                        <div className="max-w-4xl mx-auto space-y-4">
                            <div className="flex items-center gap-3 text-[var(--color-accent-blue)] pb-4 border-b border-[var(--color-border)] opacity-60">
                                <TerminalSquare size={20} />
                                <span className="font-black uppercase tracking-widest text-xs">Sistem Logları & Build Çıktısı</span>
                            </div>

                            <pre className="text-[var(--color-text-secondary)] whitespace-pre-wrap leading-relaxed opacity-90">
                                {project.logs || '> Bekleniyor...'}
                            </pre>

                            {isDeploying && (
                                <div className="flex items-center gap-3 text-blue-400 mt-6 animate-pulse">
                                    <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                                    <span>İşlem devam ediyor, lütfen bekleyin...</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
