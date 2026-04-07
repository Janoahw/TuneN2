# Changes — Streaming → Upload/Download

> **Core Shift:** We are NOT streaming songs. Users upload and download files. There is no real-time playback streaming. Artists upload audio files, fans purchase and download them.

---

## Docs Changes

### 1. `docs/plan.md`

| # | Change | Why |
|---|--------|-----|
| 1 | **Section 1.2 – Phase 1 Decisions**: Change `"Downloads: Streaming only (no downloads) for MVP"` → `"Downloads: Users download purchased files. No streaming."` | Before: streaming-first, downloads deferred. Now: downloads ARE the core model. |
| 2 | **Section 1.3D – Streaming Specs**: Remove entire "Streaming Specs" subsection (`Single quality tier: 128kbps AAC`, `Background playback`, `queue management`). Replace with **Download Specs** — file format options (original quality, lossy compressed), download limits/re-download policy. | Before: defined streaming bitrate and playback behavior. Now: no streaming; define download file specs instead. |
| 3 | **Section 1.3K – Artist Analytics**: Change `"Total streams, revenue…"` → `"Total downloads, revenue…"` | Before: streams as a metric. Now: downloads as the metric. |
| 4 | **Section 1.6 – Roles Table**: Change `"Browse/search/stream free music"` → `"Browse/search/download free music"`. Change `"Stream purchased/subscribed songs"` → `"Download purchased/subscribed songs"`. | Before: role permissions framed around streaming. Now: framed around downloading. |
| 5 | **Brand Voice – Words we use**: Remove `"Stream"`. Add `"Download"`, `"Own"`. | Before: streaming language. Now: ownership/download language. |

---

### 2. `docs/mvp_scope.md`

| # | Change | Why |
|---|--------|-----|
| 1 | **Feature 7 – Audio transcoding**: Change `"Required for consistent streaming"` → `"Required for consistent download format"`. Clarify transcoding is for standardizing the downloadable file, not for streaming delivery. | Before: transcoding served streaming. Now: transcoding standardizes the download artifact. |
| 2 | **Feature 10 – Music streaming**: Rename to **"Music Downloads"**. Replace signed-URL streaming delivery with download-link generation. Remove `audio player`, `background playback`. Keep signed-URL concept but for download links, not stream URLs. | Before: entire feature was real-time streaming. Now: generating secure download links. |
| 3 | **Feature 11 – Playback controls**: **Remove entirely.** Play, pause, skip, seek, queue, shuffle, repeat are streaming/playback concepts. | Before: full playback feature. Now: no in-app playback — users download and play in their own music app. |
| 4 | **Deferred D11 – Adaptive bitrate streaming**: **Remove entirely.** No streaming = no adaptive bitrate. | Before: deferred streaming optimization. Now: irrelevant. |
| 5 | **Deferred D12 – Offline downloads**: **Remove or reclassify.** Downloads are now the core model, not a deferred feature. | Before: "Streaming only — downloads deferred." Now: downloads ARE the product. |
| 6 | **Journey 1 – Title**: Change `"Fan — Discovery to Purchase to Streaming"` → `"Fan — Discovery to Purchase to Download"`. | Before: journey ended at streaming. Now: journey ends at download. |
| 7 | **Journey 1 – Steps**: Change `"streams via signed URL from CDN"` → `"downloads via signed URL from CDN"`. Remove `"Background playback works"`. Add `"File saved to device"`. | Before: streaming delivery step. Now: download delivery step. |
| 8 | **Success Criteria #9**: Change `"it becomes streamable after transcoding"` → `"it becomes downloadable after transcoding"`. | Before: transcoding makes songs streamable. Now: transcoding makes songs downloadable. |
| 9 | **API Surface – Songs**: Remove `stream` and `stream-complete` endpoints. Add `download` endpoint. Change from 6 endpoints to 5 (or adjust count). | Before: stream/stream-complete endpoints. Now: download endpoint. |
| 10 | **Screen #13 – Now Playing**: **Remove.** No full-screen player. | Before: full-screen playback UI. Now: no playback UI. |
| 11 | **Screen #14 – Mini Player**: **Remove.** No persistent player bar. | Before: bottom bar player. Now: no player. |
| 12 | **Screen #15 – Queue**: **Remove.** No queue management. | Before: queue/shuffle/repeat UI. Now: no queue. |

