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
            await api.updatePaaSProject(editingProject.id, { name: editName, repo_url: editRepo });
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
                    <h1 className="text-2xl font-bold text-white">Projeler (PaaS)</h1>
                    <p className="text-sm text-gray-400 mt-1">Git repolarınızı dinamik olarak yayınlayın ve test edin.</p>
                </div>
                <Link
                    href="/dashboard/paas/create"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors text-sm font-medium"
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
                    <div key={i} className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                            {m.icon}
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-white">{m.val}</p>
                            <p className="text-xs text-gray-500">{m.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* List */}
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-sm text-gray-400">
                    <thead className="bg-white/[0.02] text-xs uppercase border-b border-white/10">
                        <tr>
                            <th className="px-6 py-4 font-medium text-gray-300">Proje</th>
                            <th className="px-6 py-4 font-medium text-gray-300">Durum</th>
                            <th className="px-6 py-4 font-medium text-gray-300">Tip</th>
                            <th className="px-6 py-4 font-medium text-gray-300 text-right">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {projects.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                    Henüz hiç proje eklemediniz.
                                </td>
                            </tr>
                        ) : projects.map(proj => (
                            <tr key={proj.id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="px-6 py-4">
                                    <p className="font-semibold text-gray-200">{proj.name}</p>
                                    <a href={proj.repo_url} target="_blank" className="text-xs text-blue-400 hover:underline">{proj.repo_url}</a>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${proj.status === 'running' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                        proj.status === 'deploying' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                            proj.status === 'failed' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                        }`}>
                                        {proj.status === 'deploying' && <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />}
                                        {proj.status === 'running' && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />}
                                        {proj.status === 'failed' && <div className="w-1.5 h-1.5 rounded-full bg-red-400" />}
                                        {proj.status.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4 uppercase text-xs font-bold text-gray-500">
                                    {proj.project_type || '-'}
                                </td>
                                <td className="px-6 py-4 flex items-center justify-end gap-2">
                                    <button onClick={() => { setEditingProject(proj); setEditName(proj.name); setEditRepo(proj.repo_url); }} className="p-2 text-gray-400 hover:bg-gray-500/10 rounded-lg transition-colors border border-transparent hover:border-gray-500/20" title="Düzenle">
                                        <Edit2 size={16} />
                                    </button>

                                    {proj.status === 'running' ? (
                                        <>
                                            <Link href={`/paas/${proj.id}`} className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors border border-transparent hover:border-blue-500/20" title="Önizle">
                                                <ExternalLink size={16} />
                                            </Link>
                                            <button onClick={() => handleStop(proj.id)} className="p-2 text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors border border-transparent hover:border-amber-500/20" title="Durdur">
                                                <Square size={16} />
                                            </button>
                                        </>
                                    ) : (
                                        <button onClick={() => handleStart(proj.id)} className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors border border-transparent hover:border-emerald-500/20" title="Başlat / Yeniden Yükle">
                                            <RotateCw size={16} />
                                        </button>
                                    )}

                                    <button onClick={() => handleDelete(proj.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20" title="Kalıcı Sil">
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
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#0a0a0f] border border-white/10 rounded-2xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold text-white mb-4">Projeyi Düzenle</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Proje Adı</label>
                                <input value={editName} onChange={e => setEditName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Git URL</label>
                                <input value={editRepo} onChange={e => setEditRepo(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500" />
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-3 mt-6">
                            <button onClick={() => setEditingProject(null)} className="px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm font-medium">İptal</button>
                            <button onClick={saveEdit} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium">Kaydet</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
