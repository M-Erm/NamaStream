# NamaStream · VTuber Live Dashboard

> A Firefox new tab extension that replaces your browser's default new tab with a real-time dashboard of VTuber live streams and upcoming schedules. Powered by the YouTube and Twitch APIs.

![License](https://img.shields.io/github/license/M-Erm/namastream)
![Firefox Add-on](https://img.shields.io/badge/Firefox-Add--on-FF7139?logo=firefox-browser&logoColor=white)
![Cloudflare Workers](https://img.shields.io/badge/Backend-Cloudflare%20Workers-F38020?logo=cloudflare&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)

---

![Demonstration](https://i.imgur.com/klk3Nz2.png)

---

## Features

- **Live streams panel** — VTubers currently live on YouTube, with thumbnails, titles, and viewer counts
- **Upcoming streams panel** — Scheduled streams sorted by start time, with localized countdowns
- **Twitch panel** — VTubers currently live on Twitch
- **Weather widget** — Current conditions, feels-like, humidity and wind speed based on your location; supports manual city search
- **Custom new tab** — Takes over Firefox's new tab with a full-screen dashboard and custom wallpaper support
- **Popup settings** — Pin or disable individual channels, toggle bars, change layout, reposition bars freely, resize bars

### Architecture highlights

- Backend on **Cloudflare Workers** (Hono + TypeScript) with a Cron Trigger that refreshes the cache every 6 minutes, decreasing cold-start (5000ms -> 500ms)
- Chunked parallel fetching to stay within Cloudflare's simultaneous connection limit
- Integration with 5 different APIs
- Client-side stream filtering and sorting, reducing server processing

---

## Roadmap

- [x] Scrollable stream bars (v1.1)
- [x] Wallpaper picker with local storage (v1.1)
- [x] Twitch live stream support (v1.21)
- [x] Per-channel enable/disable and pin (v1.21)
- [x] Weather widget with geolocation and city search (v1.3)
- [x] Reposition mode — drag bars freely (v1.3)
- [x] Resizable bars (v1.3)
- [x] Layout options — toggle logo, search bar, individual stream bars (v1.3)
- [x] Twitch channel disable/pin (V1.3.1)
- [x] Wallpaper Site Integration (V1.3.1)
- [ ] Vertical Twitch bar layout
- [ ] Optional live preview on thumbnail hover

## Stacks

| Layer | Tech |
|---|---|
| Extension | HTML · CSS · Vanilla JS |
| Backend | Cloudflare Workers · Hono · TypeScript |
| Cache | Cloudflare KV |
| APIs | YouTube Data API v3 · Twitch API · Open-Meteo · Nominatim |

---

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) — `npm install -g wrangler`
- A Google Cloud project with YouTube Data API v3 enabled
- A Cloudflare account (free tier)
- A Twitch developer account

### Setup

```bash
git clone https://github.com/M-Erm/NamaStream.git
cd NamaStream

cd worker
npm install

# Store secrets — never committed to the repo
wrangler secret put YOUTUBE_API_KEY
wrangler secret put Client_Id
wrangler secret put Client_Secret
```

### Running locally

```bash
# Worker dev server
cd worker
wrangler dev

# To test the Cron Trigger locally:
curl "http://localhost:8787/__scheduled"
```

To load the extension in Firefox:
1. Open `about:debugging`
2. Click **This Firefox** → **Load Temporary Add-on**
3. Select `manifest.json` from the root of this repo

---

## Third-party services

### YouTube Data API
This extension uses the [YouTube Data API v3](https://developers.youtube.com/youtube/v3). By using NamaStream, you agree to the [YouTube Terms of Service](https://www.youtube.com/t/terms).

### Twitch API
This extension uses the [Twitch API](https://dev.twitch.tv/docs/api/). By using NamaStream, you agree to the [Twitch Developer Agreement](https://legal.twitch.com/legal/developer-agreement/).

---

## Documentation

- [Privacy Policy](./PRIVACY.md)
- [Changelog](./CHANGELOG.md)
- [License](./LICENSE)

---
*NamaStream is an independent project not affiliated with or endorsed by Cover Corp., YouTube, Twitch, Google, or OpenStreetMap.*