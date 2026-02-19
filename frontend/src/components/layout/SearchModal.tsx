"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, X, Loader2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { api } from "@/lib/api";
import { BlogPost, Project } from "@/types";
import { springPresets } from "@/lib/animations";

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<{ blogs: BlogPost[]; projects: Project[] }>({
        blogs: [],
        projects: [],
    });
    const [loading, setLoading] = useState(false);

    const handleSearch = useCallback(async (q: string) => {
        if (q.length < 2) {
            setResults({ blogs: [], projects: [] });
            return;
        }

        setLoading(true);
        try {
            const data = await api.search(q);
            setResults(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            handleSearch(query);
        }, 300);
        return () => clearTimeout(timer);
    }, [query, handleSearch]);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    transition={springPresets.gentle}
                    className="relative w-full max-w-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-3xl shadow-2xl overflow-hidden"
                >
                    {/* Search Input */}
                    <div className="flex items-center p-6 border-b border-[var(--color-border)] gap-4">
                        <Search className="text-[var(--color-text-muted)]" size={24} />
                        <input
                            autoFocus
                            className="flex-1 bg-transparent border-none outline-none text-xl text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]"
                            placeholder="Search anything..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        {loading ? (
                            <Loader2 className="animate-spin text-[var(--color-accent-blue)]" size={20} />
                        ) : (
                            <button onClick={onClose} className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
                                <X size={20} />
                            </button>
                        )}
                    </div>

                    {/* Results */}
                    <div className="max-h-[60vh] overflow-y-auto p-6 space-y-8">
                        {query.length < 2 ? (
                            <div className="py-12 text-center text-[var(--color-text-muted)]">
                                <p>Type at least 2 characters to search...</p>
                            </div>
                        ) : results.blogs.length === 0 && results.projects.length === 0 && !loading ? (
                            <div className="py-12 text-center text-[var(--color-text-muted)]">
                                <p>No results found for &quot;{query}&quot;</p>
                            </div>
                        ) : (
                            <>
                                {/* Projects */}
                                {results.projects.length > 0 && (
                                    <div>
                                        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-4">
                                            Projects
                                        </h3>
                                        <div className="space-y-2">
                                            {results.projects.map((project) => (
                                                <Link
                                                    key={project.id}
                                                    href={`/projects/${project.slug}`}
                                                    onClick={onClose}
                                                    className="flex items-center justify-between p-4 rounded-2xl hover:bg-[var(--color-bg-tertiary)] group transition-all"
                                                >
                                                    <div>
                                                        <p className="font-medium text-[var(--color-text-primary)]">{project.title}</p>
                                                        <p className="text-sm text-[var(--color-text-muted)]">{project.category}</p>
                                                    </div>
                                                    <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-[var(--color-accent-blue)]" />
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Blogs */}
                                {results.blogs.length > 0 && (
                                    <div>
                                        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-4">
                                            Blog Posts
                                        </h3>
                                        <div className="space-y-2">
                                            {results.blogs.map((post) => (
                                                <Link
                                                    key={post.id}
                                                    href={`/blog/${post.slug}`}
                                                    onClick={onClose}
                                                    className="flex items-center justify-between p-4 rounded-2xl hover:bg-[var(--color-bg-tertiary)] group transition-all"
                                                >
                                                    <div>
                                                        <p className="font-medium text-[var(--color-text-primary)]">{post.title}</p>
                                                        <p className="text-sm text-[var(--color-text-muted)]">{post.date}</p>
                                                    </div>
                                                    <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-[var(--color-accent-purple)]" />
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
