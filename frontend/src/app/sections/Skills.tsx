"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/animation/FadeIn";
import { api } from "@/lib/api";
import { springPresets } from "@/lib/animations";
import { SkillCategory } from "@/types";

const categoryIcons: Record<string, string> = {
  Frontend: "⚡",
  Backend: "🔧",
  Database: "🗄️",
  DevOps: "☁️",
  Mobile: "📱",
  Design: "🎨",
  Tools: "🛠️",
  Languages: "💻",
};

export function Skills() {
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSkills()
      .then((data) => {
        setCategories(data);
        if (data.length > 0) setActiveCategory(data[0].category);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (categories.length === 0) return null;

  const active = categories.find((c) => c.category === activeCategory);

  return (
    <section className="py-24 md:py-32 bg-[var(--color-bg-secondary)] overflow-hidden">
      <Container>
        <FadeIn className="mb-16 text-center">
          <span className="badge-accent mb-4 inline-block">Yetkinlikler</span>
          <h2 className="text-3xl font-bold text-[var(--color-text-primary)] mb-4">
            Skills & Expertise
          </h2>
          <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto text-lg">
            Modern teknolojilerle inşa ettiğim projeler ve edindiğim deneyimler.
          </p>
        </FadeIn>

        {/* Category tabs */}
        <FadeIn>
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {categories.map((cat: any) => (
              <button
                key={cat.category}
                onClick={() => setActiveCategory(cat.category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${activeCategory === cat.category
                    ? "text-white border-transparent shadow-lg shadow-[var(--color-accent-blue)]/20"
                    : "bg-white text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-border-hover)] hover:text-[var(--color-text-primary)]"
                  }`}
                style={
                  activeCategory === cat.category
                    ? { backgroundColor: cat.color, borderColor: cat.color }
                    : {}
                }
              >
                <span className="mr-1.5">
                  {categoryIcons[cat.category] || "✦"}
                </span>
                {cat.category}
              </button>
            ))}
          </div>
        </FadeIn>

        {/* Active category skills */}
        {active && (
          <motion.div
            key={active.category}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springPresets.gentle}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(active as any).skills.map((skill: any, index: number) => (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...springPresets.gentle, delay: index * 0.06 }}
                  className="group bg-white border border-[var(--color-border)] rounded-2xl p-5 hover:border-[var(--color-border-hover)] hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-sm"
                        style={{ backgroundColor: (active as any).color }}
                      >
                        {skill.name[0]}
                      </div>
                      <div>
                        <h4 className="font-semibold text-[var(--color-text-primary)] text-sm leading-tight">
                          {skill.name}
                        </h4>
                        <span className="text-xs text-[var(--color-text-muted)]">
                          {(active as any).category}
                        </span>
                      </div>
                    </div>
                    <span
                      className="text-sm font-bold"
                      style={{ color: (active as any).color }}
                    >
                      {skill.level}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden mb-3">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: (active as any).color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.level}%` }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: index * 0.06 }}
                    />
                  </div>

                  {/* Justification */}
                  {skill.justification && (
                    <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 italic leading-relaxed">
                      "{skill.justification}"
                    </p>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Category summary */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-8 flex items-center justify-center gap-2 text-sm text-[var(--color-text-muted)]"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: (active as any).color }}
              />
              <span>
                {(active as any).category} ·{" "}
                <span className="font-medium text-[var(--color-text-secondary)]">
                  {(active as any).skills.length} teknoloji
                </span>
                {" "}· Ortalama{" "}
                <span className="font-semibold" style={{ color: (active as any).color }}>
                  {Math.round(
                    (active as any).skills.reduce(
                      (acc: number, s: any) => acc + s.level,
                      0
                    ) / (active as any).skills.length
                  )}
                  %
                </span>
              </span>
            </motion.div>
          </motion.div>
        )}
      </Container>
    </section>
  );
}
