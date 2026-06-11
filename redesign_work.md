# TuneN2 Mobile Redesign — Implementation Tracker

> Source of truth for the code-side redesign effort.
> Read this before starting a session. Update it before handing off.

---

## Design Reference

- Design file: `design/tuneN2-mobile.pen` (JSON, 70 screens)
- Design system: `docs/design_system.md`
- Handoff notes: `docs/mobile_redesign_handoff.md`
- Logo mark asset: `mobile/assets/logo-mark.jpg`

## Key Design Tokens (from .pen file)

| Token | Value |
|---|---|
| Background primary | `#0D0D0F` |
| Background secondary | `#191920` (inputs, cards) |
| Background elevated | `#15151CEB` (glass panels) |
| Text primary | `#F5F5F7` |
| Text secondary | `#9B9BA7` |
| Accent primary (teal) | `#00CCCC` |
| Accent secondary (purple) | `#BF5AF2` |
| Border default | `#313142` |
| Border focus | `#00CCCC` |
| Input bg | `#191920` |
| Input border | `#313142` |
| Input radius | 16px |
| Button primary bg | `#00CCCC` |
| Button primary text | `#050506` |
| Button radius | 24px (pill) |
| Button height | 48px |
| Photo height | 420px (top half) |
| Screen width | 393px |
| Screen height | 852px |

## Visual Pattern — Auth Screens (02, 03, 05, 06)

- Full photo background (Unsplash studio) behind top 420px
- Top gradient scrim: `#0D0D0FE6` → transparent (160px)
- Bottom gradient scrim: transparent → `#0D0D0FFF` (260px, starts at y=230)
- Centered circular logo mark (82x82, `mobile/assets/logo-mark.jpg`)
- Title: Space Grotesk 32px 700, `#F5F5F7`
- Copy: Inter 15px 500, `#9B9BA7`
- Input fields: `#191920` bg, `#313142` border, 16px radius, 52px height
- Primary button: `#00CCCC` bg, `#050506` text, 24px radius, 48px height
- Footer text: Inter 13px 700, `#9B9BA7`

---

## Screen Progress

### Auth Flow

| # | Screen | File | Status | Notes |
|---|---|---|---|---|
| 01 | Splash / Onboarding | `app/index.tsx` | ✅ Done | Photo bg, glass panel, progress dots |
| 02 | Login | `app/(auth)/login.tsx` | ✅ Done | Photo bg, pill inputs, pill button |
| 03 | Sign Up | `app/(auth)/signup.tsx` | ✅ Done | Photo bg, role selector |
| 04 | Verify OTP | `app/(auth)/verify-otp.tsx` | ✅ Done | State icon plate, 6 OTP boxes |
| 05 | Forgot Password | `app/(auth)/forgot-password.tsx` | ✅ Done | Photo bg |
| 06 | Reset Password | `app/(auth)/reset-password.tsx` | ✅ Done | Photo bg, password checklist |

### Tab Screens

| # | Screen | File | Status | Notes |
|---|---|---|---|---|
| 07 | Home Screen | `app/(tabs)/home.tsx` | ✅ Done | Greeting, preview CTA pill, feature card, artist bubbles, song cards |
| 08 | Search Screen | `app/(tabs)/search.tsx` | ✅ Done | Search bar, filter chips, genre grid |
| 09 | Search Results | `app/(discovery)/search-results.tsx` | ✅ Done | Card rows, filter chips, gold price, empty state |
| 10 | Genre Browse | `app/(discovery)/genre-browse.tsx` | ✅ Done | Hero gradient card, artist bubbles, song cards |

### Discovery Flow

| # | Screen | File | Status | Notes |
|---|---|---|---|---|
| 11 | Artist Profile | `app/(discovery)/artist-profile.tsx` | ✅ Done | Avatar 120px, stats card, follow/subscribe pills, song cards |
| 12 | Song Detail | `app/(discovery)/song-detail.tsx` | ✅ Done | Cover art 280px, price, buy/preview pills, artist card, download progress |
| 13 | All Artists List | `app/(discovery)/all-artists.tsx` | ✅ Done | Card rows, follow pill, verified badge |

### Account / Fan Flow

