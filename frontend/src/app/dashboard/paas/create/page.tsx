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
                <Link href="/dashboard/paas" className="p-2 hover:bg-white/[0.05] rounded-xl transition-colors">
                    <MoveLeft className="text-gray-400 hover:text-white" size={24} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-white">Yeni Repository'yi Canlıya Al</h1>
                    <p className="text-sm text-gray-400 mt-1">Dinamik Next.js, FastAPI veya statik HTML projenizi saniyeler içinde ayağa kaldırın.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Sol Taraf Form */}
                <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6 bg-white/[0.02] border border-white/10 p-6 rounded-2xl">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
                                <Github size={16} /> Repository URL (Public)
                            </label>
                            <input
                                required
                                type="url"
                                placeholder="https://github.com/ornek-kullanici/nextjs-portfolyo"
                                className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none font-mono text-sm"
                                value={repoUrl}
                                onChange={(e) => setRepoUrl(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
                                <FileCode2 size={16} /> Proje Adı
                            </label>
                            <input
                                required
                                type="text"
                                placeholder="My Awesome NextJS Blog"
                                className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none text-sm"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Açıklama</label>
                            <textarea
                                placeholder="İsteğe bağlı kısa not..."
                                className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none resize-none h-20 text-sm"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
                                <Code2 size={16} className="text-blue-400" /> Docker Compose Kodu (İsteğe Bağlı)
                            </label>
                            <textarea
                                placeholder="version: '3.8'\nservices:\n  app: ..."
                                className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none resize-none h-48 text-sm font-mono"
                                value={composeCode}
                                onChange={(e) => setComposeCode(e.target.value)}
                            />
                            <p className="text-[10px] text-gray-500 mt-1 italic">* Belirtilirse, sistem repo analizi yerine bu kodu kullanacaktır.</p>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/10">
                        <button
                            type="submit"
                            disabled={loading || !name || !repoUrl}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_14px_0_rgba(37,99,235,0.39)]"
                        >
                            <CloudUpload size={20} />
                            {loading ? "Sistem Hazırlanıyor..." : "Deploy'u Başlat"}
                        </button>
                    </div>
                </form>

                {/* Sağ Taraf - Info Card */}
                <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6 h-fit space-y-6">
                    <div className="flex items-start gap-3 text-blue-400">
                        <AlertTriangle size={24} className="flex-shrink-0 mt-1" />
                        <div className="text-sm">
                            <h3 className="font-semibold text-white mb-1">Desteklenen Mimariler</h3>
                            <p className="text-blue-200/70 mb-4">Sistem yüklenen projeleri ağaç yapısından otomatik analiz eder ve uygun Docker konteynerini ayağa kaldırır.</p>

                            <ul className="space-y-3 font-mono text-xs">
                                <li className="flex items-center gap-2 bg-blue-500/10 p-2 rounded border border-blue-500/20">
                                    <Code2 size={14} /> package.json &rarr; <span className="text-white font-bold ml-auto">Next.js / Node</span>
                                </li>
                                <li className="flex items-center gap-2 bg-blue-500/10 p-2 rounded border border-blue-500/20">
                                    <Code2 size={14} /> requirements.txt &rarr; <span className="text-white font-bold ml-auto">FastAPI / Python</span>
                                </li>
                                <li className="flex items-center gap-2 bg-blue-500/10 p-2 rounded border border-blue-500/20">
                                    <Code2 size={14} /> index.html (Saf) &rarr; <span className="text-white font-bold ml-auto">NginX / Statik</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-blue-500/20 flex flex-col gap-2">
                        <span className="text-xs text-blue-200">Sistem İzolasyonu Aktif</span>
                        <div className="flex gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 bg-[#0a0a0f] rounded text-[10px] text-gray-400 border border-white/5">256MB RAM Limit</span>
                            <span className="px-2 py-0.5 bg-[#0a0a0f] rounded text-[10px] text-gray-400 border border-white/5">0.5 CPU Quota</span>
                            <span className="px-2 py-0.5 bg-[#0a0a0f] rounded text-[10px] text-gray-400 border border-white/5">On-Failure Restart</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
