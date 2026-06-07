## Changelog

### 1.3.2 (v1.32)
- Twitch Vertical Layout
- Youtube Iframe when hovering thumb card (min 5s hover)

### 1.3.1 (v1.31)
- JS Modularization
- Backend: Data Normalization + Usage of Fields on Youtube API -> ~30ms -> 7ms CPU TIME
- Backend: Versionament -> V2/V3
- Twitch POPUP channelgrid + disable/enable channels and pin working
- Wallhaven Integration (Through extensions backend)

### 1.3
- Weather widget (Open-Meteo + Nominatim/OpenStreetMap)
- Reposition mode: drag bars to any position, snap to each other, saved across sessions
- Resizable bars with reset button
- Bar scroll snap on release
- Various popup UI improvements and bug fixes
- Wallpaper picker UI fix
- Removed old.js in Backend (New worker and new fetch)
- Popup translations

### 1.22
- Channel enable/disable and pin with sort priority
- Popup layout section rework
- Layout options: toggle Firefox logo, wordmark, search bar, and individual stream bars

### 1.21
- Twitch API integration
- Cron-based cache refresh (cold path latency: ~5000ms → ~250ms)
- API versioning to maintain backward compatibility

### 1.1
- Wallpaper picker with base64 compression and local storage
- Horizontal scrollable bars with drag and mouse wheel support

### 1.0
- YouTube Data API integration
- Dashboard with live and scheduled stream panels