| # | Screen | File | Status | Notes |
|---|---|---|---|---|
| 14 | Payment Sheet | `app/(account)/purchase-confirm.tsx` | ✅ Done | Icon plate, cover 200px, teal play pill, ghost library pill |
| 15 | Purchase Confirmation | `app/(account)/purchase-confirm.tsx` | ✅ Done | Same file as 14 |
| 16 | Purchase History | `app/(account)/purchase-history.tsx` | ✅ Done | Card rows #15151B, cover 46px, error price |
| 17 | My Downloads / Library | `app/(tabs)/library.tsx` | ✅ Done | Filter chips, song cards #15151B, gold price |
| 18 | Library | `app/(tabs)/library.tsx` | ✅ Done | Same file as 17 |
| 19 | Fan Profile | `app/(tabs)/profile.tsx` | ✅ Done | Avatar 96px + edit badge, menu items #15151B |
| 20 | Edit Profile | `app/(account)/profile-edit.tsx` | ✅ Done | Bg #0D0D0F, inputs redesigned |
| 21 | Following List | (no dedicated file) | ⬜ N/A | No dedicated screen |
| 22 | Subscriptions List | (no dedicated file) | ⬜ N/A | No dedicated screen |
| 23 | Notifications | `app/(account)/notifications.tsx` | ✅ Done | Cards #15151B, unread teal bg, icon circles |
| 24 | Settings | `app/(account)/settings.tsx` | ✅ Done | Cards #15151B overflow hidden, row icons 34px, logout ghost red |
| 25 | Artist Subscription Offer | `app/(discovery)/artist-profile.tsx` | ✅ Done | Part of artist profile |
| 26 | Subscription Confirmation | `app/(account)/purchase-confirm.tsx` | ✅ Done | Same file as 14 |
| 27 | Manage Subscription | (no dedicated file) | ⬜ N/A | No dedicated screen |
| — | Change Password | `app/(account)/change-password.tsx` | ✅ Done | #0D0D0F bg, strength track |
| — | My Reports | `app/(account)/my-reports.tsx` | ✅ Done | Cards #15151B, badge colors |
| — | Verify Email | `app/(account)/verify.tsx` | ✅ Done | Icon circle 100px, success/error states |

### Creator Flow

| # | Screen | File | Status | Notes |
|---|---|---|---|---|
| 28 | Become an Artist | `app/(creator)/become-artist.tsx` | ✅ Done | Hero circle, feature cards #15151B, icons teal-tinted |
| 29 | Artist Onboarding | `app/(creator)/artist-onboarding.tsx` | ✅ Done | Progress bar, genre chips teal-active, photo upload |
| 30 | Stripe Connect Onboarding | `app/(creator)/stripe-connect.tsx` | ✅ Done | Icon circle teal, step circles, progress bar |
| 31 | Onboarding Complete | `app/(creator)/onboarding-complete.tsx` | ✅ Done | Success icon plate 100px, checklist card |
| 32 | Artist Dashboard | `app/(creator)/artist-dashboard.tsx` | ✅ Done | Balance JetBrains 40px, stat cards #15151B, action btns |
| 33 | Earnings Breakdown | `app/(creator)/artist-dashboard.tsx` | ✅ Done | Part of dashboard |
| 34 | Download Analytics | `app/(creator)/artist-dashboard.tsx` | ✅ Done | Part of dashboard |
| 35 | Follower Analytics | `app/(creator)/artist-dashboard.tsx` | ✅ Done | Part of dashboard |
| 36 | Upload Song | `app/(creator)/upload-song.tsx` | ✅ Done | Inputs #191920, audio picker dashed teal, genre list |
| 37 | Upload Progress | `app/(creator)/upload-song.tsx` | ✅ Done | Part of upload screen |
| 38 | Song Management | `app/(creator)/song-management.tsx` | ✅ Done | Filter tabs teal-active, song cards #15151B, status badges |
| 39 | Edit Song | `app/(creator)/edit-song.tsx` | ✅ Done | Cover 160px, inputs #191920, genre list #15151B |
| 40 | Album / Release Create | (no dedicated file) | ⬜ N/A | No dedicated screen |
| 41 | Album / Release Detail | (no dedicated file) | ⬜ N/A | No dedicated screen |
| 42 | Wallet | `app/(creator)/wallet.tsx` | ✅ Done | Tx rows cards #15151B, pending card, withdraw teal pill |
| 43 | Withdrawal | `app/(creator)/withdrawal.tsx` | ✅ Done | Amount input, chips teal-active, fee card, cta pill |
| 44 | Withdrawal History | `app/(creator)/withdrawal-history.tsx` | ✅ Done | Row cards #15151B, status badges |
| 45 | Payout Success | `app/(creator)/payout-success.tsx` | ✅ Done | Icon plate 100px, summary card, teal pill done btn |
| 46 | Set Subscription Pricing | (no dedicated file) | ⬜ N/A | No dedicated screen |
| 47 | Subscriber List | (no dedicated file) | ⬜ N/A | No dedicated screen |
| — | Edit Artist Profile | `app/(creator)/edit-artist-profile.tsx` | ✅ Done | Genre chips teal-active |

