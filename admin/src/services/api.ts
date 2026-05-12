import axios from 'axios';

const BASE_URL =
  (import.meta as ImportMeta & { env?: Record<string, string> }).env?.VITE_API_BASE_URL || '/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default api;

// Admin API endpoints
export const adminApi = {
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
    ban: (userId: string, reason: string) =>
      api.patch(`/admin/users/${userId}/ban`, { reason }),
    unban: (userId: string, note?: string) =>
      api.patch(`/admin/users/${userId}/unban`, { note }),
  },

  // Financial management
  financials: {
    overview: (params?: { startDate?: Date; endDate?: Date }) =>
      api.get('/admin/financials/overview', { params }),
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
    artistFinancials: (artistId: string) =>
      api.get(`/admin/financials/artists/${artistId}`),
  },

  // Platform settings
  settings: {
    get: () => api.get('/admin/settings'),
    update: (data: {
      commissionRate?: number;
      minSongPrice?: number;
      maxSongPrice?: number;
      artistSubscriptionPrice?: number;
      withdrawalFeeRate?: number;
      minWithdrawalAmount?: number;
    }) => api.patch('/admin/settings', data),
  },

  // Genre management
  genres: {
    create: (data: { name: string; slug: string }) =>
      api.post('/admin/genres', data),
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
    }) => api.get('/admin/reports', { params }),
    update: (
      reportId: string,
      data: {
        status: 'pending' | 'resolved' | 'dismissed';
        resolution?: string;
        removeContent?: boolean;
      },
    ) => api.patch(`/admin/reports/${reportId}`, data),
  },
};

