/**
 * TuneN2 API Endpoints
 * Centralized endpoint paths for all API calls.
 */

export const ENDPOINTS = {
  auth: {
    login: '/auth/login',
    signup: '/auth/signup',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    verifyOtp: '/auth/verify-otp',
    resendOtp: '/auth/resend-otp',
    socialAuth: '/auth/social',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },
  users: {
    me: '/users/me',
    changePassword: '/users/me/change-password',
    uploadUrl: '/users/me/upload-url',
  },
  discover: {
    feed: '/discover',
    search: '/search',
    genres: '/genres',
    genreDetail: (slug: string) => `/genres/${slug}`,
    artists: '/artists',
    recommended: '/songs/recommended',
  },
  wallet: {
    balance: '/wallet',
    transactions: '/wallet/transactions',
    withdraw: '/wallet/withdraw',
    withdrawals: '/wallet/withdrawals',
  },
} as const;
