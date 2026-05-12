# NamaStream · VTuber Live Dashboard

> A Firefox new tab extension that replaces your browser's default new tab with a real-time dashboard of VTuber live streams and upcoming schedules — powered by the YouTube Data API.

![License](https://img.shields.io/github/license/M-Erm/namastream)
![Firefox Add-on](https://img.shields.io/badge/Firefox-Add--on-FF7139?logo=firefox-browser&logoColor=white)
![Cloudflare Workers](https://img.shields.io/badge/Backend-Cloudflare%20Workers-F38020?logo=cloudflare&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)

---

<img width="1919" height="965" alt="image" src="https://github.com/user-attachments/assets/be126353-79ad-4dcf-9fd2-c5b2c8e82f54" />


## Features

Scheduled Youtube Streams
Live Twitch Streams
Pin / Disable Channels via Popup
Change / Store Wallpapers

### Live right now
- **Active streams panel** — Shows all VTubers currently live on YouTube with thumbnails, titles, and viewer counts
- **Upcoming streams panel** — Scheduled streams with start times, sorted chronologically
- **Custom new tab page** — Takes over Firefox's new tab with a full-screen dashboard
- **Wallpaper support** — Set and save custom backgrounds via the extension popup

### Architecture highlights
- Backend runs on **Cloudflare Workers** (Hono + TypeScript) - almost zero cold-start latency on the free plan
- Chunked parallel fetching to stay within Cloudflare's connection limits per request
- Cron-based cache refresh every 5~6 minutes
- API key never exposed to the client - all YouTube Data API calls go through the Worker

## Roadmap

- [X] Twitch live stream support -> Solved (V1.21)
- [X] Horizontal → vertical layout toggle -> Solved (V1.22)
- [X] Extension popup with:
  - [x] Wallpaper picker (upload and persist) -> Solved (V1.1)
  - [X] Per-VTuber channel filtering (show/hide) -> Solved (V1.21)
  - [X] Starred channels pinned to the top of the dashboard -> Solved (V1.21)
- [X] Paginated/scrollable upcoming streams -> Solved (V1.1)

## Changelogs

### 1.0

Youtube API Integration
Dashboard (Scheduled And Live Streams)

### 1.1

Wallpaper Picker (Cache)
Scrollable Bars

### 1.21

- Twitch API Integration
- Cron (~5000ms -> 250ms)
- Versionament (Mantain old Endpoint System)
- Popup Layout Rework

### 1.22

- Disable and Pin Channels (Sort)
- Popup Layout Section Rework
- General Popup UI Changes

### 1.23

- Fix Disabled Channels Var

### 1.3

- Geo-Meteor API (Weather)
- Resizable Bar Option
- Fixed bar -> Reposition mode
- Bar slide smooth + snap
- New Tab Bug fixes
- Popup new buttons, changes and fixes

## Stack

| Layer | Tech |
|---|---|
| Extension | HTML · CSS · Vanilla JS |
| Backend | Cloudflare Workers · Hono · TypeScript |
| Storage | Cloudflare KV |
| API | YouTube Data API v3 and Twitch API |

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) — `npm install -g wrangler`
- A Google Cloud project with YouTube Data API v3 enabled
- A Cloudflare account (free tier works)
- A Twitch account

### Setup

```bash
# Clone the repo
git clone https://github.com/M-Erm/NamaStream.git
cd namastream

# Install backend dependencies
cd worker
npm install

# Set your YouTube API key and Twitch Client Secret as Wrangler secrets
wrangler secret put YOUTUBE_API_KEY
wrangler secret put Client_Id
wrangler secret put Client_Secret
```

### Running locally

```bash
# Start the Cloudflare Worker in dev mode
cd worker
wrangler dev
```

To load the extension in Firefox:
1. Open `about:debugging`
2. Click **This Firefox** → **Load Temporary Add-on**
3. Select `manifest.json` from the root of this repo

## Project Structure

```
namastream/
├── manifest.json # Extension manifest (MV3)
├── newtab/
│   ├── newtab.html
│   ├── newtab.css
│   └── newtab.js       # Fetches from the Worker, renders panels
├── popup/
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── logo/
│   ├── DefaultBackground.png
│   └── about-logo.png
│   └── firefox-wordmark.svg
└── API/                # Cloudflare Workers backend
    ├── src/
    │   └── index.ts       # Hono routes
    │   └── youtubeService.js  # Youtube API
    │   └── twitchService.js   # Twitch API
    │   └── old.js             # Old API Functions
    │   └── cache.js           # Cache Backend System  
    ├── wrangler.jsonc
    └── package.json
    └── tsconfig.json
    └── worker-configuration.d.ts
```

## YouTube API & Legal

This extension uses the [YouTube Data API v3](https://developers.youtube.com/youtube/v3). By using NamaStream, you agree to be bound by the [YouTube Terms of Service](https://www.youtube.com/t/terms).

---

## Twitch API & Legal

This extension uses the [Twitch API](https://dev.twitch.tv/docs/api/). By using NamaStream, you agree to be bound by the [Twitch Terms of Service](https://legal.twitch.com/legal/developer-agreement/)

---

## Privacy Policy

**Last updated:** 2026

NamaStream does not collect, store, or transmit any personal data from users.

- **No accounts:** The extension requires no login and stores no user credentials.
- **No tracking:** There are no analytics, telemetry, or third-party trackers in the extension.
- **No user data sent to the backend:** The Cloudflare Worker fetches public YouTube data on behalf of the browser. No personally identifiable information is sent to or logged by the Worker.
- **YouTube Data API.** This extension uses YouTube API Services. YouTube may collect data as described in the [Google Privacy Policy](https://policies.google.com/privacy).
- **Twitch API.** This extension uses Twitch API Services.
- **Local storage:** Any user preferences (e.g., wallpaper selection, pinned channels) are stored locally in your browser via the Web Extensions storage API and never leave your device.

For questions about privacy, open an issue in this repository.

---

## License

[MIT](./LICENSE)

---

*NamaStream is an independent project and is not affiliated with or endorsed by Cover Corp., YouTube, Twitch or Google.*
