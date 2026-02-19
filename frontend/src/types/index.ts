export interface Project {
  id: string;
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  thumbnail: string;
  images: string[];
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  featured: boolean;
  category: string;
  year: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  readingTime: string;
  tags: string[];
  featured: boolean;
  coverImage?: string;
}

export interface Skill {
  name: string;
  level: number;
  category: string;
}

export interface SkillDetail {
  name: string;
  level: number;
  justification: string;
}

export interface SkillCategory {
  category: string;
  skills: SkillDetail[];
  color: string;
}

export interface NavItem {
  name: string;
  href: string;
}

export interface SocialLink {
  name: string;
  href: string;
  icon: string;
}

export interface SystemStatus {
  cpu: number;
  memory: number;
  disk: number;
  uptime: number;
}
