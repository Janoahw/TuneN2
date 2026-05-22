-- CreateTable
CREATE TABLE "song_likes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "song_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "song_likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "song_comments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "song_id" UUID NOT NULL,
    "body" VARCHAR(500) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "song_comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "song_likes_song_id_idx" ON "song_likes"("song_id");

-- CreateIndex
CREATE UNIQUE INDEX "song_likes_user_id_song_id_key" ON "song_likes"("user_id", "song_id");

-- CreateIndex
CREATE INDEX "song_comments_song_id_idx" ON "song_comments"("song_id");

-- CreateIndex
CREATE INDEX "song_comments_user_id_idx" ON "song_comments"("user_id");

-- AddForeignKey
ALTER TABLE "song_likes" ADD CONSTRAINT "song_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "song_likes" ADD CONSTRAINT "song_likes_song_id_fkey" FOREIGN KEY ("song_id") REFERENCES "songs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "song_comments" ADD CONSTRAINT "song_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "song_comments" ADD CONSTRAINT "song_comments_song_id_fkey" FOREIGN KEY ("song_id") REFERENCES "songs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
