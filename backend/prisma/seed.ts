import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

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

const ARTIST_DATA = [
  {
    email: 'nova.wave@tunen2.com',
    displayName: 'Nova Wave',
    artistName: 'Nova Wave',
    bio: 'Electronic music producer blending future bass and ambient soundscapes.',
    genreSlugs: ['electronic', 'lo-fi'],
    followerCount: 1250,
    isVerified: true,
  },
  {
    email: 'soulfire.k@tunen2.com',
    displayName: 'Soulfire K',
    artistName: 'Soulfire K',
    bio: 'R&B singer-songwriter crafting heartfelt stories with rich harmonies.',
    genreSlugs: ['rnb', 'soul'],
    followerCount: 3400,
    isVerified: true,
  },
  {
    email: 'afro.ayo@tunen2.com',
    displayName: 'Afro Ayo',
    artistName: 'Afro Ayo',
    bio: 'Bridging Lagos rhythms with global pop. Afrobeats at its finest.',
    genreSlugs: ['afrobeats', 'dancehall'],
    followerCount: 5800,
    isVerified: true,
  },
  {
    email: 'midnight.indie@tunen2.com',
    displayName: 'Midnight Indie',
    artistName: 'Midnight Indie',
    bio: 'Indie rock band from Austin, TX. Four-piece with a lot to say.',
    genreSlugs: ['indie', 'alternative'],
    followerCount: 820,
    isVerified: false,
  },
  {
    email: 'jazzmaven@tunen2.com',
    displayName: 'Jazz Maven',
    artistName: 'Jazz Maven',
    bio: 'Contemporary jazz pianist exploring modern jazz and fusion.',
    genreSlugs: ['jazz'],
    followerCount: 1100,
    isVerified: false,
  },
  {
    email: 'beatpoet@tunen2.com',
    displayName: 'Beat Poet',
    artistName: 'Beat Poet',
    bio: 'Hip-hop lyricist and producer. Real stories, real beats.',
    genreSlugs: ['hip-hop'],
    followerCount: 2200,
    isVerified: true,
  },
];

const SONG_TEMPLATES = [
  { title: 'Midnight Frequencies', price: 1.99, isFree: false, durationSeconds: 213 },
  { title: 'Neon Skyline', price: 0.99, isFree: false, durationSeconds: 187 },
  { title: 'Ocean Drive', price: 2.99, isFree: false, durationSeconds: 241 },
  { title: 'Golden Hour', price: 0.0, isFree: true, durationSeconds: 198 },
  { title: 'Crystal Clear', price: 1.49, isFree: false, durationSeconds: 224 },
  { title: 'Sunrise Session', price: 0.0, isFree: true, durationSeconds: 175 },
  { title: 'Deep Space', price: 3.99, isFree: false, durationSeconds: 267 },
  { title: 'City Lights', price: 1.99, isFree: false, durationSeconds: 203 },
  { title: 'Echoes of Tomorrow', price: 2.49, isFree: false, durationSeconds: 258 },
  { title: 'Velvet Dreams', price: 0.99, isFree: false, durationSeconds: 192 },
  { title: 'Lost in Translation', price: 1.99, isFree: false, durationSeconds: 236 },
  { title: 'Rhythm of the Night', price: 0.0, isFree: true, durationSeconds: 218 },
  { title: 'Soul Awakening', price: 2.99, isFree: false, durationSeconds: 244 },
  { title: 'The Long Way Home', price: 1.49, isFree: false, durationSeconds: 279 },
  { title: 'Fire & Ice', price: 0.99, isFree: false, durationSeconds: 201 },
  { title: 'Harmonic Shift', price: 2.99, isFree: false, durationSeconds: 262 },
  { title: 'Rain Dance', price: 1.99, isFree: false, durationSeconds: 189 },
  { title: 'Infinite Loop', price: 0.0, isFree: true, durationSeconds: 215 },
  { title: 'Broken Crown', price: 1.99, isFree: false, durationSeconds: 253 },
  { title: 'New Beginnings', price: 0.99, isFree: false, durationSeconds: 196 },
];

