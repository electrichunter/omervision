import { BlogPost, Project, SystemStatus } from "@/types";

const isServer = typeof window === 'undefined';
const API_URL = isServer
  ? (process.env.INTERNAL_API_URL || 'http://backend:8000')
  : ''; // Use relative path for client-side to leverage Next.js rewrites

class ApiClient {
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = `${API_URL}${endpoint}`;
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
    });
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_URL}${endpoint}`;

    try {
      let response = await this.makeRequest(endpoint, options);

      // If 401, try to refresh the token and retry ONCE 
      if (response.status === 401 && !isServer) {
        const refreshed = await this.tryRefreshToken();
        if (refreshed) {
          // Retry the original request with the new token
          response = await this.makeRequest(endpoint, options);
        }
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error occurred' }));
        throw new Error(error.detail || response.statusText);
      }

      return response.json();
    } catch (error) {
      throw error;
    }
  }

  private async tryRefreshToken(): Promise<boolean> {
    // If already refreshing, wait for the existing refresh attempt
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        const response = await fetch(`${API_URL}/api/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        return response.ok;
      } catch {
        return false;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
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

    if (!response.ok) {
      throw new Error('Upload failed');
    }
    return response.json();
  }

  async createBlog(data: any): Promise<BlogPost> {
    const res = await this.request<any>('/api/blogs', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return this.mapBlogPost(res);
  }

  async getComments(postType: string, postId: number) {
    return this.request<any>(`/api/comments/${postType}/${postId}`);
  }

  async getAdminComments(status?: 'pending' | 'approved') {
    const qs = status ? `?status=${status}` : '';
    return this.request<any[]>(`/api/admin/comments${qs}`);
  }

  async approveComment(id: number) {
    return this.request(`/api/comments/${id}/approve`, { method: 'PUT' });
  }

  async deleteComment(id: number) {
    return this.request(`/api/comments/${id}`, { method: 'DELETE' });
  }

  async toggleMaintenance(enable: boolean) {
    return this.request(`/api/admin/maintenance?enable=${enable}`, { method: 'POST' });
  }
}

export const api = new ApiClient();
