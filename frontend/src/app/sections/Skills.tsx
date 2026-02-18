"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { FadeIn } from "@/components/animation/FadeIn";
import { skillCategories } from "@/lib/data";
import { springPresets } from "@/lib/animations";

interface SkillSegment {
  name: string;
  level: number;
  justification: string;
  category: string;
  color: string;
  startAngle: number;
  endAngle: number;
}

function calculateSkillSegments(): SkillSegment[] {
  const segments: SkillSegment[] = [];
  let currentAngle = 0;
  
  skillCategories.forEach((category) => {
    const categoryAngle = 360 / skillCategories.length;
    
    category.skills.forEach((skill, index) => {
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
}

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  
  return [
    "M", start.x, start.y,
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
    "L", x, y,
    "Z"
  ].join(" ");
}

function describeDonutSegment(
  x: number, 
  y: number, 
  innerRadius: number, 
  outerRadius: number, 
  startAngle: number, 
  endAngle: number
) {
  const startOuter = polarToCartesian(x, y, outerRadius, endAngle);
  const endOuter = polarToCartesian(x, y, outerRadius, startAngle);
  const startInner = polarToCartesian(x, y, innerRadius, endAngle);
  const endInner = polarToCartesian(x, y, innerRadius, startAngle);
  
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  
  return [
    "M", startOuter.x, startOuter.y,
    "A", outerRadius, outerRadius, 0, largeArcFlag, 0, endOuter.x, endOuter.y,
    "L", endInner.x, endInner.y,
    "A", innerRadius, innerRadius, 0, largeArcFlag, 1, startInner.x, startInner.y,
    "Z"
  ].join(" ");
}

export function Skills() {
  const [hoveredSkill, setHoveredSkill] = useState<SkillSegment | null>(null);
  const segments = calculateSkillSegments();
  const centerX = 200;
  const centerY = 200;
  const innerRadius = 80;
  const maxOuterRadius = 180;

  return (
    <section className="py-24 md:py-32 bg-[var(--color-bg-secondary)]">
      <Container>
        <FadeIn className="mb-16 text-center">
          <h2 className="text-[var(--color-text-primary)] mb-4">Skills & Expertise</h2>
          <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto text-lg">
            Teknoloji tekerleğim - Her dilim bir yetkinliği temsil eder. Üzerine gelerek detayları gör.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Wheel Visualization */}
          <FadeIn>
            <div className="relative flex justify-center">
              <svg 
                width="400" 
                height="400" 
                viewBox="0 0 400 400"
                className="transform -rotate-90"
              >
                {/* Background circle */}
                <circle
                  cx={centerX}
                  cy={centerY}
                  r={maxOuterRadius}
                  fill="none"
                  stroke="var(--color-bg-tertiary)"
                  strokeWidth="1"
                />
                
                {/* Skill segments */}
                {segments.map((segment, index) => {
                  const outerRadius = innerRadius + (segment.level / 100) * (maxOuterRadius - innerRadius);
                  const isHovered = hoveredSkill?.name === segment.name;
                  
                  return (
                    <motion.path
                      key={segment.name}
                      d={describeDonutSegment(
                        centerX, 
                        centerY, 
                        innerRadius, 
                        outerRadius, 
                        segment.startAngle, 
                        segment.endAngle - 1
                      )}
                      fill={segment.color}
                      fillOpacity={isHovered ? 1 : 0.7}
                      stroke="var(--color-bg-secondary)"
                      strokeWidth="2"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ ...springPresets.gentle, delay: index * 0.05 }}
                      onMouseEnter={() => setHoveredSkill(segment)}
                      onMouseLeave={() => setHoveredSkill(null)}
                      style={{ cursor: "pointer" }}
                      whileHover={{ scale: 1.02 }}
                    />
                  );
                })}
                
                {/* Center circle with total average */}
                <circle
                  cx={centerX}
                  cy={centerY}
                  r={innerRadius - 5}
                  fill="var(--color-bg-primary)"
                  stroke="var(--color-border)"
                  strokeWidth="2"
                />
                
                {/* Center text */}
                <text
                  x={centerX}
                  y={centerY - 10}
                  textAnchor="middle"
                  fill="var(--color-text-secondary)"
                  fontSize="12"
                  className="transform rotate-90"
                >
                  Ortalama
                </text>
                <text
                  x={centerX}
                  y={centerY + 20}
                  textAnchor="middle"
                  fill="var(--color-text-primary)"
                  fontSize="28"
                  fontWeight="bold"
                  className="transform rotate-90"
                >
                  {Math.round(segments.reduce((acc, s) => acc + s.level, 0) / segments.length)}%
                </text>
              </svg>

              {/* Legend */}
              <div className="absolute -right-4 top-1/2 -translate-y-1/2 hidden lg:block">
                <div className="space-y-4">
                  {skillCategories.map((category) => (
                    <div key={category.category} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-sm text-[var(--color-text-secondary)]">
                        {category.category}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Skill Details */}
          <FadeIn delay={0.2}>
            <div className="space-y-6">
              {hoveredSkill ? (
                <motion.div
                  key={hoveredSkill.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={springPresets.gentle}
                  className="bg-[var(--color-bg-primary)] rounded-2xl p-6 border border-[var(--color-border)]"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: hoveredSkill.color }}
                    />
                    <span className="text-sm text-[var(--color-text-muted)] uppercase tracking-wider">
                      {hoveredSkill.category}
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
                    {hoveredSkill.name}
                  </h3>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex-1 h-3 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: hoveredSkill.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${hoveredSkill.level}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                    <span className="text-lg font-bold text-[var(--color-text-primary)]">
                      {hoveredSkill.level}%
                    </span>
                  </div>
                  
                  <p className="text-[var(--color-text-secondary)] italic">
                    &ldquo;{hoveredSkill.justification}&rdquo;
                  </p>
                </motion.div>
              ) : (
                <div className="bg-[var(--color-bg-primary)] rounded-2xl p-6 border border-[var(--color-border)] text-center">
                  <p className="text-[var(--color-text-muted)]">
                    Tekerlek üzerinde bir dilime gelerek detayları görüntüleyin
                  </p>
                </div>
              )}

              {/* Category breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {skillCategories.map((category) => {
                  const avgLevel = Math.round(
                    category.skills.reduce((acc, s) => acc + s.level, 0) / category.skills.length
                  );
                  
                  return (
                    <motion.div
                      key={category.category}
                      className="bg-[var(--color-bg-primary)] rounded-xl p-4 border border-[var(--color-border)]"
                      whileHover={{ y: -2 }}
                      transition={springPresets.quick}
                    >
                      <div 
                        className="w-8 h-8 rounded-lg mb-3 flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: category.color }}
                      >
                        {category.category[0]}
                      </div>
                      <h4 className="font-semibold text-[var(--color-text-primary)] mb-1">
                        {category.category}
                      </h4>
                      <p className="text-2xl font-bold" style={{ color: category.color }}>
                        {avgLevel}%
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)] mt-1">
                        {category.skills.length} teknoloji
                      </p>
                    </motion.div>
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