---

### 3. `docs/system_design.md`

| # | Change | Why |
|---|--------|-----|
| 1 | **Section 2.4 – Services**: Remove `StreamService` (`Signed URL generation, access verification, stream count increment`). Replace with `DownloadService` — signed URL generation for downloads, access verification, download count tracking. | Before: streaming service. Now: download service. |
| 2 | **Section 2.7 – Audio Streaming Flow**: Rename to **"Audio Download Flow"**. Replace the entire flow diagram: instead of `stream request → signed URL → CDN stream → stream-complete callback`, use `download request → access check → signed download URL → file download → download logged`. | Before: real-time streaming flow with stream-complete tracking. Now: one-shot file download flow. |
| 3 | **Songs Table Schema**: Rename `stream_url` → `download_url`. Rename `stream_count` → `download_count`. | Before: streaming-oriented columns. Now: download-oriented columns. |
| 4 | **Remove `streams` table** (if defined): Replace with `downloads` table tracking download events. | Before: stream event logging. Now: download event logging. |

---

### 4. `docs/feature_breakdown.md`

| # | Change | Why |
|---|--------|-----|
| 1 | **Feature 12 – Music Streaming**: Rename to **"Music Downloads"**. Replace `GET /songs/:id/stream` → `GET /songs/:id/download`. Remove `POST /songs/:id/stream-complete`. Replace streaming logic (signed URL for CDN playback) with download logic (signed URL for file download, track download event). | Before: full streaming feature with stream-complete tracking. Now: download feature with download tracking. |
| 2 | **Feature 13 – Playback Controls**: **Remove entirely.** All sub-features (play/pause/seek, queue, shuffle, repeat, background playback, lock screen controls, Now Playing screen, Mini Player, Queue screen) are streaming concepts. | Before: entire playback feature set. Now: no in-app playback. |

---

### 5. `docs/build_plan.md`

| # | Change | Why |
|---|--------|-----|
| 1 | **Sprint 4**: Change `"Song transcoding → becomes streamable AAC"` → `"Song transcoding → becomes downloadable file"`. | Before: transcoding goal was streamability. Now: transcoding goal is download-ready file. |
| 2 | **Sprint 5 – Title**: Change `"Purchase + Streaming"` → `"Purchase + Download"`. | Before: sprint focused on streaming integration. Now: sprint focuses on download delivery. |
| 3 | **S5.8**: Change `GET /songs/:songId/stream` → `GET /songs/:songId/download`. Update description from streaming delivery to download delivery. | Before: stream endpoint. Now: download endpoint. |
| 4 | **S5.9**: Change `streams table migration` → `downloads table migration`. | Before: stream event table. Now: download event table. |
| 5 | **S5.10**: Change `stream-count logging` → `download-count logging`. | Before: tracking streams. Now: tracking downloads. |
| 6 | **S5.11–S5.14**: **Remove all four tasks** (Player integration, mini-player, full player, queue management). Replace with download UI tasks: download button on song detail, download progress indicator, "My Downloads" library section. | Before: building playback UI. Now: building download UI. |
| 7 | **Sprint 6 – Analytics**: Change `stream analytics per song` → `download analytics per song`. | Before: stream count analytics. Now: download count analytics. |

---

### 6. `docs/tech_stack.md`