### Collaboration / Events / Reporting

| # | Screen | File | Status | Notes |
|---|---|---|---|---|
| 48 | Collaboration Setup | (no dedicated file) | ⬜ N/A | No dedicated screen |
| 49 | Collaboration Requests | (no dedicated file) | ⬜ N/A | No dedicated screen |
| 50 | Collaboration Detail | (no dedicated file) | ⬜ N/A | No dedicated screen |
| 51 | Send Collaboration Request | (no dedicated file) | ⬜ N/A | No dedicated screen |
| 52 | Events List | (no dedicated file) | ⬜ N/A | No dedicated screen |
| 53 | Event Detail | (no dedicated file) | ⬜ N/A | No dedicated screen |
| 54 | Create / Edit Event | (no dedicated file) | ⬜ N/A | No dedicated screen |
| 55 | Report Content | `components/ReportModal.tsx` | ✅ Done | Bottom sheet #15151B, reason rows teal-active |
| 56 | My Reports | `app/(account)/my-reports.tsx` | ✅ Done | Cards #15151B, status badges |
| 57 | Preview Feed Playback | `app/(discovery)/preview-feed.tsx` | ✅ Done | TikTok-style fullscreen, action rail, countdown ring |
| 58 | Preview Feed Comments | `components/CommentSheet.tsx` | ✅ Done | Bottom sheet #15151B, input #191920 |

### Library / Playlist

| # | Screen | File | Status | Notes |
|---|---|---|---|---|
| 59 | Playlists List | (no dedicated file) | ⬜ N/A | No dedicated screen |
| 60 | Playlist Detail | (no dedicated file) | ⬜ N/A | No dedicated screen |
| 61 | Create / Edit Playlist | (no dedicated file) | ⬜ N/A | No dedicated screen |
| 62 | Add to Playlist | (no dedicated file) | ⬜ N/A | No dedicated screen |

### Utility / System States

| # | Screen | File | Status | Notes |
|---|---|---|---|---|
| 63 | Song Options Sheet | (no dedicated file) | ⬜ N/A | No dedicated screen |
| 64 | Artist Options Sheet | (no dedicated file) | ⬜ N/A | No dedicated screen |
| 65 | Image Picker / Crop | (no dedicated file) | ⬜ N/A | Uses expo-image-picker |
| 66 | Loading / Skeleton | (shared component) | ⬜ N/A | ActivityIndicator used inline |
| 67 | Empty States | (shared component) | ✅ Done | Styled inline per-screen |
| 68 | Error State | (shared component) | ✅ Done | Styled inline per-screen |
| 69 | Force Update | (no dedicated file) | ⬜ N/A | No dedicated screen |
| 70 | Maintenance Mode | (no dedicated file) | ⬜ N/A | No dedicated screen |

### Shared Components

| Component | File | Status | Notes |
|---|---|---|---|
| Button | `components/ui/Button.tsx` | ✅ Done | Pill 24px radius, 48px height, #050506 primary text |
| Input | `components/ui/Input.tsx` | ✅ Done | #191920 bg, #313142 border, 16px radius |
| SongCard | `components/ui/SongCard.tsx` | ✅ Done | #15151B, 16px radius, gold #FF9F0A price |
| ArtistCard | `components/ui/ArtistCard.tsx` | ✅ Done | 78px avatar, Inter bold names |
| MiniPlayer | `components/ui/MiniPlayer.tsx` | ✅ Done | #15151B bg, 16px radius, teal play button |
| WalletCard | `components/ui/WalletCard.tsx` | ✅ Done | Gradient, 20px radius, JetBrains Mono 40px balance |
| Badge | `components/ui/Badge.tsx` | ✅ Done | Semantic colors, pill shape |
| CommentSheet | `components/CommentSheet.tsx` | ✅ Done | Bottom sheet #15151B, avatar #191920, input #191920 |
| ReportModal | `components/ReportModal.tsx` | ✅ Done | Bottom sheet #15151B, reason rows teal-active |

---

## Implementation Log

### 2026-06-05 — Session 3

Started: Creator flow (Screens 28–47), remaining Account screens, shared components

