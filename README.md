# NamaStream · VTuber Live Dashboard

> A Firefox new tab extension that replaces your browser's default new tab with a real-time dashboard of VTuber live streams and upcoming schedules — powered by the YouTube Data API.

![License](https://img.shields.io/github/license/M-Erm/namastream)
![Firefox Add-on](https://img.shields.io/badge/Firefox-Add--on-FF7139?logo=firefox-browser&logoColor=white)
![Cloudflare Workers](https://img.shields.io/badge/Backend-Cloudflare%20Workers-F38020?logo=cloudflare&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)

---

<img width="1919" height="965" alt="image" src="https://github.com/user-attachments/assets/be126353-79ad-4dcf-9fd2-c5b2c8e82f54" />


## Features

> The actual version is not complete and misses some features, like Twitch Streams.

### Live right now
- **Active streams panel** — Shows all VTubers currently live on YouTube with thumbnails, titles, and viewer counts
- **Upcoming streams panel** — Scheduled streams with start times, sorted chronologically
- **Custom new tab page** — Takes over Firefox's new tab with a full-screen dashboard
- **Wallpaper support** — Set and save custom backgrounds via the extension popup

### Architecture highlights
- Backend runs on **Cloudflare Workers** (Hono + TypeScript) — zero cold-start latency on the free plan
- Chunked parallel fetching to stay within Cloudflare's connection limits per request
- In-memory caching with timestamp-based expiration to minimize YouTube API quota usage
- API key never exposed to the client — all YouTube Data API calls go through the Worker

## Roadmap

- [X] Twitch live stream support -> Solved (V1.21)
- [X] Horizontal → vertical layout toggle -> Solved (V1.21)
- [ ] Mobile responsiveness
- [ ] Extension popup with:
  - [x] Wallpaper picker (upload and persist) -> Solved (V1.1)
  - [X] Per-VTuber channel filtering (show/hide) -> Solved (V1.21)
  - [X] Starred channels pinned to the top of the dashboard -> Solved (V1.21)
  - [ ] Optional live preview on thumbnail hover (iframe)
- [X] Paginated/scrollable upcoming streams -> Solved (V1.1)

## Stack

| Layer | Tech |
|---|---|
| Extension | HTML · CSS · Vanilla JS |
| Backend | Cloudflare Workers · Hono · TypeScript |
| Storage | Cloudflare KV |
| API | YouTube Data API v3 |

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) — `npm install -g wrangler`
- A Google Cloud project with YouTube Data API v3 enabled
- A Cloudflare account (free tier works)

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
wrangler secret put Client_Id #Optional
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
├── manifest.json          # Extension manifest (MV3)
├── newtab/
│   ├── index.html
│   ├── style.css
│   └── dashboard.js       # Fetches from the Worker, renders panels
├── popup/
│   ├── popup.html
│   └── popup.js
└── API/                # Cloudflare Workers backend
    ├── src/
    │   └── index.ts       # Hono routes
    │   └── youtubeService.js  # Youtube API
    │   └── twitchService.js   # Twitch API
    │   └── old.js             # Old API Functions
    │   └── cache.js           # Cache Backend System  
    ├── wrangler.toml
    └── package.json
```

## YouTube API & Legal

This extension uses the [YouTube Data API v3](https://developers.youtube.com/youtube/v3). By using NamaStream, you agree to be bound by the [YouTube Terms of Service](https://www.youtube.com/t/terms).

---

## Privacy Policy

**Last updated:** 2026

NamaStream does not collect, store, or transmit any personal data from users.

- **No accounts:** The extension requires no login and stores no user credentials.
- **No tracking:** There are no analytics, telemetry, or third-party trackers in the extension.
- **No user data sent to the backend:** The Cloudflare Worker fetches public YouTube data on behalf of the browser. No personally identifiable information is sent to or logged by the Worker.
- **YouTube Data API.** This extension uses YouTube API Services. YouTube may collect data as described in the [Google Privacy Policy](https://policies.google.com/privacy).
- **Local storage:** Any user preferences (e.g., wallpaper selection, pinned channels) are stored locally in your browser via the Web Extensions storage API and never leave your device.

For questions about privacy, open an issue in this repository.

---

## License

[MIT](./LICENSE)

---

*NamaStream is an independent project and is not affiliated with or endorsed by Cover Corp., YouTube, or Google.*
