import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5243'

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname
      if (!currentPath.includes('/auth/login')) {
        window.location.href = '/auth/login'
      }
    }
    return Promise.reject(error)
  }
)

export interface User {
  id: number
  email: string
  firstName?: string
  lastName?: string
  role: number
  emailVerified?: boolean
  createdAt: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  firstName?: string
  lastName?: string
}

export interface DashboardStats {
  totalUsers: number
  activeUsers: number
  bannedUsers: number
  adminUsers: number
  recentUsers: number
  todayLogins: number
}

export interface UserListItem {
  id: number
  email: string
  fullName: string
  role: string
  roleNumber: number
  status: string
  isBanned: boolean
  banReason?: string
  banExpires?: string
  lastLogin?: string
  createdAt: string
}

export interface UsersListResponse {
  users: UserListItem[]
  pagination: {
    page: number
    pageSize: number
    totalCount: number
    totalPages: number
  }
}

export interface TenantListItem {
  id: number
  name: string
  slug: string
  isActive: boolean
  productCount: number
  lastProductSync?: string
  createdAt: string
}

export interface TenantDetails {
  id: number
  name: string
  slug: string
  shopifyStoreUrl: string
  isActive: boolean
  subscriptionExpires?: string
  maxProducts?: number
  productCount: number
  lastProductSync?: string
  createdAt: string
  updatedAt: string
  hasRAGConfiguration: boolean
  embeddingsGeneratedCount: number
  embeddingsStatus: "idle" | "partial" | "completed"
}

export interface CreateTenantRequest {
  Name: string
  Slug: string
  ShopifyStoreUrl: string
  ShopifyAccessToken: string
  MaxProducts?: number
}

export interface UpdateTenantRequest {
  name?: string
  shopifyStoreUrl?: string
  shopifyAccessToken?: string
  isActive?: boolean
  maxProducts?: number
}

export interface UserTenant {
  id: number
  name: string
  slug: string
  isActive: boolean
  productCount: number
  lastProductSync?: string
  createdAt: string
  role: string
  roleNumber: number
  joinedAt: string
}

export const authApi = {
  login: (credentials: LoginCredentials) =>
    api.post('/auth/login', credentials),

  register: (data: RegisterData) =>
    api.post('/auth/register', data),

  logout: () =>
    api.post('/auth/logout'),

  getMe: () =>
    api.get<User>('/auth/me'),

  getMyTenants: () =>
    api.get<UserTenant[]>('/auth/me/tenants'),

  getDashboard: () =>
    api.get<DashboardStats>('/auth/admin/dashboard'),

  getUsers: (params?: { search?: string; page?: number; pageSize?: number }) =>
    api.get<UsersListResponse>('/auth/admin/users', { params }),

  updateUserRole: (userId: number, role: number) =>
    api.put(`/auth/admin/users/${userId}/role`, { role }),

  banUser: (userId: number, reason: string, durationDays: number = 0) =>
    api.post(`/auth/admin/users/${userId}/ban`, { reason, durationDays }),

  unbanUser: (userId: number) =>
    api.post(`/auth/admin/users/${userId}/unban`),

  getUserTenants: (userId: number) =>
    api.get<UserTenant[]>(`/auth/admin/users/${userId}/tenants`),

  assignUserToTenant: (userId: number, tenantId: number, role: number = 0) =>
    api.post(`/auth/admin/users/${userId}/tenants/${tenantId}`, { role }),

  removeUserFromTenant: (userId: number, tenantId: number) =>
    api.delete(`/auth/admin/users/${userId}/tenants/${tenantId}`),
}

export const tenantApi = {
  getAll: (params?: { isActive?: boolean; page?: number; pageSize?: number }) =>
    api.get<TenantListItem[]>('/tenant', { params }),

  getById: (id: number) =>
    api.get<TenantDetails>(`/tenant/${id}`),

  getBySlug: (slug: string) =>
    api.get<TenantDetails>(`/tenant/by-slug/${slug}`),

  create: (data: CreateTenantRequest) =>
    api.post<TenantDetails>('/tenant', data),

  update: (id: number, data: UpdateTenantRequest) =>
    api.put<TenantDetails>(`/tenant/${id}`, data),

  delete: (id: number, permanent: boolean = false) =>
    api.delete(`/tenant/${id}`, { params: { permanent } }),

  getStats: (id: number) =>
    api.get(`/tenant/${id}/stats`),
}

export const productApi = {
  syncProducts: (tenantId: number, forceResync: boolean = false) =>
    api.post(`/tenants/${tenantId}/products/sync`, { forceResync }),

  generateEmbeddings: (tenantId: number, forceRegenerate: boolean = false) =>
    api.post(`/tenants/${tenantId}/products/generate-embeddings`, { forceRegenerate }),
}

