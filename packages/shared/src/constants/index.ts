import type { Genre } from '../types/index.js';

export const GENRES: Genre[] = [
  { id: 1, name: 'Pop', slug: 'pop' },
  { id: 2, name: 'Rock', slug: 'rock' },
  { id: 3, name: 'Hip-Hop', slug: 'hip-hop' },
  { id: 4, name: 'R&B', slug: 'r-and-b' },
  { id: 5, name: 'Jazz', slug: 'jazz' },
  { id: 6, name: 'Electronic', slug: 'electronic' },
  { id: 7, name: 'Country', slug: 'country' },
  { id: 8, name: 'Classical', slug: 'classical' },
  { id: 9, name: 'Latin', slug: 'latin' },
  { id: 10, name: 'Reggae', slug: 'reggae' },
  { id: 11, name: 'Blues', slug: 'blues' },
  { id: 12, name: 'Folk', slug: 'folk' },
  { id: 13, name: 'Metal', slug: 'metal' },
  { id: 14, name: 'Punk', slug: 'punk' },
  { id: 15, name: 'Soul', slug: 'soul' },
  { id: 16, name: 'Funk', slug: 'funk' },
  { id: 17, name: 'Gospel', slug: 'gospel' },
  { id: 18, name: 'Indie', slug: 'indie' },
  { id: 19, name: 'Alternative', slug: 'alternative' },
  { id: 20, name: 'Dancehall', slug: 'dancehall' },
  { id: 21, name: 'Afrobeats', slug: 'afrobeats' },
  { id: 22, name: 'K-Pop', slug: 'k-pop' },
  { id: 23, name: 'Amapiano', slug: 'amapiano' },
  { id: 24, name: 'Lo-Fi', slug: 'lo-fi' },
  { id: 25, name: 'World', slug: 'world' },
] as const;

export const PRICE_BOUNDS = {
  MIN_SONG_PRICE: 0.49,
  MAX_SONG_PRICE: 9.99,
  ARTIST_FEE: 9.99,
  MIN_SUBSCRIPTION: 1.99,
  MAX_SUBSCRIPTION: 29.99,
  MIN_WITHDRAWAL: 10.00,
} as const;

export const PLATFORM_SPLITS = {
  SONG_SALE_ARTIST: 0.80,
  SONG_SALE_PLATFORM: 0.20,
  SUBSCRIPTION_ARTIST: 0.90,
  SUBSCRIPTION_PLATFORM: 0.10,
  WITHDRAWAL_FEE_RATE: 0.0023,
} as const;

export const UPLOAD_LIMITS = {
  MAX_AUDIO_SIZE: 50 * 1024 * 1024,
  MAX_COVER_ART_SIZE: 5 * 1024 * 1024,
  MAX_SONGS_PER_ARTIST: 100,
  ALLOWED_AUDIO_TYPES: ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/x-flac'] as const,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png'] as const,
  MIN_COVER_ART_DIMENSION: 500,
} as const;

export const RATE_LIMITS = {
  GENERAL: 100,
  UPLOAD: 10,
  WINDOW_MS: 60 * 1000,
} as const;

export const API_VERSION = 'v1' as const;
