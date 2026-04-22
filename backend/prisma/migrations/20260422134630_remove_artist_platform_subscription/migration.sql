/*
  Warnings:

  - You are about to drop the column `stripe_subscription_id` on the `artist_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `subscription_ends_at` on the `artist_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `trial_ends_at` on the `artist_profiles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "artist_profiles" DROP COLUMN "stripe_subscription_id",
DROP COLUMN "subscription_ends_at",
DROP COLUMN "trial_ends_at",
ALTER COLUMN "subscription_status" SET DEFAULT 'active';
