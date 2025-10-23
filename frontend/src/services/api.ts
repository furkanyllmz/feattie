import axios, { type AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5078';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true, // Important for cookie-based JWT
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Redirect to login if unauthorized
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // === AUTH ===
  async login(email: string, password: string) {
    const response = await this.api.post('/api/auth/login', { email, password });
    return response.data;
  }

  async logout() {
    const response = await this.api.post('/api/auth/logout');
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.api.get('/api/auth/me');
    return response.data;
  }

  // === TENANTS ===
  async getTenants(params?: { isActive?: boolean; page?: number; pageSize?: number }) {
    const response = await this.api.get('/api/tenant', { params });
    return response.data;
  }

  async getTenant(id: number) {
    const response = await this.api.get(`/api/tenant/${id}`);
    return response.data;
  }

  async createTenant(data: {
    name: string;
    slug: string;
    shopifyStoreUrl: string;
    shopifyAccessToken?: string;
    maxProducts?: number;
  }) {
    const response = await this.api.post('/api/tenant', data);
    return response.data;
  }

  async updateTenant(id: number, data: any) {
    const response = await this.api.put(`/api/tenant/${id}`, data);
    return response.data;
  }

  async deleteTenant(id: number, permanent = false) {
    const response = await this.api.delete(`/api/tenant/${id}`, {
      params: { permanent },
    });
    return response.data;
  }

  async getTenantStats(id: number) {
    const response = await this.api.get(`/api/tenant/${id}/stats`);
    return response.data;
  }

  // === CONTEXTS ===
  async getContexts(tenantId: number, params?: { isActive?: boolean; type?: string }) {
    const response = await this.api.get(`/api/tenants/${tenantId}/context`, { params });
    return response.data;
  }

  async createContext(tenantId: number, data: {
    title: string;
    slug: string;
    content: string;
    type: string;
    triggerKeywords?: string[];
    alwaysInclude?: boolean;
    priority?: number;
  }) {
    const response = await this.api.post(`/api/tenants/${tenantId}/context`, data);
    return response.data;
  }

  async updateContext(tenantId: number, id: number, data: any) {
    const response = await this.api.put(`/api/tenants/${tenantId}/context/${id}`, data);
    return response.data;
  }

  async deleteContext(tenantId: number, id: number) {
    const response = await this.api.delete(`/api/tenants/${tenantId}/context/${id}`);
    return response.data;
  }

  // === RAG CONFIGURATION ===
  async getRAGConfig(tenantId: number) {
    const response = await this.api.get(`/api/tenants/${tenantId}/rag-config`);
    return response.data;
  }

  async createRAGConfig(tenantId: number, data: any) {
    const response = await this.api.post(`/api/tenants/${tenantId}/rag-config`, data);
    return response.data;
  }

  async updateRAGConfig(tenantId: number, data: any) {
    const response = await this.api.put(`/api/tenants/${tenantId}/rag-config`, data);
    return response.data;
  }

  // === PRODUCTS ===
  async getProducts(tenantId: number, params?: { hasEmbedding?: boolean; page?: number; pageSize?: number }) {
    const response = await this.api.get(`/api/tenants/${tenantId}/products`, { params });
    return response.data;
  }

  async syncProducts(tenantId: number, forceResync = false) {
    const response = await this.api.post(`/api/tenants/${tenantId}/products/sync`, { forceResync });
    return response.data;
  }

  async generateEmbeddings(tenantId: number, forceRegenerate = false) {
    const response = await this.api.post(`/api/tenants/${tenantId}/products/generate-embeddings`, {
      forceRegenerate,
    });
    return response.data;
  }

  async getProductStats(tenantId: number) {
    const response = await this.api.get(`/api/tenants/${tenantId}/products/stats`);
    return response.data;
  }

  // === CHAT (for testing) ===
  async sendChatMessage(tenantId: number, query: string, sessionId?: string) {
    const response = await this.api.post(`/api/chat/${tenantId}`, {
      query,
      sessionId,
      topK: 3,
    });
    return response.data;
  }

  // === TENANT SETTINGS ===
  async getTenantSettings(tenantId: number) {
    const response = await this.api.get(`/api/tenants/${tenantId}/settings`);
    return response.data;
  }

  async updateTenantSettings(tenantId: number, data: any) {
    const response = await this.api.put(`/api/tenants/${tenantId}/settings`, data);
    return response.data;
  }

  async getEmbedCode(tenantId: number) {
    const response = await this.api.get(`/api/tenants/${tenantId}/settings/embed-code`);
    return response.data;
  }
}

export const api = new ApiService();
export default api;
