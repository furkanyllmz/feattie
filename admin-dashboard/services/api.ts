import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = 'http://localhost:5078';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true, // JWT cookie için
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // ============== AUTH ==============
  async login(email: string, password: string) {
    const response = await this.api.post('/api/auth/login', { email, password });
    return response.data;
  }

  async register(email: string, password: string, firstName: string, lastName: string) {
    const response = await this.api.post('/api/auth/register', {
      email,
      password,
      firstName,
      lastName,
    });
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

  // ============== USERS ==============
  async getUsers() {
    const response = await this.api.get('/api/auth/admin/users');
    return response.data;
  }

  async createUser(data: any) {
    const response = await this.api.post('/api/auth/admin/users', data);
    return response.data;
  }

  async updateUser(userId: number, data: any) {
    const response = await this.api.put(`/api/auth/admin/users/${userId}`, data);
    return response.data;
  }

  async deleteUser(userId: number) {
    const response = await this.api.delete(`/api/auth/admin/users/${userId}`);
    return response.data;
  }

  async banUser(userId: number, reason: string, expiresAt?: string) {
    const response = await this.api.post(`/api/auth/admin/users/${userId}/ban`, {
      reason,
      expiresAt,
    });
    return response.data;
  }

  async unbanUser(userId: number) {
    const response = await this.api.post(`/api/auth/admin/users/${userId}/unban`);
    return response.data;
  }

  // ============== TENANTS ==============
  async getTenants() {
    const response = await this.api.get('/api/tenant');
    return response.data;
  }

  async getUserTenants() {
    const response = await this.api.get('/api/tenant/user/tenants');
    return response.data;
  }

  async getTenant(tenantId: number) {
    const response = await this.api.get(`/api/tenant/${tenantId}`);
    return response.data;
  }

  async createTenant(data: any) {
    const response = await this.api.post('/api/tenant', data);
    return response.data;
  }

  async updateTenant(tenantId: number, data: any) {
    const response = await this.api.put(`/api/tenant/${tenantId}`, data);
    return response.data;
  }

  async deleteTenant(tenantId: number) {
    const response = await this.api.delete(`/api/tenant/${tenantId}`);
    return response.data;
  }

  async getTenantStats(tenantId: number) {
    const response = await this.api.get(`/api/tenant/${tenantId}/stats`);
    return response.data;
  }

  async syncProducts(tenantId: number, fullSync: boolean = false) {
    const response = await this.api.post(`/api/tenant/${tenantId}/sync`, { fullSync });
    return response.data;
  }

  async generateEmbeddings(tenantId: number, regenerate: boolean = false) {
    const response = await this.api.post(`/api/tenant/${tenantId}/embeddings`, { regenerate });
    return response.data;
  }

  // ============== TENANT USERS ==============
  async getTenantUsers(tenantId: number) {
    const response = await this.api.get(`/api/tenant/${tenantId}/users`);
    return response.data;
  }

  async addUserToTenant(tenantId: number, userId: number, role: string) {
    const response = await this.api.post(`/api/tenant/${tenantId}/users`, {
      userId,
      role,
    });
    return response.data;
  }

  async removeUserFromTenant(tenantId: number, tenantUserId: number) {
    const response = await this.api.delete(`/api/tenant/${tenantId}/users/${tenantUserId}`);
    return response.data;
  }

  // ============== TENANT SETTINGS ==============
  async getTenantSettings(tenantId: number) {
    const response = await this.api.get(`/api/tenant/${tenantId}/settings`);
    return response.data;
  }

  async updateTenantSettings(tenantId: number, data: any) {
    const response = await this.api.put(`/api/tenant/${tenantId}/settings`, data);
    return response.data;
  }

  // ============== RAG CONFIGURATION ==============
  async getRAGConfig(tenantId: number) {
    const response = await this.api.get(`/api/ragconfiguration/${tenantId}`);
    return response.data;
  }

  async updateRAGConfig(tenantId: number, data: any) {
    const response = await this.api.put(`/api/ragconfiguration/${tenantId}`, data);
    return response.data;
  }

  // ============== CHAT ==============
  async sendChatMessage(tenantId: number, message: string, sessionId?: string) {
    const response = await this.api.post('/api/chat/message', {
      tenantId,
      message,
      sessionId,
    });
    return response.data;
  }

  async getChatHistory(sessionId: string) {
    const response = await this.api.get(`/api/chat/history/${sessionId}`);
    return response.data;
  }

  // ============== PRODUCTS ==============
  async searchProducts(tenantId: number, query: string) {
    const response = await this.api.post('/api/product/search', {
      tenantId,
      query,
    });
    return response.data;
  }
}

export default new ApiService();
