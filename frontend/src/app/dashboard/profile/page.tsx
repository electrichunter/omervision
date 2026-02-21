"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Save, User, Wrench, ChevronDown, ChevronUp } from "lucide-react";
import { api } from "@/lib/api";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Skill {
    name: string;
    level: number;
    justification: string;
}

interface SkillCategory {
    category: string;
    color: string;
    skills: Skill[];
}

interface AboutData {
    name: string;
    title: string;
    bio: string;
    location: string;
    email: string;
    github: string;
    twitter: string;
    linkedin: string;
    available: boolean;
    avatar: string;
    avatarPosition?: string;
}

const COLORS = [
    "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#14b8a6"
];

// ─── Sub-components ──────────────────────────────────────────────────────────
function CategoryBlock({
    cat, index, onChange, onDelete
}: {
    cat: SkillCategory;
    index: number;
    onChange: (i: number, c: SkillCategory) => void;
    onDelete: (i: number) => void;
}) {
    const [open, setOpen] = useState(true);

    const updateSkill = (si: number, field: keyof Skill, val: string | number) => {
        const skills = [...cat.skills];
        skills[si] = { ...skills[si], [field]: val };
        onChange(index, { ...cat, skills });
    };

    const addSkill = () => {
        onChange(index, { ...cat, skills: [...cat.skills, { name: "", level: 80, justification: "" }] });
    };

    const removeSkill = (si: number) => {
        onChange(index, { ...cat, skills: cat.skills.filter((_, i) => i !== si) });
    };

    return (
        <div className="border border-[var(--color-border)] rounded-2xl overflow-hidden bg-white">
            {/* Header */}
            <div
                className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-[var(--color-bg-secondary)] transition-colors"
                onClick={() => setOpen(!open)}
            >
                <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: cat.color }} />
                    <input
                        className="font-semibold text-[var(--color-text-primary)] bg-transparent outline-none border-b border-transparent focus:border-[var(--color-accent-blue)] transition-colors"
                        value={cat.category}
                        onChange={e => onChange(index, { ...cat, category: e.target.value })}
                        onClick={e => e.stopPropagation()}
                        placeholder="Kategori adı"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                        {COLORS.map(c => (
                            <button key={c} onClick={e => { e.stopPropagation(); onChange(index, { ...cat, color: c }); }}
                                className={`w-5 h-5 rounded-full border-2 transition-all ${cat.color === c ? 'border-gray-800 scale-110' : 'border-transparent hover:scale-105'}`}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                    </div>
                    <button onClick={e => { e.stopPropagation(); onDelete(index); }}
                        className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors ml-2">
                        <Trash2 size={15} />
                    </button>
                    {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </div>
            </div>

            {/* Skills */}
            {open && (
                <div className="px-5 pb-5 space-y-3 border-t border-[var(--color-border)] pt-4">
                    {cat.skills.map((skill, si) => (
                        <div key={si} className="grid grid-cols-[1fr_100px_auto] gap-3 items-center bg-[var(--color-bg-secondary)] rounded-xl p-3">
                            <div className="space-y-1">
                                <input
                                    className="w-full text-sm font-medium bg-transparent outline-none border-b border-transparent focus:border-[var(--color-accent-blue)] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]"
                                    value={skill.name} placeholder="Teknoloji adı"
                                    onChange={e => updateSkill(si, "name", e.target.value)}
                                />
                                <input
                                    className="w-full text-xs bg-transparent outline-none text-[var(--color-text-muted)] placeholder-[var(--color-text-muted)]"
                                    value={skill.justification} placeholder="Kısa açıklama..."
                                    onChange={e => updateSkill(si, "justification", e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="range" min={10} max={100} step={5}
                                    value={skill.level}
                                    onChange={e => updateSkill(si, "level", Number(e.target.value))}
                                    className="w-full accent-[var(--color-accent-blue)]"
                                />
                                <span className="text-xs font-bold text-[var(--color-accent-blue)] w-8 text-right">{skill.level}%</span>
                            </div>
                            <button onClick={() => removeSkill(si)}
                                className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                    <button onClick={addSkill}
                        className="flex items-center gap-2 text-sm text-[var(--color-accent-blue)] hover:bg-blue-50 px-3 py-2 rounded-xl transition-colors font-medium">
                        <Plus size={15} /> Teknoloji Ekle
                    </button>
                </div>
            )}
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProfilePage() {
    const [tab, setTab] = useState<"about" | "skills">("about");
    const [about, setAbout] = useState<AboutData>({
        name: "", title: "", bio: "", location: "", email: "",
        github: "", twitter: "", linkedin: "", available: true, avatar: ""
    });
    const [skills, setSkills] = useState<SkillCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingAvatar(true);
        try {
            const res = await api.uploadFile(file);
            setAbout({ ...about, avatar: res.url });
        } catch (err) {
            alert('Avatar resmi yüklenemedi');
            console.error(err);
        } finally {
            setUploadingAvatar(false);
        }
    };

    useEffect(() => {
        Promise.all([
            fetch("/api/admin/about", { credentials: "include" }).then(r => r.json()),
            fetch("/api/admin/skills", { credentials: "include" }).then(r => r.json()),
        ]).then(([a, s]) => {
            setAbout(a);
            setSkills(Array.isArray(s) ? s : []);
        }).catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const save = async () => {
        setSaving(true);
        try {
            if (tab === "about") {
                await fetch("/api/admin/about", {
                    method: "PUT", credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(about)
                });
            } else {
                await fetch("/api/admin/skills", {
                    method: "PUT", credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(skills)
                });
            }
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch (e) {
            alert("Kayıt işlemi başarısız");
        } finally {
            setSaving(false);
        }
    };

    const addCategory = () => {
        setSkills([...skills, {
            category: "Yeni Kategori",
            color: COLORS[skills.length % COLORS.length],
            skills: []
        }]);
    };

    const updateCategory = (i: number, cat: SkillCategory) => {
        const copy = [...skills];
        copy[i] = cat;
        setSkills(copy);
    };

    const deleteCategory = (i: number) => {
        setSkills(skills.filter((_, idx) => idx !== i));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-[var(--color-accent-blue)] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Profil & Beceriler</h1>
                    <p className="text-sm text-[var(--color-text-muted)] mt-1">Hakkımda ve yetkinlikler sayfasını buradan yönetin.</p>
                </div>
                <button
                    onClick={save}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-accent-blue)] text-white rounded-xl font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-blue-500/20"
                >
                    <Save size={16} />
                    {saving ? "Kaydediliyor..." : saved ? "✓ Kaydedildi" : "Kaydet"}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-[var(--color-bg-secondary)] rounded-xl w-fit border border-[var(--color-border)]">
                {(["about", "skills"] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-white text-[var(--color-text-primary)] shadow-sm' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'}`}>
                        {t === "about" ? <><User size={15} /> Hakkımda</> : <><Wrench size={15} /> Beceriler</>}
                    </button>
                ))}
            </div>

            {/* About Tab */}
            {tab === "about" && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {[
                        { label: "Ad Soyad", key: "name", placeholder: "Ömer Faruk Uysal" },
                        { label: "Unvan", key: "title", placeholder: "Full Stack Developer" },
                        { label: "Konum", key: "location", placeholder: "İstanbul, Türkiye" },
                        { label: "E-posta", key: "email", placeholder: "ornek@mail.com" },
                        { label: "GitHub URL", key: "github", placeholder: "https://github.com/..." },
                        { label: "Twitter URL", key: "twitter", placeholder: "https://twitter.com/..." },
                        { label: "LinkedIn URL", key: "linkedin", placeholder: "https://linkedin.com/in/..." },
                    ].map(f => (
                        <div key={f.key} className="bg-white border border-[var(--color-border)] rounded-2xl p-4">
                            <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2 block">{f.label}</label>
                            <input
                                className="w-full bg-transparent outline-none text-[var(--color-text-primary)] text-sm border-b border-[var(--color-border)] focus:border-[var(--color-accent-blue)] transition-colors pb-1"
                                value={(about as any)[f.key] || ""}
                                placeholder={f.placeholder}
                                onChange={e => setAbout({ ...about, [f.key]: e.target.value })}
                            />
                        </div>
                    ))}

                    {/* Avatar Upload */}
                    <div className="bg-white border border-[var(--color-border)] rounded-2xl p-4 flex flex-col justify-center">
                        <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2 block">Avatar (Profil Resmi) - Dairesel Önizleme</label>
                        <div className="flex items-center gap-4">
                            {about.avatar ? (
                                <img src={about.avatar} alt="Avatar" className={`w-24 h-24 rounded-full object-cover ${about.avatarPosition || 'object-center'} border border-gray-200 shadow-sm`} />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
                                    <User size={30} className="text-gray-400" />
                                </div>
                            )}
                            <label className="inline-flex items-center gap-2 text-[var(--color-accent-blue)] hover:bg-blue-50 cursor-pointer transition-colors px-3 py-1.5 rounded-lg border border-blue-100 text-sm font-medium">
                                {uploadingAvatar ? "Yükleniyor..." : "Dosya Seç"}
                                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={uploadingAvatar} />
                            </label>
                            {about.avatar && (
                                <button onClick={() => setAbout({ ...about, avatar: '' })} className="text-xs text-red-500 hover:text-red-600 font-medium ml-2">Kaldır</button>
                            )}
                        </div>
                        {about.avatar && (
                            <div className="mt-6 border-t border-[var(--color-border)] pt-4">
                                <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2 block">Görselin Odak Noktası</label>
                                <p className="text-xs text-gray-400 mb-3">Kare olmayan fotoğrafların yuvarlak / dikey çerçeveye sığdırılırken neresine odaklanılacağını seçin.</p>
                                <select
                                    className="bg-white/[0.05] border border-white/10 text-gray-200 text-sm rounded-lg focus:ring-[var(--color-accent-blue)] focus:border-[var(--color-accent-blue)] outline-none block w-full p-2.5 transition-colors"
                                    value={about.avatarPosition || 'object-center'}
                                    onChange={(e) => setAbout({ ...about, avatarPosition: e.target.value })}
                                >
                                    <option value="object-center" className="text-gray-800">Merkez (Ortala)</option>
                                    <option value="object-top" className="text-gray-800">Üst</option>
                                    <option value="object-bottom" className="text-gray-800">Alt</option>
                                    <option value="object-left" className="text-gray-800">Sol</option>
                                    <option value="object-right" className="text-gray-800">Sağ</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Bio */}
                    <div className="lg:col-span-2 bg-white border border-[var(--color-border)] rounded-2xl p-4">
                        <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2 block">Biyografi</label>
                        <textarea
                            className="w-full bg-transparent outline-none text-[var(--color-text-primary)] text-sm resize-none focus:ring-0 h-28 leading-relaxed"
                            value={about.bio}
                            placeholder="Kendiniz hakkında birkaç cümle..."
                            onChange={e => setAbout({ ...about, bio: e.target.value })}
                        />
                    </div>

                    {/* Available toggle */}
                    <div className="lg:col-span-2 bg-white border border-[var(--color-border)] rounded-2xl p-4 flex items-center justify-between">
                        <div>
                            <p className="font-semibold text-[var(--color-text-primary)] text-sm">Freelance için müsait</p>
                            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Anasayfada "Available for freelance work" rozeti</p>
                        </div>
                        <button
                            onClick={() => setAbout({ ...about, available: !about.available })}
                            className={`relative w-12 h-6 rounded-full transition-colors ${about.available ? 'bg-emerald-500' : 'bg-gray-300'}`}
                        >
                            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${about.available ? 'translate-x-6' : 'translate-x-0.5'}`} />
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Skills Tab */}
            {tab === "skills" && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    {skills.map((cat, i) => (
                        <CategoryBlock key={i} cat={cat} index={i} onChange={updateCategory} onDelete={deleteCategory} />
                    ))}
                    <button onClick={addCategory}
                        className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-[var(--color-border)] rounded-2xl text-sm font-medium text-[var(--color-text-muted)] hover:border-[var(--color-accent-blue)] hover:text-[var(--color-accent-blue)] transition-all">
                        <Plus size={18} /> Yeni Kategori Ekle
                    </button>
                </motion.div>
            )}
        </div>
    );
}
