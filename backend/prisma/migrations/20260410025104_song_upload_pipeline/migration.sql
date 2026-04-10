-- AlterTable
ALTER TABLE "songs" ADD COLUMN     "description" TEXT,
ALTER COLUMN "release_id" DROP NOT NULL,
ALTER COLUMN "duration_seconds" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "stripe_customer_id" VARCHAR(255);
