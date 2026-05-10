/**
 * OTP (One-Time Password) utilities for email verification
 */

/**
 * Generate a random 6-digit OTP code
 * @returns A string containing exactly 6 digits
 */
export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Calculate OTP expiry time
 * @param minutes Number of minutes until expiry (default: 10)
 * @returns Date object representing the expiry time
 */
export function calculateOtpExpiry(minutes: number = 10): Date {
  const now = new Date();
  return new Date(now.getTime() + minutes * 60 * 1000);
}
