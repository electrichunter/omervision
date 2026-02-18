import { Project, BlogPost, Skill } from "@/types";

export const projects: Project[] = [
  {
    id: "1",
    slug: "ecommerce-platform",
    title: "E-Commerce Platform",
    description: "A full-stack e-commerce solution with real-time inventory, payment processing, and admin dashboard.",
    longDescription: `
      Built a comprehensive e-commerce platform from scratch, handling everything from product management 
      to payment processing. The platform supports multiple vendors, real-time inventory tracking, and 
      advanced analytics for store owners.
      
      Key features include:
      - Real-time inventory management
      - Stripe payment integration
      - Multi-vendor support
      - Advanced analytics dashboard
      - Mobile-first responsive design
    `,
    thumbnail: "/images/projects/ecommerce.jpg",
    images: ["/images/projects/ecommerce-1.jpg", "/images/projects/ecommerce-2.jpg"],
    technologies: ["Next.js", "TypeScript", "Prisma", "PostgreSQL", "Stripe", "Tailwind CSS"],
    githubUrl: "https://github.com",
    liveUrl: "https://example.com",
    featured: true,
    category: "Full Stack",
    year: "2024",
  },
  {
    id: "2",
    slug: "ai-dashboard",
    title: "AI Analytics Dashboard",
    description: "Real-time data visualization platform powered by machine learning insights and predictive analytics.",
    longDescription: `
      Developed an analytics dashboard that leverages machine learning to provide predictive insights 
      and anomaly detection. The platform processes millions of data points in real-time and presents 
      them through interactive visualizations.
      
      Key features include:
      - Real-time data streaming
      - ML-powered predictions
      - Interactive charts and graphs
      - Custom report builder
      - Role-based access control
    `,
    thumbnail: "/images/projects/dashboard.jpg",
    images: ["/images/projects/dashboard-1.jpg"],
    technologies: ["React", "Python", "TensorFlow", "D3.js", "FastAPI", "Redis"],
    githubUrl: "https://github.com",
    liveUrl: "https://example.com",
    featured: true,
    category: "Data Visualization",
    year: "2024",
  },
  {
    id: "3",
    slug: "design-system",
    title: "Design System",
    description: "A comprehensive component library and design system for enterprise applications with accessibility focus.",
    longDescription: `
      Created a scalable design system used across multiple products in the organization. The system 
      includes 50+ components, comprehensive documentation, and theming capabilities.
      
      Key features include:
      - 50+ accessible components
      - Dark/light theme support
      - Comprehensive documentation
      - Figma design tokens
      - Automated testing
    `,
    thumbnail: "/images/projects/design-system.jpg",
    images: ["/images/projects/design-system-1.jpg"],
    technologies: ["React", "Storybook", "TypeScript", "CSS Modules", "Jest", "Rollup"],
    githubUrl: "https://github.com",
    liveUrl: "https://example.com",
    featured: true,
    category: "UI/UX",
    year: "2023",
  },
  {
    id: "4",
    slug: "mobile-app",
    title: "Fitness Tracking App",
    description: "Cross-platform mobile application for tracking workouts, nutrition, and health metrics.",
    longDescription: `
      Built a React Native app that helps users track their fitness journey. The app syncs with 
      wearable devices and provides personalized workout recommendations.
      
      Key features include:
      - Wearable device integration
      - Workout tracking
      - Nutrition logging
      - Social features
      - Offline support
    `,
    thumbnail: "/images/projects/fitness.jpg",
    images: ["/images/projects/fitness-1.jpg"],
    technologies: ["React Native", "TypeScript", "Node.js", "MongoDB", "GraphQL", "Firebase"],
    githubUrl: "https://github.com",
    featured: false,
    category: "Mobile",
    year: "2023",
  },
  {
    id: "5",
    slug: "blockchain-explorer",
    title: "Blockchain Explorer",
    description: "Web3 interface for exploring blockchain transactions, smart contracts, and wallet analytics.",
    longDescription: `
      Developed a blockchain explorer that makes Web3 data accessible to everyday users. The platform 
      provides real-time transaction monitoring and smart contract interaction.
      
      Key features include:
      - Multi-chain support
      - Real-time transaction monitoring
      - Smart contract interaction
      - Wallet portfolio tracking
      - DeFi protocol integration
    `,
    thumbnail: "/images/projects/blockchain.jpg",
    images: ["/images/projects/blockchain-1.jpg"],
    technologies: ["Next.js", "Web3.js", "Ethers.js", "The Graph", "Solidity", "Tailwind"],
    githubUrl: "https://github.com",
    featured: false,
    category: "Web3",
    year: "2024",
  },
];