export interface ChatMessage {
  query: string  // Backend expects 'Query' not 'message'
  sessionId?: string
  userFingerprint?: string
  topK?: number
}

export interface ChatResponse {
  sessionId: string
  response: string
  products?: Array<{
    id: number
    title: string
    price: number
    imageUrl?: string
    handle?: string
  }>
  searchQuery?: string
  processingTime: number
}

// Chat API için credentials olmadan ayrı instance (chat endpoint public, AllowAnonymous)
const chatApiInstance = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  // withCredentials: false - chat endpoint CORS policy AllowCredentials kullanmıyor
})

export const chatApi = {
  sendMessage: (tenantId: number, data: ChatMessage) =>
    chatApiInstance.post<ChatResponse>(`/chat/${tenantId}`, data),
}

export interface RAGConfiguration {
  id: number
  tenantId: number
  embeddingProvider: string
  embeddingModel: string
  hasOpenAIApiKey: boolean
  openAIEmbeddingModel?: string
  llmProvider: string
  llmModel: string
  hasLLMApiKey: boolean
  llmTemperature: number
  llmMaxTokens: number
  defaultTopK: number
  deduplicateResults: boolean
  minimumSimilarityScore: number
  language: string
  systemPrompt: string
  enableContextInjection: boolean
  enableConversationHistory: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateRAGConfigRequest {
  embeddingProvider?: string
  embeddingModel?: string
  openAIApiKey?: string
  openAIEmbeddingModel?: string
  llmProvider?: string
  llmModel?: string
  llmApiKey?: string
  llmTemperature?: number
  llmMaxTokens?: number
  defaultTopK?: number
  deduplicateResults?: boolean
  minimumSimilarityScore?: number
  language?: string
  systemPrompt?: string
  enableContextInjection?: boolean
  enableConversationHistory?: boolean
}

export interface UpdateRAGConfigRequest {
  embeddingProvider?: string
  embeddingModel?: string
  openAIApiKey?: string
  openAIEmbeddingModel?: string
  llmProvider?: string
  llmModel?: string
  llmApiKey?: string
  llmTemperature?: number
  llmMaxTokens?: number
  defaultTopK?: number
  deduplicateResults?: boolean
  minimumSimilarityScore?: number
  language?: string
  systemPrompt?: string
  enableContextInjection?: boolean
  enableConversationHistory?: boolean
}

export const ragConfigApi = {
  get: (tenantId: number) =>
    api.get<RAGConfiguration>(`/tenants/${tenantId}/rag-config`),

  create: (tenantId: number, data: CreateRAGConfigRequest) =>
    api.post<RAGConfiguration>(`/tenants/${tenantId}/rag-config`, data),

  update: (tenantId: number, data: UpdateRAGConfigRequest) =>
    api.put<RAGConfiguration>(`/tenants/${tenantId}/rag-config`, data),

  delete: (tenantId: number) =>
    api.delete(`/tenants/${tenantId}/rag-config`),
}

export interface TenantSettingsResponse {
  id: number
  tenantId: number
  brandColorPrimary: string
  brandColorSecondary: string
  widgetPosition: string
  chatTitle: string
  welcomeMessage: string
  logoUrl?: string
  avatarUrl?: string
  autoOpen: boolean
  autoOpenDelaySeconds: number
  showTypingIndicator: boolean
  enableSoundNotifications: boolean
  allowedDomains: string[]
  requireAuth: boolean
  widgetSize: string
  language: string
  timezone: string
  customCss?: string
  createdAt: string
  updatedAt: string
}

export interface UpdateTenantSettingsRequest {
  brandColorPrimary?: string
  brandColorSecondary?: string
  widgetPosition?: string
  chatTitle?: string
  welcomeMessage?: string
  logoUrl?: string
  avatarUrl?: string
  autoOpen?: boolean
  autoOpenDelaySeconds?: number
  showTypingIndicator?: boolean
  enableSoundNotifications?: boolean
  allowedDomains?: string[]
  requireAuth?: boolean
  widgetSize?: string
  language?: string
  timezone?: string
  customCss?: string
}

export const tenantSettingsApi = {
  get: (tenantId: number) =>
    api.get<TenantSettingsResponse>(`/tenants/${tenantId}/settings`),

  update: (tenantId: number, data: UpdateTenantSettingsRequest) =>
    api.put<TenantSettingsResponse>(`/tenants/${tenantId}/settings`, data),

  getEmbedCode: (tenantId: number) =>
    api.get<{ tenantSlug: string; embedCode: string; instructions: string }>(`/tenants/${tenantId}/settings/embed-code`),
}

export default api
