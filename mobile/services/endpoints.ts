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
    verifyEmail: '/auth/verify-email',
    resendVerification: '/auth/resend-verification',
    socialAuth: '/auth/social',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },
  users: {
    me: '/users/me',
    changePassword: '/users/me/change-password',
    uploadUrl: '/users/me/upload-url',
  },
} as const;
