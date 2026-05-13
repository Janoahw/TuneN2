import axios from 'axios';

// Use the Vite environment variable when set.
// For staging, set it to https://tunen2backend-staging.up.railway.app/api/v1
// For local development, use "/api/v1" and rely on the Vite proxy in vite.config.ts.
const BASE_URL =
  (import.meta as ImportMeta & { env?: Record<string, string> }).env?.VITE_API_BASE_URL ||
  '/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminRefreshToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default api;

// Admin API endpoints
export const adminApi = {
  auth: {
    login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  },

  // User management
  users: {
    list: (params?: {
      page?: number;
      limit?: number;
      search?: string;
      role?: 'fan' | 'artist' | 'admin';
      status?: 'active' | 'banned';
    }) => api.get('/admin/users', { params }),
    get: (userId: string) => api.get(`/admin/users/${userId}`),
    ban: (userId: string, reason: string) => api.patch(`/admin/users/${userId}/ban`, { reason }),
    unban: (userId: string, note?: string) => api.patch(`/admin/users/${userId}/unban`, { note }),
  },

  // Financial management
  financials: {
    overview: (params?: { startDate?: Date; endDate?: Date }) =>
      api.get('/admin/financials/overview', { params }),
    charts: (params?: { months?: number }) => api.get('/admin/financials/charts', { params }),
    transactions: (params?: {
      page?: number;
      limit?: number;
      type?: string;
      startDate?: Date;
      endDate?: Date;
      userId?: string;
    }) => api.get('/admin/financials/transactions', { params }),
    withdrawals: (params?: {
      page?: number;
      limit?: number;
      status?: 'pending' | 'completed' | 'failed';
    }) => api.get('/admin/financials/withdrawals', { params }),
    artistFinancials: (artistId: string) => api.get(`/admin/financials/artists/${artistId}`),
  },

  // Platform settings
  settings: {
    get: () => api.get('/admin/settings'),
    update: (data: {
      platformName?: string;
      supportEmail?: string;
      maxUploadSizeMb?: number;
      commissionRate?: number;
      minSongPrice?: number;
      maxSongPrice?: number;
      artistSubscriptionPrice?: number;
      withdrawalFeeRate?: number;
      minWithdrawalAmount?: number;
      autoModeration?: boolean;
      allowDownloads?: boolean;
      analyticsSync?: boolean;
      maintenanceMode?: boolean;
      signupsPerHour?: number;
      songUploadsPerMinute?: number;
      webhookTimeout?: number;
    }) => api.patch('/admin/settings', data),
  },

  // Genre management
  genres: {
    list: (params?: { page?: number; limit?: number; search?: string }) =>
      api.get('/admin/genres', { params }),
    create: (data: { name: string; slug: string }) => api.post('/admin/genres', data),
    update: (genreId: string, data: { name?: string; slug?: string }) =>
      api.patch(`/admin/genres/${genreId}`, data),
    delete: (genreId: string) => api.delete(`/admin/genres/${genreId}`),
  },

  // Content moderation (from Sprint 9)
  reports: {
    list: (params?: {
      page?: number;
      limit?: number;
      status?: 'pending' | 'resolved' | 'dismissed';
    }) => api.get('/reports/admin', { params }),
    get: (reportId: string) => api.get(`/admin/reports/${reportId}`),
    update: (reportId: string, data: { status: 'resolved' | 'dismissed'; action?: string }) =>
      api.patch(`/reports/admin/${reportId}`, data),
  },

  // Content management
  content: {
    stats: () => api.get('/admin/content/stats'),
    songs: {
      list: (params?: { page?: number; limit?: number; search?: string }) =>
        api.get('/admin/content/songs', { params }),
      get: (songId: string) => api.get(`/admin/songs/${songId}`),
    },
    artists: {
      list: (params?: { page?: number; limit?: number; search?: string }) =>
        api.get('/admin/content/artists', { params }),
    },
    withdrawals: {
      get: (withdrawalId: string) => api.get(`/admin/financials/withdrawals/${withdrawalId}`),
    },
  },

  discover: {
    feed: (limit = 10) => api.get('/discover', { params: { limit } }),
    search: (params: {
      q: string;
      type: 'all' | 'artists' | 'songs';
      page?: number;
      limit?: number;
    }) => api.get('/search', { params }),
    artists: (params?: { page?: number; limit?: number; genre?: string }) =>
      api.get('/artists', { params }),
    genres: () => api.get('/genres'),
    recommendedSongs: () => api.get('/songs/recommended'),
  },
};
