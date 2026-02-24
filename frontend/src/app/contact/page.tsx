"use client";

import { useState } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/animation/FadeIn";
import { Mail, MessageSquare, Send, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: ""
    });
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        setErrorMessage("");

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/contact`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || "Bir hata oluştu.");
            }

            setStatus("success");
            setFormData({ name: "", email: "", message: "" });
        } catch (err: any) {
            setStatus("error");
            setErrorMessage(err.message || "Mesaj gönderilemedi. Lütfen tekrar deneyin.");
        }
    };

    return (
        <>
            <Navigation />
            <main className="pt-32 pb-24">
                <Container>
                    <div className="max-w-3xl mx-auto">
                        <FadeIn>
                            <h1 className="text-4xl md:text-5xl font-bold mb-6">İletişime Geçin</h1>
                            <p className="text-lg text-[var(--color-text-secondary)] mb-12">
                                Bir sorunuz mu var veya birlikte çalışmak mı istiyorsunuz? Aşağıdaki formu doldurun veya e-posta yoluyla ulaşın.
                            </p>
                        </FadeIn>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <FadeIn delay={0.1}>
                                <div className="space-y-8">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                                            <Mail size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold mb-1">E-posta</h3>
                                            <p className="text-[var(--color-text-secondary)]">ouysal155@gmail.com</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
                                            <MessageSquare size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold mb-1">Sosyal Medya</h3>
                                            <p className="text-[var(--color-text-secondary)]">LinkedIn üzerinden ulaşabilirsiniz</p>
                                        </div>
                                    </div>
                                </div>
                            </FadeIn>

                            <FadeIn delay={0.2}>
                                {status === "success" ? (
                                    <div className="bg-green-500/10 border border-green-500/20 p-8 rounded-3xl text-center space-y-4">
                                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto text-white shadow-xl shadow-green-500/20">
                                            <CheckCircle2 size={32} />
                                        </div>
                                        <h3 className="text-xl font-bold">Mesajınız Alındı!</h3>
                                        <p className="text-[var(--color-text-secondary)]">En kısa sürede size geri dönüş yapacağım.</p>
                                        <Button
                                            variant="outline"
                                            className="mt-4"
                                            onClick={() => setStatus("idle")}
                                        >
                                            Yeni Mesaj Gönder
                                        </Button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">İsim</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                                placeholder="Adınız Soyadınız"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">E-posta</label>
                                            <input
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                                placeholder="E-posta adresiniz"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Mesaj</label>
                                            <textarea
                                                required
                                                value={formData.message}
                                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none transition-all font-medium"
                                                placeholder="Mesajınız..."
                                            />
                                        </div>

                                        {status === "error" && (
                                            <p className="text-red-500 text-sm font-medium bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                                                {errorMessage}
                                            </p>
                                        )}

                                        <Button
                                            type="submit"
                                            className="w-full gap-2 py-6 text-lg font-bold shadow-lg shadow-blue-500/20 group"
                                            disabled={status === "loading"}
                                        >
                                            {status === "loading" ? (
                                                <Loader2 className="animate-spin" size={20} />
                                            ) : (
                                                <>
                                                    Mesaj Gönder
                                                    <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                                </>
                                            )}
                                        </Button>
                                    </form>
                                )}
                            </FadeIn>
                        </div>
                    </div>
                </Container>
            </main>
            <Footer />
        </>
    );
}
