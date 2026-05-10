-- DropForeignKey
ALTER TABLE "purchases" DROP CONSTRAINT "purchases_buyer_id_fkey";

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
