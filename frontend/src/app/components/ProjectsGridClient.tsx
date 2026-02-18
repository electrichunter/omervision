"use client";
import React, { useEffect, useState } from 'react';

type Project = {
  id: string;
  title: string;
  image: string;
  tags: string[];
  date?: string;
  author?: string;
  href?: string;
  excerpt?: string;
};

export default function ProjectsGridClient() {
  const [projects, setProjects] = useState<Project[]>([]);
  useEffect(() => {
    fetch('http://localhost:8000/api/projects')
      .then((res) => res.json())
      .then((data) => setProjects(data as Project[]))
      .catch(() => setProjects([]));
  }, []);

  if (!projects.length) {
    return null; // hide until loaded to avoid layout shift
  }

  return (
    <section aria-label="Latest Work (Dynamic)" className="my-12">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Latest Work</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((p) => (
          <article key={p.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="relative w-full h-48 overflow-hidden">
              <img src={p.image} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div className="p-6">
              <div className="flex flex-wrap gap-2 mb-2">
                {p.tags.map((t) => (
                  <span key={t} className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-600">{t}</span>
                ))}
              </div>
              <h3 className="text-lg font-semibold clamp-2">{p.title}</h3>
              {p.excerpt && <p className="mt-2 text-sm text-gray-600">{p.excerpt}</p>}
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-gray-500">{p.date ?? ''}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
