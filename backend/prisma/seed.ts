import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const GENRES = [
  { name: 'Pop', slug: 'pop' },
  { name: 'Rock', slug: 'rock' },
  { name: 'Hip-Hop', slug: 'hip-hop' },
  { name: 'R&B', slug: 'rnb' },
  { name: 'Jazz', slug: 'jazz' },
  { name: 'Electronic', slug: 'electronic' },
  { name: 'Country', slug: 'country' },
  { name: 'Classical', slug: 'classical' },
  { name: 'Latin', slug: 'latin' },
  { name: 'Reggae', slug: 'reggae' },
  { name: 'Blues', slug: 'blues' },
  { name: 'Folk', slug: 'folk' },
  { name: 'Metal', slug: 'metal' },
  { name: 'Punk', slug: 'punk' },
  { name: 'Soul', slug: 'soul' },
  { name: 'Funk', slug: 'funk' },
  { name: 'Gospel', slug: 'gospel' },
  { name: 'Indie', slug: 'indie' },
  { name: 'Alternative', slug: 'alternative' },
  { name: 'Dancehall', slug: 'dancehall' },
  { name: 'Afrobeats', slug: 'afrobeats' },
  { name: 'K-Pop', slug: 'k-pop' },
  { name: 'Amapiano', slug: 'amapiano' },
  { name: 'Lo-Fi', slug: 'lo-fi' },
  { name: 'World', slug: 'world' },
];

async function main() {
  console.log('🌱 Seeding genres...');

  for (const genre of GENRES) {
    await prisma.genre.upsert({
      where: { slug: genre.slug },
      update: {},
      create: genre,
    });
  }

  console.log(`✅ Seeded ${GENRES.length} genres`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