Changed:
- Styled `app/(creator)/wallet.tsx`: tx rows → cards #15151B/16px, pending card #15151B, withdraw teal pill
- Styled `app/(creator)/song-management.tsx`: filter tabs teal-active, song cards #15151B, upload btn teal pill
- Styled `app/(creator)/onboarding-complete.tsx`: success icon plate 100px, checklist card #15151B/20px
- Styled `app/(creator)/payout-success.tsx`: icon plate 100px, summary card #15151B/20px, teal pill done btn
- Styled `app/(creator)/artist-onboarding.tsx`: progress track #191920, genre chips teal-active, photo upload #191920
- Styled `app/(creator)/stripe-connect.tsx`: icon circle teal-tinted, step circles, progress bar
- Styled `app/(creator)/edit-song.tsx`: inputs #191920/#313142, genre list #15151B, save btn teal pill
- Styled `app/(creator)/withdrawal.tsx`: amount input #191920, chips teal-active, fee card #15151B, cta pill
- Styled `app/(creator)/withdrawal-history.tsx`: rows → cards #15151B/16px/68px height, badge pills
- Styled `app/(creator)/edit-artist-profile.tsx`: genre chips teal-active, heading displayBold
- Styled `app/(account)/change-password.tsx`: strength track #191920
- Styled `app/(account)/my-reports.tsx`: cards #15151B/16px, report rows
- Styled `app/(account)/verify.tsx`: icon circle 100px, title displayBold
- Styled `app/(discovery)/preview-feed.tsx`: bg #0D0D0F/#15151B, avatar fallback updated
- Updated `components/CommentSheet.tsx`: sheet #15151B/28px radius, row avatars #191920, input #191920
- Updated `components/ReportModal.tsx`: sheet #15151B, reason rows teal-active, textarea #191920
- Updated `components/ui/Button.tsx`: pill 24px, 48px height, primary text #050506, all variants updated
- Updated `components/ui/ArtistCard.tsx`: 78px avatar, displayBold name
- Updated `components/ui/MiniPlayer.tsx`: #15151B container, 16px radius, teal play button
- Updated `components/ui/SongCard.tsx`: #15151B, 16px radius, gold #FF9F0A price
- Updated `components/ui/WalletCard.tsx`: 20px radius, JetBrains Mono 40px bold balance

Preserved: all hooks, services, navigation, form validation, audio logic, purchase/download flows

Next: All screens with dedicated files are now complete. Screens without dedicated files (40-41, 46-47, 48-54, 59-65, 69-70) have no React Native source to update — they don't exist as independent screens in the codebase.

---

### 2026-06-05 — Session 2

Started: Tab screens + Discovery flow (Screens 07–10)

Changed:
- Redesigned `app/(tabs)/home.tsx` (Screen 07): time-based greeting (Space Grotesk 24px), preview feed pill CTA, Unsplash feature card (176h, 28px radius, scrim overlay), artist bubbles (78×78), song cards (#15151B, gold price, teal play icon)
- Redesigned `app/(tabs)/search.tsx` (Screen 08): #191920 search bar, filter chips (All/Songs/Artists/Albums/Genres), genre grid cards (#15151B, 16px radius)
- Redesigned `app/(discovery)/search-results.tsx` (Screen 09): card-style artist/song rows (#15151B bg, 16px radius, gold price, teal filter chips)
- Redesigned `app/(discovery)/genre-browse.tsx` (Screen 10): teal gradient hero card (28px radius), artist bubbles, song cards with price + duration

Preserved: all hooks (useDiscoverFeed, useSearch, useGenres, useGenreDetail), navigation, RefreshControl

Next: Screens 11–13 (Artist Profile, Song Detail, All Artists)

---

### 2026-06-05 — Session 1

Started: Auth flow (Screens 01–06)

Changed:
- Copied `design/assets/tunen2-logo-mark.jpg` → `mobile/assets/logo-mark.jpg`
- Updated `components/ui/Input.tsx` to accept `containerStyle` prop
- Redesigned `app/index.tsx` (Screen 01 Splash): photo background, glass panel, progress dots, Get Started + login ghost buttons
- Redesigned `app/(auth)/login.tsx` (Screen 02): photo bg, logo mark, pill inputs, pill teal button
- Redesigned `app/(auth)/signup.tsx` (Screen 03): photo bg, role selector with teal active state
- Redesigned `app/(auth)/verify-otp.tsx` (Screen 04): dark bg, icon plate, 6-box OTP entry
- Redesigned `app/(auth)/forgot-password.tsx` (Screen 05): photo bg, single email input
- Redesigned `app/(auth)/reset-password.tsx` (Screen 06): photo bg, password checklist

All logic preserved: form validation, mutations, navigation, toast messages, timers.

Next session: Start with Screens 07–10 (Home, Search, Search Results, Genre Browse).

---

## Handoff Template

```
### YYYY-MM-DD — Session N

Started: [screen range]

Changed:
- 

Verified:
- 

Issues:
- 

Next session: 
```
