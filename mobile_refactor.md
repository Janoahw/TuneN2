# Mobile App Folder Structure Refactor

## Problem

The `mobile/app/` root currently has **19 loose screen files** alongside the route groups `(auth)/` and `(tabs)/`. This makes it hard to reason about which screens belong together, navigate the codebase, or onboard new contributors.

## Approach: Expo Router Route Groups

Expo Router supports **route groups** — folders named with parentheses `(group)` — that organise files without affecting the URL. This means:

- `app/(discovery)/artist-profile.tsx` is still navigated to as `/artist-profile`
- No navigation code changes are needed anywhere
- No URLs change; zero risk of broken links

## Proposed Structure

```
mobile/app/
├── _layout.tsx                    # Root layout (unchanged)
├── index.tsx                      # Landing / redirect (unchanged)
│
├── (auth)/                        # ✅ Existing — authentication flow
│   ├── _layout.tsx
│   ├── login.tsx
│   ├── signup.tsx
│   ├── forgot-password.tsx
│   ├── reset-password.tsx
│   └── verify-email.tsx
│
├── (tabs)/                        # ✅ Existing — bottom tab bar
│   ├── _layout.tsx
│   ├── home.tsx
│   ├── search.tsx
│   ├── library.tsx
│   └── profile.tsx
│
├── (discovery)/                   # 🆕 Browse & discover content
│   ├── artist-profile.tsx         # ← was app/artist-profile.tsx
│   ├── all-artists.tsx            # ← was app/all-artists.tsx
│   ├── genre-browse.tsx           # ← was app/genre-browse.tsx
│   ├── search-results.tsx         # ← was app/search-results.tsx
│   └── song-detail.tsx            # ← was app/song-detail.tsx
│
├── (account)/                     # 🆕 User account & settings
│   ├── settings.tsx               # ← was app/settings.tsx
│   ├── change-password.tsx        # ← was app/change-password.tsx
│   ├── profile-edit.tsx           # ← was app/profile-edit.tsx
│   ├── purchase-history.tsx       # ← was app/purchase-history.tsx
│   ├── purchase-confirm.tsx       # ← was app/purchase-confirm.tsx
│   └── verify.tsx                 # ← was app/verify.tsx
│
└── (creator)/                     # 🆕 Artist / creator tools
    ├── artist-dashboard.tsx       # ← was app/artist-dashboard.tsx
    ├── artist-onboarding.tsx      # ← was app/artist-onboarding.tsx
    ├── become-artist.tsx          # ← was app/become-artist.tsx
    ├── edit-artist-profile.tsx    # ← was app/edit-artist-profile.tsx
    ├── edit-song.tsx              # ← was app/edit-song.tsx
    ├── onboarding-complete.tsx    # ← was app/onboarding-complete.tsx
    ├── song-management.tsx        # ← was app/song-management.tsx
    ├── stripe-connect.tsx         # ← was app/stripe-connect.tsx
    └── upload-song.tsx            # ← was app/upload-song.tsx
```

## Group Rationale

| Group | Purpose | Screens |
|---|---|---|
| `(auth)` | Unauthenticated flows | login, signup, forgot/reset password, verify email |
| `(tabs)` | Bottom tab bar root screens | home, search, library, profile |
| `(discovery)` | Browsing & discovering content | artist profiles, genres, search results, song detail |
| `(account)` | Personal account management | settings, password, purchases, profile editing |
| `(creator)` | Artist tools & onboarding | dashboard, song upload/edit, Stripe, onboarding |

## Impact Analysis

- **Navigation code**: ✅ No changes needed — route group names are transparent to Expo Router
- **Import paths**: ✅ No changes needed — all screens use `@/` aliases
- **Layouts**: Route groups do NOT need their own `_layout.tsx` unless they need a custom navigator. None of these groups require one — they inherit the root stack from `_layout.tsx`
- **URL paths**: ✅ Identical before and after

## Execution Steps

1. `mkdir -p mobile/app/(discovery) mobile/app/(account) mobile/app/(creator)`
2. Move 5 discovery screens → `(discovery)/`
3. Move 6 account screens → `(account)/`
4. Move 9 creator screens → `(creator)/`
5. Verify build compiles (TypeScript, no broken paths)