export const blogPosts: BlogPost[] = [
  {
    id: "1",
    slug: "modern-react-patterns",
    title: "Modern React Patterns in 2024",
    excerpt: "Exploring the latest patterns and best practices for building scalable React applications with Server Components and Suspense.",
    content: `
      React has evolved significantly with the introduction of Server Components and the new App Router. 
      In this post, we'll explore modern patterns that help build more performant and maintainable applications.
      
      ## Server Components
      
      Server Components allow us to render components on the server, reducing the JavaScript bundle size 
      and improving initial page load performance.
      
      ## Suspense Boundaries
      
      Proper use of Suspense boundaries helps create better loading states and improves the perceived 
      performance of your application.
    `,
    date: "2024-01-15",
    readingTime: "8 min read",
    tags: ["React", "Next.js", "Performance"],
    featured: true,
    coverImage: "/images/blog/react-patterns.jpg",
  },
  {
    id: "2",
    slug: "typescript-tips",
    title: "Advanced TypeScript Tips for Better Code",
    excerpt: "Level up your TypeScript skills with these advanced techniques for type safety and developer experience.",
    content: `
      TypeScript is more than just adding types to JavaScript. When used effectively, it can catch bugs 
      before they reach production and make refactoring a breeze.
      
      ## Conditional Types
      
      Conditional types allow you to create flexible type definitions that adapt based on input types.
      
      ## Template Literal Types
      
      Template literal types bring the power of string manipulation to TypeScript's type system.
    `,
    date: "2024-01-08",
    readingTime: "6 min read",
    tags: ["TypeScript", "JavaScript"],
    featured: true,
    coverImage: "/images/blog/typescript.jpg",
  },
  {
    id: "3",
    slug: "building-design-systems",
    title: "Building Design Systems That Scale",
    excerpt: "A comprehensive guide to creating and maintaining design systems for enterprise applications.",
    content: `
      Design systems are essential for maintaining consistency across large applications. Here's how to 
      build one that grows with your organization.
      
      ## Component Architecture
      
      Start with a solid foundation of primitive components that can be composed into complex UIs.
      
      ## Documentation Strategy
      
      Good documentation is crucial for adoption. Invest in tools like Storybook to showcase your components.
    `,
    date: "2023-12-20",
    readingTime: "10 min read",
    tags: ["Design Systems", "UI/UX", "React"],
    featured: true,
    coverImage: "/images/blog/design-systems.jpg",
  },
  {
    id: "4",
    slug: "performance-optimization",
    title: "Web Performance Optimization Guide",
    excerpt: "Practical techniques for improving Core Web Vitals and delivering lightning-fast user experiences.",
    content: `
      Performance is a feature. Learn how to optimize your web applications for speed and user satisfaction.
      
      ## Core Web Vitals
      
      Understanding LCP, FID, and CLS is essential for measuring and improving performance.
      
      ## Image Optimization
      
      Images are often the largest assets on a page. Use modern formats and lazy loading techniques.
    `,
    date: "2023-12-10",
    readingTime: "7 min read",
    tags: ["Performance", "Web Vitals"],
    featured: false,
    coverImage: "/images/blog/performance.jpg",
  },
  {
    id: "5",
    slug: "state-management-2024",
    title: "State Management in 2024",
    excerpt: "Comparing modern state management solutions and when to use each one in your React applications.",
    content: `
      The state management landscape has evolved. From Redux to Zustand to React's built-in solutions, 
      let's explore what works best for different scenarios.
      
      ## Server State vs Client State
      
      Understanding the distinction helps choose the right tool for the job.
      
      ## Local State Patterns
      
      Sometimes the simplest solution is the best. Don't over-engineer your state management.
    `,
    date: "2023-11-28",
    readingTime: "9 min read",
    tags: ["React", "State Management"],
    featured: false,
    coverImage: "/images/blog/state-management.jpg",
  },
];

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

export const skillCategories: SkillCategory[] = [
  {
    category: "Frontend",
    color: "#3b82f6",
    skills: [
      { name: "React / Next.js", level: 90, justification: "Tekerlekteki en geniş dilimlerden biri, uzmanlık seviyen yüksek." },
      { name: "TypeScript", level: 85, justification: "Mevcut projelerindeki tip güvenliği kullanım oranına dayanarak." },
      { name: "Tailwind CSS", level: 95, justification: "UI Development ve CSS Styling alanındaki görsel hakimiyetin." },
    ],
  },
  {
    category: "Backend",
    color: "#8b5cf6",
    skills: [
      { name: "Python (FastAPI)", level: 80, justification: "Aktif projelerin ve backend tarafındaki baskınlığın." },
      { name: "Node.js (Express)", level: 75, justification: "Tekerlekteki JWT ve RESTful dilimlerinin büyüklüğü." },
      { name: "PostgreSQL / SQL", level: 80, justification: "Veri tabanı şeması oluşturma ve yönetim becerin." },
      { name: ".NET", level: 80, justification: "Enterprise projelerdeki deneyim ve güçlü backend yetkinliği." },
    ],
  },
  {
    category: "DevOps",
    color: "#06b6d4",
    skills: [
      { name: "Docker", level: 75, justification: "\"Sistem hasarına yol açabilecek uygulama\" uyarısını düzeltme potansiyelinle." },
      { name: "AWS / Cloud", level: 60, justification: "Henüz gelişmekte olan, giriş seviyesi bulut tecrüben." },
    ],
  },
];

// Backward compatibility
export const skills: Skill[] = [
  { name: "React / Next.js", level: 90, category: "Frontend" },
  { name: "TypeScript", level: 85, category: "Frontend" },
  { name: "Tailwind CSS", level: 95, category: "Frontend" },
  { name: "Python (FastAPI)", level: 80, category: "Backend" },
  { name: "Node.js (Express)", level: 75, category: "Backend" },
  { name: "PostgreSQL / SQL", level: 80, category: "Backend" },
  { name: ".NET", level: 80, category: "Backend" },
  { name: "Docker", level: 75, category: "DevOps" },
  { name: "AWS / Cloud", level: 60, category: "DevOps" },
];
