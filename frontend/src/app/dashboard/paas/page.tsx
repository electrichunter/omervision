"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Play, Square, Activity, ExternalLink, GitBranch, Trash2, Edit2, RotateCw } from "lucide-react";
import { api, PaaSProject } from "@/lib/api";

export default function PaasDashboard() {
    const [projects, setProjects] = useState<PaaSProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingProject, setEditingProject] = useState<PaaSProject | null>(null);
    const [editName, setEditName] = useState("");
    const [editRepo, setEditRepo] = useState("");
    const [editCompose, setEditCompose] = useState("");

    const fetchProjects = async () => {
        try {
            const data = await api.getPaaSProjects();
            setProjects(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
        // Poll every 5s for status updates
        const interval = setInterval(fetchProjects, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleStop = async (id: number) => {
        try {
            await api.stopPaaSProject(id);
            fetchProjects();
        } catch (error) {
            alert("Durdurma işlemi başarısız");
        }
    };

    const handleStart = async (id: number) => {
        try {
            await api.startPaaSProject(id);
            fetchProjects();
        } catch (error) {
            alert("Başlatma işlemi başarısız");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Emin misiniz? Konteyner ve tüm veriler silinecek.")) return;
        try {
            await api.deletePaaSProject(id);
            fetchProjects();
        } catch (error) {
            alert("Silme işlemi başarısız");
        }
    };

    const saveEdit = async () => {
        if (!editingProject) return;
        try {
            await api.updatePaaSProject(editingProject.id, {
                name: editName,
                repo_url: editRepo,
                compose_code: editCompose
            });
            setEditingProject(null);
            fetchProjects();
        } catch (e) {
            alert("Güncelleme başarısız");
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Projeler (PaaS)</h1>
                    <p className="text-sm text-[var(--color-text-muted)] mt-1">Git repolarınızı dinamik olarak yayınlayın ve test edin.</p>
                </div>
                <Link
                    href="/dashboard/paas/create"
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--color-accent-blue)] hover:bg-[var(--color-accent-blue)]/90 text-white rounded-md transition-colors text-sm font-medium shadow-sm"
                >
                    <Plus size={16} /> Yeni Proje
                </Link>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {[
                    { label: "Çalışan", val: projects.filter(p => p.status === 'running').length, icon: <Play size={18} className="text-emerald-400" /> },
                    { label: "Mimari", val: "Next.js, FastAPI, Node, Static", icon: <Activity size={18} className="text-blue-400" /> },
                    { label: "Sistem Kaynakları", val: "Sınırlandırılmış", icon: <GitBranch size={18} className="text-purple-400" /> }
                ].map((m, i) => (
                    <div key={i} className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg p-6 flex items-center gap-4 shadow-sm">
                        <div className="w-12 h-12 rounded-md bg-[var(--color-bg-tertiary)] flex items-center justify-center border border-[var(--color-border)]">
                            {m.icon}
                        </div>
                        <div>
                            <p className="text-sm font-black text-[var(--color-text-primary)] uppercase tracking-widest leading-none mb-1">{m.val}</p>
                            <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest opacity-60">{m.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* List */}
            <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm text-[var(--color-text-secondary)]">
                    <thead className="bg-[var(--color-bg-tertiary)] text-[10px] uppercase font-black tracking-widest border-b border-[var(--color-border)]">
                        <tr>
                            <th className="px-8 py-5 text-[var(--color-text-muted)]">Proje</th>
                            <th className="px-8 py-5 text-[var(--color-text-muted)]">Durum</th>
                            <th className="px-8 py-5 text-[var(--color-text-muted)]">Tip</th>
                            <th className="px-8 py-5 text-[var(--color-text-muted)] text-right">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border)]">
                        {projects.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-[var(--color-text-muted)]">
                                    Henüz hiç proje eklemediniz.
                                </td>
                            </tr>
                        ) : projects.map(proj => (
                            <tr key={proj.id} className="hover:bg-[var(--color-bg-tertiary)]/50 transition-colors">
                                <td className="px-8 py-5">
                                    <p className="font-bold text-[var(--color-text-primary)]">{proj.name}</p>
                                    <a href={proj.repo_url} target="_blank" className="text-xs text-[var(--color-accent-blue)] hover:underline opacity-80">{proj.repo_url}</a>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${proj.status === 'running' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                        proj.status === 'deploying' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                            proj.status === 'failed' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                        }`}>
                                        {proj.status === 'deploying' && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />}
                                        {proj.status === 'running' && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                                        {proj.status === 'failed' && <div className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                                        {proj.status.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-8 py-5 uppercase text-[10px] font-black text-[var(--color-text-muted)] tracking-widest opacity-60">
                                    {proj.project_type || '-'}
                                </td>
                                <td className="px-8 py-5 flex items-center justify-end gap-2">
                                    <button onClick={() => {
                                        setEditingProject(proj);
                                        setEditName(proj.name);
                                        setEditRepo(proj.repo_url);
                                        setEditCompose(proj.compose_code || "");
                                    }} className="p-2.5 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)] rounded-md transition-colors border border-transparent hover:border-[var(--color-border)] shadow-sm" title="Düzenle">
                                        <Edit2 size={16} />
                                    </button>

                                    {proj.status === 'running' ? (
                                        <>
                                            <Link href={`/paas/${proj.id}`} className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-md transition-colors border border-transparent hover:border-blue-500/20 shadow-sm" title="Önizle">
                                                <ExternalLink size={16} />
                                            </Link>
                                            <button onClick={() => handleStop(proj.id)} className="p-2 text-amber-500 hover:bg-amber-500/10 rounded-md transition-colors border border-transparent hover:border-amber-500/20 shadow-sm" title="Durdur">
                                                <Square size={16} />
                                            </button>
                                        </>
                                    ) : (
                                        <button onClick={() => handleStart(proj.id)} className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-md transition-colors border border-transparent hover:border-emerald-500/20 shadow-sm" title="Başlat / Yeniden Yükle">
                                            <RotateCw size={16} />
                                        </button>
                                    )}

                                    <button onClick={() => handleDelete(proj.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-md transition-colors border border-transparent hover:border-red-500/20 shadow-sm" title="Kalıcı Sil">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            {editingProject && (
                <div className="fixed inset-0 bg-[var(--color-bg-primary)]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg w-full max-w-xl p-10 shadow-lg relative overflow-hidden">
                        <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-6 tracking-tight">Projeyi Düzenle</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em] mb-2 opacity-80">Proje Adı</label>
                                <input value={editName} onChange={e => setEditName(e.target.value)} className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-md px-4 py-3 text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent-blue)] transition-colors text-sm" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em] mb-2 opacity-80">Git URL</label>
                                <input value={editRepo} onChange={e => setEditRepo(e.target.value)} className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-md px-4 py-3 text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent-blue)] transition-colors text-sm" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em] mb-2 opacity-80">Docker Compose Code</label>
                                <textarea
                                    value={editCompose}
                                    onChange={e => setEditCompose(e.target.value)}
                                    className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-md px-4 py-3 text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent-blue)] transition-colors h-32 font-mono text-xs"
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-3 mt-8">
                            <button onClick={() => setEditingProject(null)} className="px-6 py-2.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors text-xs font-bold shadow-sm rounded-md border border-[var(--color-border)] bg-[var(--color-bg-tertiary)]">İptal</button>
                            <button onClick={saveEdit} className="px-6 py-2.5 bg-[var(--color-accent-blue)] text-white rounded-md transition-colors text-xs font-bold shadow-sm hover:bg-[var(--color-accent-blue)]/90">Kaydet</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