| # | Change | Why |
|---|--------|-----|
| 1 | **Remove `react-native-track-player`** from dependencies. It handles background audio, queue, and lock screen controls — all streaming features. | Before: needed for audio playback. Now: no in-app playback. |
| 2 | **Audio Playback Architecture section**: **Remove entirely** or rename to **"Audio Download Architecture"**. Replace the streaming architecture diagram (`GET /api/v1/songs/:id/stream → CloudFront signed URL → 128kbps AAC stream`) with a download architecture (`GET /api/v1/songs/:id/download → signed download URL → file download to device`). | Before: full streaming delivery architecture. Now: file download delivery architecture. |
| 3 | **Consider adding** `expo-file-system` or `react-native-blob-util` for handling file downloads and local storage on device. | Before: no download library needed (streaming). Now: need download + file management libraries. |

---

### 7. `docs/design_system.md`

| # | Change | Why |
|---|--------|-----|
| 1 | **Section 9 – Player UI System**: **Remove entirely** or repurpose for download UI components. | Before: design tokens for player/playback UI. Now: no player UI. |
| 2 | **`accent-tertiary` (Cyan Pulse)**: Change usage from `"Streaming/playback indicators, waveforms"` → `"Download indicators, progress bars"`. | Before: streaming visual indicators. Now: download visual indicators. |
| 3 | **`gradient-player`**: Remove or rename to `gradient-download`. Change usage from `"Now-playing bar, active player"` → `"Download progress, active download"`. | Before: player gradient. Now: no player. |
| 4 | **Album Art Color Extraction for full-screen player**: Remove. No full-screen player. | Before: dynamic theming for player screen. Now: no player screen. |

---

### 8. `docs/screens.md`

| # | Change | Why |
|---|--------|-----|
| 1 | **Screen 17 – Now Playing (Full Player)**: **Remove.** No full-screen player with album art, controls, progress, volume. | Before: streaming playback screen. Now: no playback. |
| 2 | **Screen 18 – Queue**: **Remove.** No queue, up-next, or reorder UI. | Before: queue management for streaming. Now: no queue. |
| 3 | **Screen 19 – Mini Player**: **Remove.** No sticky bottom bar player. | Before: persistent player component. Now: no player. |
| 4 | **Screen 34 – Artist Dashboard**: Change `"Revenue, streams, followers overview"` → `"Revenue, downloads, followers overview"`. | Before: streams as key metric. Now: downloads as key metric. |
| 5 | **Screen 36 – Stream Analytics**: Rename to **"Download Analytics"**. Change `"Stream count chart, top songs"` → `"Download count chart, top songs"`. | Before: stream analytics. Now: download analytics. |
| 6 | **Add new screen – My Downloads / Library**: A screen where fans see their downloaded files and can re-download. | Before: no downloads screen (streaming model). Now: core screen for the download model. |
| 7 | **Song Detail Screen**: Add prominent **Download** button (replaces any Play/Stream button). Show download status (downloaded / not downloaded). | Before: play/stream action. Now: download action. |

---

### 9. `docs/risks.md`

| # | Change | Why |
|---|--------|-----|
| 1 | **R14 – "Stream count manipulation"**: Rename to **"Download count manipulation"**. Update mitigation strategies for download abuse (rate limiting downloads, tracking re-downloads vs unique downloads). | Before: stream count fraud risk. Now: download count fraud risk. |
| 2 | **R16 – "CDN cost explosion"**: Update context — CDN costs are now per-download (larger one-time transfers) instead of per-stream. May need different cost modeling. Consider download limits per purchase. | Before: streaming bandwidth costs. Now: download bandwidth costs (different pattern — fewer but larger transfers). |
| 3 | **Add new risk – File piracy**: Downloaded files can be freely redistributed. Consider DRM or watermarking strategy. | Before: streaming made piracy harder (no local file). Now: downloads are inherently more piracy-prone. |

---

### 10. `docs/monetization.md`

| # | Change | Why |
|---|--------|-----|
| 1 | Replace any `"per-stream"` revenue references with **per-download** or **per-purchase** revenue model. | Before: revenue tied to stream counts. Now: revenue tied to purchases/downloads. |
| 2 | Subscription model: clarify that subscribers get unlimited downloads (not unlimited streaming). | Before: subscription = unlimited streaming. Now: subscription = unlimited downloads. |

