-- DropForeignKey
ALTER TABLE "downloads" DROP CONSTRAINT "downloads_song_id_fkey";

-- DropForeignKey
ALTER TABLE "downloads" DROP CONSTRAINT "downloads_user_id_fkey";

-- AddForeignKey
ALTER TABLE "downloads" ADD CONSTRAINT "downloads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "downloads" ADD CONSTRAINT "downloads_song_id_fkey" FOREIGN KEY ("song_id") REFERENCES "songs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
