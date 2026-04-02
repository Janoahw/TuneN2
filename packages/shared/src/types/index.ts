// API Response Envelope
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: ApiError | null;
  meta?: PaginationMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginationMeta {
  cursor?: string;
  hasMore?: boolean;
  total?: number;
  page?: number;
  limit?: number;
}

// User
export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  authProvider: 'email' | 'google' | 'apple';
  emailVerified: boolean;
  isArtist: boolean;
  isAdmin: boolean;
  createdAt: string;
}

// Artist Profile
export interface ArtistProfile {
  id: string;
  userId: string;
  artistName: string;
  bio: string | null;
  genreIds: number[];
  profileImageUrl: string | null;
  bannerImageUrl: string | null;
  collaborationPrice: number | null;
  fanSubscriptionPrice: number | null;
  subscriptionStatus: 'trialing' | 'active' | 'lapsed' | 'cancelled';
  isVerified: boolean;
  followerCount: number;
  createdAt: string;
}

// Genre
export interface Genre {
  id: number;
  name: string;
  slug: string;
}

// Song
export interface Song {
  id: string;
  releaseId: string;
  artistId: string;
  title: string;
  durationSeconds: number;
  genreId: number | null;
  price: number;
  isFree: boolean;
  streamUrl: string | null;
  coverArtUrl: string;
  lyrics: string | null;
  trackNumber: number;
  streamCount: number;
  status: 'processing' | 'active' | 'flagged' | 'removed';
  createdAt: string;
  artist?: ArtistProfile;
  genre?: Genre;
}

// Release
export interface Release {
  id: string;
  artistId: string;
  title: string;
  type: 'single' | 'album' | 'ep';
  coverArtUrl: string;
  releaseDate: string | null;
  songs?: Song[];
  createdAt: string;
}

// Purchase
export interface Purchase {
  id: string;
  buyerId: string;
  songId: string;
  artistId: string;
  amount: number;
  platformFee: number;
  artistEarnings: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: string;
  song?: Song;
}

// Wallet
export interface Wallet {
  id: string;
  artistId: string;
  balance: number;
  totalEarned: number;
  totalWithdrawn: number;
}

// Wallet Transaction
export interface WalletTransaction {
  id: string;
  walletId: string;
  type: 'song_sale' | 'subscription_earning' | 'collaboration' | 'withdrawal';
  amount: number;
  fee: number;
  netAmount: number;
  referenceType: string | null;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

// Notification
export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string | null;
  data: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
}

// Follow
export interface Follow {
  id: string;
  followerId: string;
  artistId: string;
  createdAt: string;
}

// Content Report
export interface ContentReport {
  id: string;
  reporterId: string;
  songId: string | null;
  artistId: string | null;
  reason: 'copyright' | 'inappropriate' | 'spam' | 'other';
  description: string | null;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: string;
}

// Auth types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  displayName: string;
}
