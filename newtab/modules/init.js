import { filterStreams } from './stream-filters.js';
import { renderStreams } from './stream-renderers.js';
import { makeDraggable, makeMovable } from './interactions.js';
import { youtube, agenda, twitch, bars } from './dom-refs.js';
import { getCachedSettings, initCachedSettings } from './settings.js';
import { addEventListeners } from './event-listeners.js';
import { initWeather } from './weather.js';
import { restoreBarPositions, saveRestoreBarSizes } from './bar-positioning.js';
import { renderWallpaperSlots, bindSlotClicks, updateWallpaperSlots } from './wallpapers.js';

export async function initNewtab() {
    addEventListeners();

    try {
        console.time('Tempo de Resposta');
        const response = await fetch("https://namastream.migueloliv-dev.workers.dev/v3/youtube");
        const twitchRes = await fetch("https://namastream.migueloliv-dev.workers.dev/v3/twitch");
        console.timeEnd('Tempo de Resposta');

        const videosResponse = await response.json();
        const twitchResponse = await twitchRes.json();
        const data = await filterStreams(videosResponse, twitchResponse);
        renderStreams(data.HappeningStreams, data.ScheduledStreams, data.TwitchStreams);
        makeDraggable(youtube);
        makeDraggable(agenda);
        makeDraggable(twitch);
        bars.forEach(bar => makeMovable(bar));

    } catch (err) {
        console.error("Erro ao carregar streams:", err);
    }

    initWeather();
    await restoreBarPositions();
    saveRestoreBarSizes();

    const settings = await getCachedSettings();
    initCachedSettings(settings);

    const wallpaperCache = await chrome.storage.local.get('wallpapers');
    let wallpaperSlots = wallpaperCache.wallpapers || [];

    if (wallpaperSlots.length === 0) {
        wallpaperSlots = [{ type: 'url', data: '/assets/DefaultBackground.png' }];
        await chrome.storage.local.set({ wallpapers: wallpaperSlots });
    }

    updateWallpaperSlots(wallpaperSlots);

    if (wallpaperSlots[0]) {
        document.documentElement.style.setProperty(
            '--wallpaper-url',
            `url(${wallpaperSlots[0].data})`
        );
    }

    renderWallpaperSlots();
    bindSlotClicks();
}
