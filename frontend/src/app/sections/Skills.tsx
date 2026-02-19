"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/animation/FadeIn";
import { api } from "@/lib/api";
import { springPresets } from "@/lib/animations";
import { SkillCategory } from "@/types";

interface SkillSegment {
  name: string;
  level: number;
  justification: string;
  category: string;
  color: string;
  startAngle: number;
  endAngle: number;
}

export function Skills() {
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [hoveredSkill, setHoveredSkill] = useState<SkillSegment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSkills()
      .then(setCategories)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const calculateSkillSegments = (cats: any[]): SkillSegment[] => {
    const segments: SkillSegment[] = [];
    let currentAngle = 0;

    cats.forEach((category: SkillCategory) => {
      const categoryAngle = 360 / cats.length;

      category.skills.forEach((skill: any) => {
        const skillAngle = categoryAngle / category.skills.length;

        segments.push({
          name: skill.name,
          level: skill.level,
          justification: skill.justification,
          category: category.category,
          color: category.color,
          startAngle: currentAngle,
          endAngle: currentAngle + skillAngle,
        });

        currentAngle += skillAngle;
      });
    });

    return segments;
  };

  const segments = calculateSkillSegments(categories);
  const centerX = 200;
  const centerY = 200;
  const innerRadius = 80;
  const maxOuterRadius = 180;

  function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
    const rad = (angle - 90) * Math.PI / 180.0;
    return { x: cx + (r * Math.cos(rad)), y: cy + (r * Math.sin(rad)) };
  }

  function describeDonutSegment(cx: number, cy: number, iR: number, oR: number, sA: number, eA: number) {
    const sOuter = polarToCartesian(cx, cy, oR, eA);
    const eOuter = polarToCartesian(cx, cy, oR, sA);
    const sInner = polarToCartesian(cx, cy, iR, eA);
    const eInner = polarToCartesian(cx, cy, iR, sA);
    const largeArc = eA - sA <= 180 ? "0" : "1";
    return ["M", sOuter.x, sOuter.y, "A", oR, oR, 0, largeArc, 0, eOuter.x, eOuter.y, "L", eInner.x, eInner.y, "A", iR, iR, 0, largeArc, 1, sInner.x, sInner.y, "Z"].join(" ");
  }

  if (loading) return null;
  if (categories.length === 0) return null;

  return (
    <section className="py-24 md:py-32 bg-[var(--color-bg-secondary)] overflow-hidden">
      <Container>
        <FadeIn className="mb-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Skills & Expertise</h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Teknoloji tekerleğim - Her dilim bir yetkinliği temsil eder.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <FadeIn>
            <div className="relative flex justify-center">
              <svg width="400" height="400" viewBox="0 0 400 400" className="transform -rotate-90">
                <circle cx={centerX} cy={centerY} r={maxOuterRadius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                {segments.map((segment, index) => {
                  const outerRadius = innerRadius + (segment.level / 100) * (maxOuterRadius - innerRadius);
                  const isHovered = hoveredSkill?.name === segment.name;
                  return (
                    <motion.path
                      key={segment.name}
                      d={describeDonutSegment(centerX, centerY, innerRadius, outerRadius, segment.startAngle, segment.endAngle - 1)}
                      fill={segment.color}
                      fillOpacity={isHovered ? 1 : 0.6}
                      stroke="#0a0a0f"
                      strokeWidth="2"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ ...springPresets.gentle, delay: index * 0.03 }}
                      onMouseEnter={() => setHoveredSkill(segment)}
                      onMouseLeave={() => setHoveredSkill(null)}
                      className="cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                    />
                  );
                })}
                <circle cx={centerX} cy={centerY} r={innerRadius - 5} fill="#0a0a0f" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                <text x={centerX} y={centerY - 10} textAnchor="middle" fill="#666" fontSize="12" className="transform rotate-90">Avg</text>
                <text x={centerX} y={centerY + 20} textAnchor="middle" fill="white" fontSize="28" fontWeight="bold" className="transform rotate-90">
                  {Math.round(segments.reduce((acc, s) => acc + s.level, 0) / segments.length)}%
                </text>
              </svg>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="space-y-6">
              {hoveredSkill ? (
                <motion.div key={hoveredSkill.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#111119] rounded-2xl p-6 border border-white/5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: hoveredSkill.color }} />
                    <span className="text-sm text-gray-500 uppercase tracking-wider">{hoveredSkill.category}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{hoveredSkill.name}</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                      <motion.div className="h-full rounded-full" style={{ backgroundColor: hoveredSkill.color }} initial={{ width: 0 }} animate={{ width: `${hoveredSkill.level}%` }} />
                    </div>
                    <span className="text-lg font-bold text-white">{hoveredSkill.level}%</span>
                  </div>
                  <p className="text-gray-400 italic font-light">&ldquo;{hoveredSkill.justification}&rdquo;</p>
                </motion.div>
              ) : (
                <div className="bg-[#111119] rounded-2xl p-6 border border-white/5 text-center py-12">
                  <p className="text-gray-500">Tekerlek üzerinde bir dilime gelerek detayları görüntüleyin</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {categories.map((category: any) => {
                  const avgLevel = Math.round(category.skills.reduce((acc: number, s: any) => acc + s.level, 0) / category.skills.length);
                  return (
                    <div key={category.category} className="bg-[#111119] rounded-xl p-4 border border-white/5">
                      <div className="w-8 h-8 rounded-lg mb-3 flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: category.color }}>{category.category[0]}</div>
                      <h4 className="font-semibold text-white mb-1">{category.category}</h4>
                      <p className="text-2xl font-bold" style={{ color: category.color }}>{avgLevel}%</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </FadeIn>
        </div>
      </Container>
    </section>
  );
}
