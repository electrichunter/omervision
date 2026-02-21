import { Metadata } from "next";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/animation/FadeIn";
import { Mail, MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
    title: "Contact | Full Stack Developer",
    description: "Get in touch for collaborations or just to say hi.",
};

export default function ContactPage() {
    return (
        <>
            <Navigation />
            <main className="pt-32 pb-24">
                <Container>
                    <div className="max-w-3xl mx-auto">
                        <FadeIn>
                            <h1 className="text-4xl md:text-5xl font-bold mb-6">Get in Touch</h1>
                            <p className="text-lg text-[var(--color-text-secondary)] mb-12">
                                Have a question or want to work together? Fill out the form below or reach out via email.
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
                                            <h3 className="font-semibold mb-1">Email</h3>
                                            <p className="text-[var(--color-text-secondary)]">ouysal155@gmail.com</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
                                            <MessageSquare size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold mb-1">Social</h3>
                                            <p className="text-[var(--color-text-secondary)]">LinkedIn üzerinden ulaşabilirsiniz</p>
                                        </div>
                                    </div>
                                </div>
                            </FadeIn>

                            <FadeIn delay={0.2}>
                                <form className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Name</label>
                                        <input
                                            type="text"
                                            className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Your name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Email</label>
                                        <input
                                            type="email"
                                            className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Message</label>
                                        <textarea
                                            className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 h-32"
                                            placeholder="Your message..."
                                        />
                                    </div>
                                    <Button className="w-full gap-2">
                                        Send Message
                                        <Send size={18} />
                                    </Button>
                                </form>
                            </FadeIn>
                        </div>
                    </div>
                </Container>
            </main>
            <Footer />
        </>
    );
}
