import { BlogPost, Project, SystemStatus } from "@/types";

const isServer = typeof window === 'undefined';
const API_URL = isServer
  ? (process.env.INTERNAL_API_URL || 'http://backend:8000')
  : ''; // Use relative path for client-side to leverage Next.js rewrites

console.log('Configured API_URL:', API_URL);

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_URL}${endpoint}`;
    console.log(`API Request: ${options.method || 'GET'} ${url}`);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error occurred' }));
        console.error(`API Error ${response.status}:`, error);
        throw new Error(error.detail || response.statusText);
      }

      return response.json();
    } catch (error) {
      console.error(`API Network Error for ${url}:`, error);
      throw error;
    }
  }

  // Auth
  async login(credentials: any) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: any) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getCurrentUser() {
    return this.request('/api/users/me');
  }

  async logout() {
    return this.request('/api/auth/logout', { method: 'POST' });
  }

  private mapProject(p: any): Project {
    return {
      id: String(p.id),
      slug: p.slug || p.id.toString(),
      title: p.title,
      description: p.excerpt || "",
      longDescription: p.longDescription || p.excerpt || "",
      thumbnail: p.image || "",
      images: p.images ? p.images : [p.image].filter(Boolean),
      technologies: Array.isArray(p.tags) ? p.tags : (p.tags?.split(',').map((s: string) => s.trim()) || []),
      githubUrl: p.githubUrl,
      liveUrl: p.href,
      featured: p.featured || false,
      category: p.category || "Project",
      year: p.date ? new Date(p.date).getFullYear().toString() : new Date().getFullYear().toString(),
    };
  }

  private mapBlogPost(b: any): BlogPost {
    return {
      id: String(b.id),
      slug: b.slug || b.id.toString(),
      title: b.title,
      excerpt: b.excerpt || "",
      content: b.content || "",
      date: b.date || new Date().toISOString(),
      readingTime: b.readingTime || "5 min read",
      tags: Array.isArray(b.tags) ? b.tags : (b.tags?.split(',').map((s: string) => s.trim()) || []),
      featured: b.featured || false,
      coverImage: b.image,
    };
  }

  // Projects
  async getProjects(cursor?: number, limit: number = 10): Promise<Project[]> {
    const url = `/api/projects?limit=${limit}${cursor ? `&cursor=${cursor}` : ''}`;
    const data = await this.request<any[]>(url);
    return data.map(this.mapProject);
  }

  async getBlogs(cursor?: number, limit: number = 10): Promise<BlogPost[]> {
    const url = `/api/blogs?limit=${limit}${cursor ? `&cursor=${cursor}` : ''}`;
    const data = await this.request<any[]>(url);
    return data.map(this.mapBlogPost);
  }

  async getProjectBySlug(slug: string): Promise<Project> {
    const data = await this.request<any>(`/api/projects/${slug}`);
    return this.mapProject(data);
  }

  async getBlogBySlug(slug: string): Promise<BlogPost> {
    const data = await this.request<any>(`/api/blogs/${slug}`);
    return this.mapBlogPost(data);
  }

  async getSkills(): Promise<any[]> {
    return this.request<any[]>('/api/skills');
  }

  // Search
  async search(query: string) {
    const data = await this.request<any>(`/api/search?q=${encodeURIComponent(query)}`);
    return {
      blogs: data.blogs?.map(this.mapBlogPost) || [],
      projects: data.projects?.map(this.mapProject) || [],
    };
  }

  // Admin / Development
  async getSystemStatus(): Promise<SystemStatus> {
    return this.request<SystemStatus>('/api/admin/system-status');
  }

  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) throw new Error('Upload failed');
    return response.json();
  }
}

export const api = new ApiClient();
