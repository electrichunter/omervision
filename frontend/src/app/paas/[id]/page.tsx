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
        <div className="flex flex-col h-screen bg-[#07070d]">
            {/* Unified Nav & Info Bar */}
            <div className="h-14 bg-[#0a0a0f] border-b border-white/10 flex items-center justify-between px-4 lg:px-6 flex-shrink-0 z-50 shadow-md">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="text-gray-400 hover:text-white transition-colors bg-white/5 p-1.5 rounded-lg border border-white/5">
                        <MoveLeft size={18} />
                    </button>
                    <div className="h-4 w-px bg-white/10" />
                    <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : isDeploying ? 'bg-blue-500 animate-pulse' : 'bg-red-500'}`} />
                        <h1 className="text-sm font-bold text-white flex items-center gap-2">
                            {project.name}
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 uppercase font-mono text-gray-400 ml-1">
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
            <div className="flex-1 overflow-hidden relative flex items-center justify-center p-4 lg:p-8 bg-[#0c0c14] custom-scrollbar">
                {isRunning && project.host_url ? (
                    <div className="w-full max-w-[1400px] aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-blue-900/10 bg-white relative ring-1 ring-white/5">
                        <iframe
                            src={project.host_url}
                            className="w-full h-full border-none"
                            title={`PaaS Viewer: ${project.name}`}
                            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                        />
                    </div>
                ) : (
                    <div className="w-full max-w-[1400px] aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#0a0a0f] p-6 lg:p-10 overflow-y-auto font-mono text-sm relative ring-1 ring-white/5">
                        <div className="max-w-4xl mx-auto space-y-4">
                            <div className="flex items-center gap-3 text-blue-400 pb-4 border-b border-white/5">
                                <TerminalSquare size={20} />
                                <span className="font-semibold">Sistem Logları & Build Çıktısı</span>
                            </div>

                            <pre className="text-gray-300 whitespace-pre-wrap leading-relaxed">
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
