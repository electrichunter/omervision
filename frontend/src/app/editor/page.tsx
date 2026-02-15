"use client";

import { useState } from "react";
import Editor from "@/components/Editor";
import RoleGuard from "@/components/RoleGuard";
import { Menu } from "@/components/Menu";

export default function EditorPage() {
    const [content, setContent] = useState("");

    const handleSave = () => {
        console.log("Saving content:", content);
        alert("İçerek konsola yazıldı (Mock Save)");
    };

    return (
        <div className="flex min-h-screen bg-slate-950 text-white font-sans">
            <Menu />
            <main className="flex-1 p-8">
                <RoleGuard minRole={3}> {/* Writer (3) ve üstü görebilir */}
                    <div className="max-w-4xl mx-auto space-y-6">
                        <header className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Yeni Yazı Oluştur</h1>
                                <p className="text-slate-400 mt-2">Düşüncelerini dünyayla paylaş.</p>
                            </div>
                            <button
                                onClick={handleSave}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
                            >
                                Yayınla
                            </button>
                        </header>

                        <div className="bg-white rounded-xl shadow-xl overflow-hidden text-slate-900">
                            <Editor value={content} onChange={setContent} />
                        </div>

                        <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
                            <h3 className="text-sm font-semibold text-slate-400 mb-2">Canlı Önizleme (Raw HTML)</h3>
                            <div className="text-xs font-mono text-emerald-400 break-all">
                                {content || "Henüz bir içerik yok..."}
                            </div>
                        </div>

                    </div>
                </RoleGuard>
            </main>
        </div>
    );
}