---

### 11. `docs/sprint_progress.md`

| # | Change | Why |
|---|--------|-----|
| 1 | Update future sprint descriptions to reflect download model when sprints 4–6 are planned. No immediate change needed since these sprints haven't started. | Before: future sprints reference streaming. Now: should reference downloads when they begin. |

---

## Screens Changes

> **Note:** The design file `tuneN2.pen` referenced in `docs/screens.md` was not found on disk. Screen changes below reference the screen inventory from `docs/screens.md`. When the `.pen` file is available, apply these changes to the actual designs.

### Screens to Remove

| Screen # | Screen Name | Reason |
|----------|-------------|--------|
| 17 | **Now Playing (Full Player)** | Full-screen playback UI with album art, playback controls, progress bar, and volume. No longer needed — there is no in-app playback. |
| 18 | **Queue** | Queue management (up next, reorder, clear). No longer needed — there is no playback queue. |
| 19 | **Mini Player** | Sticky bottom bar with current track info and play/pause. No longer needed — there is no persistent player. |

### Screens to Modify

| Screen # | Screen Name | Change | Before → Now |
|----------|-------------|--------|--------------|
| 34 | **Artist Dashboard** | Replace "streams" metric with "downloads" metric throughout. Update any stream count displays to download counts. | Before: shows total streams as a key metric. Now: shows total downloads as a key metric. |
| 35 | **Earnings Breakdown** | Update revenue split labels if they reference streaming revenue. | Before: may show "streaming revenue" category. Now: show "download/sales revenue". |
| 36 | **Stream Analytics** | Rename to **"Download Analytics"**. Replace all stream count charts with download count charts. Update axis labels, tooltips, summary cards. | Before: "Stream Analytics" with stream counts. Now: "Download Analytics" with download counts. |
| — | **Song Detail Screen** (whichever screen shows individual song info) | Replace Play/Stream button with a **Download** button. Add download status indicator (downloaded ✓ / not downloaded). Remove any playback-related UI (waveform, duration progress). | Before: primary action is "Play" or "Stream". Now: primary action is "Download". |
| — | **Search Results / Browse** | Remove any "now playing" indicators or mini-player overlays from bottom of screen. | Before: mini-player may overlay browse screens. Now: no player overlay. |
| — | **Library / My Music** | Reframe as **"My Downloads"** — show list of purchased & downloaded files with download status, file size, re-download option. | Before: library focused on playback history/favorites. Now: library focused on owned downloaded files. |

### Screens to Add

| Screen Name | Purpose |
|-------------|---------|
| **My Downloads** | List of all purchased and downloaded songs. Shows download status, file size. Option to re-download. This is the primary library screen. |
| **Download Progress** | Overlay or inline indicator showing active download progress (percentage, file size). Could be a component rather than a full screen. |

---

## Code Changes (for reference)

> These are existing code files that already contain streaming references. Update when implementing the doc changes above.

| File | Change | Details |
|------|--------|---------|
| `packages/shared/src/types/index.ts` | Rename `streamUrl` → `downloadUrl`, `streamCount` → `downloadCount` in Song interface (lines 70, 74). | Type definitions drive the whole app. |
| `mobile/stores/playerStore.ts` | **Remove or replace entirely.** The entire store is a streaming playback state manager (queue, shuffle, repeat, play/pause). Replace with a `downloadStore` managing download state. | Before: player state with `streamUrl`, queue, shuffle, repeat. Now: download state with download progress, downloaded files list. |
| `backend/src/jobs/transcode.job.ts` | Line 22 comment: change `stream_url` → `download_url`. Update the TODO to reflect that the transcoded file URL is a download URL, not a stream URL. | Before: transcode output is `stream_url`. Now: transcode output is `download_url`. |
| `backend/prisma/schema.prisma` | When Song model is added: use `downloadUrl` and `downloadCount` instead of `streamUrl` and `streamCount`. | Schema hasn't been built for songs yet — prevent streaming columns from ever being created. |