const FAN_DATA = [
  { email: 'fan1@tunen2.com', displayName: 'Alex Morgan' },
  { email: 'fan2@tunen2.com', displayName: 'Sam Rivera' },
  { email: 'fan3@tunen2.com', displayName: 'Jordan Blake' },
  { email: 'fan4@tunen2.com', displayName: 'Casey Kim' },
  { email: 'fan5@tunen2.com', displayName: 'Riley Chen' },
  { email: 'fan6@tunen2.com', displayName: 'Morgan Taylor' },
  { email: 'fan7@tunen2.com', displayName: 'Drew Santos' },
  { email: 'fan8@tunen2.com', displayName: 'Quinn Parker' },
  { email: 'fan9@tunen2.com', displayName: 'Avery Johnson' },
  { email: 'fan10@tunen2.com', displayName: 'Skyler Wu' },
];

async function main() {
  const password = await bcrypt.hash('Password123!', 12);

  // ── Genres ────────────────────────────────────────────────
  console.log('🌱 Seeding genres...');
  const genreMap: Record<string, number> = {};
  for (const genre of GENRES) {
    const g = await prisma.genre.upsert({
      where: { slug: genre.slug },
      update: {},
      create: genre,
    });
    genreMap[genre.slug] = g.id;
  }
  console.log(`✅ Seeded ${GENRES.length} genres`);

  // ── Admin ─────────────────────────────────────────────────
  console.log('👤 Seeding admin...');
  await prisma.user.upsert({
    where: { email: 'admin@tunen2.com' },
    update: {},
    create: {
      email: 'admin@tunen2.com',
      passwordHash: password,
      displayName: 'Admin',
      emailVerified: true,
      isAdmin: true,
      isArtist: false,
    },
  });

  // ── Artists ───────────────────────────────────────────────
  console.log('🎤 Seeding artists...');
  const artistProfileIds: string[] = [];

  for (const data of ARTIST_DATA) {
    const user = await prisma.user.upsert({
      where: { email: data.email },
      update: {},
      create: {
        email: data.email,
        passwordHash: password,
        displayName: data.displayName,
        emailVerified: true,
        isArtist: true,
      },
    });

    const genreIds = data.genreSlugs.map((s) => genreMap[s]).filter(Boolean);
    const profile = await prisma.artistProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        artistName: data.artistName,
        bio: data.bio,
        genreIds,
        isVerified: data.isVerified,
        subscriptionStatus: 'active',
        fanSubscriptionPrice: 4.99,
      },
    });

    artistProfileIds.push(profile.id);

    // Wallet for each artist
    await prisma.wallet.upsert({
      where: { artistId: profile.id },
      update: {},
      create: {
        artistId: profile.id,
        balance: 0,
        totalEarned: 0,
        totalWithdrawn: 0,
      },
    });
  }
  console.log(`✅ Seeded ${ARTIST_DATA.length} artists`);

  // ── Songs ─────────────────────────────────────────────────
  console.log('🎵 Seeding songs...');
  const songIds: string[] = [];
  const artistSongMap: Record<string, string[]> = {};

  for (let i = 0; i < SONG_TEMPLATES.length; i++) {
    const template = SONG_TEMPLATES[i];
    const artistProfileId = artistProfileIds[i % artistProfileIds.length];
    const artistData = ARTIST_DATA[i % ARTIST_DATA.length];
    const genreSlug = artistData.genreSlugs[0];
    const genreId = genreMap[genreSlug];

    const existing = await prisma.song.findFirst({
      where: { artistId: artistProfileId, title: template.title },
    });

    let song;
    if (existing) {
      song = existing;
    } else {
      song = await prisma.song.create({
        data: {
          artistId: artistProfileId,
          title: template.title,
          price: template.price,
          isFree: template.isFree,
          durationSeconds: template.durationSeconds,
          genreId,
          audioUrl: `seeds/audio/${template.title.toLowerCase().replace(/\s+/g, '-')}.mp3`,
          streamUrl: `seeds/stream/${template.title.toLowerCase().replace(/\s+/g, '-')}.aac`,
          coverArtUrl: null,
          status: 'active',
          streamCount: BigInt(Math.floor(Math.random() * 5000)),
          trackNumber: 1,
        },
      });
    }

    songIds.push(song.id);
    if (!artistSongMap[artistProfileId]) artistSongMap[artistProfileId] = [];
    artistSongMap[artistProfileId].push(song.id);
  }
  console.log(`✅ Seeded ${SONG_TEMPLATES.length} songs`);

  // ── Fan Users ─────────────────────────────────────────────
  console.log('👥 Seeding fan users...');
  const fanUserIds: string[] = [];

  for (const fan of FAN_DATA) {
    const user = await prisma.user.upsert({
      where: { email: fan.email },
      update: {},
      create: {
        email: fan.email,
        passwordHash: password,
        displayName: fan.displayName,
        emailVerified: true,
        isArtist: false,
      },
    });
    fanUserIds.push(user.id);
  }
  console.log(`✅ Seeded ${FAN_DATA.length} fans`);

  // ── Purchases ─────────────────────────────────────────────
  console.log('💳 Seeding purchases...');
  let purchaseCount = 0;

  for (let fi = 0; fi < fanUserIds.length; fi++) {
    const fanId = fanUserIds[fi];
    // Each fan buys 2–3 songs
    const songsToBuy = songIds.filter((_, idx) => idx % (fi + 1) === 0).slice(0, 3);

    for (const songId of songsToBuy) {
      // Find which artist owns the song
      const song = await prisma.song.findUnique({ where: { id: songId } });
      if (!song || song.isFree) continue;

      const exists = await prisma.purchase.findUnique({
        where: { buyerId_songId: { buyerId: fanId, songId } },
      });
      if (exists) continue;

      const amount = Number(song.price);
      const platformFee = Math.round(amount * 0.2 * 100) / 100;
      const artistEarnings = Math.round((amount - platformFee) * 100) / 100;

      await prisma.purchase.create({
        data: {
          buyerId: fanId,
          songId,
          artistId: song.artistId,
          amount,
          platformFee,
          artistEarnings,
          stripePaymentId: `pi_seed_${fanId.slice(0, 8)}_${songId.slice(0, 8)}`,
          status: 'completed',
        },
      });

      // Update wallet
      await prisma.wallet.updateMany({
        where: { artistId: song.artistId },
        data: {
          balance: { increment: artistEarnings },
          totalEarned: { increment: artistEarnings },
        },
      });

      purchaseCount++;
    }
  }
  console.log(`✅ Seeded ${purchaseCount} purchases`);

  // ── Follows ───────────────────────────────────────────────
  console.log('❤️  Seeding follows...');
  let followCount = 0;

  for (let fi = 0; fi < fanUserIds.length; fi++) {
    const fanId = fanUserIds[fi];
    const artistsToFollow = artistProfileIds.slice(0, 2 + (fi % 3));

    for (const artistId of artistsToFollow) {
      const exists = await prisma.follow.findUnique({
        where: { followerId_artistId: { followerId: fanId, artistId } },
      });
      if (!exists) {
        await prisma.follow.create({ data: { followerId: fanId, artistId } });
        followCount++;
      }
    }
  }
  console.log(`✅ Seeded ${followCount} follows`);

  // ── Notifications ─────────────────────────────────────────
  console.log('🔔 Seeding notifications...');
  for (const fanId of fanUserIds.slice(0, 5)) {
    const existing = await prisma.notification.findFirst({ where: { userId: fanId } });
    if (!existing) {
      await prisma.notification.create({
        data: {
          userId: fanId,
          type: 'new_song',
          title: 'New song available',
          body: 'An artist you follow just dropped a new track!',
          isRead: false,
        },
      });
    }
  }
  console.log('✅ Seeded notifications');

  console.log('\n🎉 Database seeding complete!');
  console.log('   Admin:   admin@tunen2.com / Password123!');
  console.log('   Artists: nova.wave@tunen2.com, soulfire.k@tunen2.com, ... / Password123!');
  console.log('   Fans:    fan1@tunen2.com ... fan10@tunen2.com / Password123!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
