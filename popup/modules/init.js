import { syncCheckboxesToStorage } from './storage.js';
import { renderChannelGrid, disabledChannels, pinnedChannels } from './channel-grid.js';
import { renderPage, applyTranslations, initNavigation } from './ui-navigation.js';
import { repositionBtn, initLayoutOptions } from './layout-options.js';
import { translations, lang } from './translations.js';

export async function initPopup() {
    syncCheckboxesToStorage();
    initNavigation();
    initLayoutOptions();

    renderPage('view-default');
    applyTranslations();

    chrome.storage.local.get(['layout-vertical-twitch', 'layout-firefox-logo', 'layout-firefox-wordmark', 'layout-search-bar', 'layout-resizable-bar'], (result) => {
        document.getElementById('layout-firefox-logo').checked = result['layout-firefox-logo'] ?? true;
        document.getElementById('layout-firefox-wordmark').checked = result['layout-firefox-wordmark'] ?? true;
        document.getElementById('layout-search-bar').checked = result['layout-search-bar'] ?? true;
        document.getElementById('layout-vertical-twitch').checked = result['layout-vertical-twitch'] || false;
        document.getElementById('layout-resizable-bar').checked = result['layout-resizable-bar'] || false;
    });

    chrome.storage.local.get(['disabledChannels', 'pinnedChannels'], (result) => {
        if (result.disabledChannels) {
            disabledChannels.clear();
            result.disabledChannels.forEach(id => disabledChannels.add(id));
        }
        if (result.pinnedChannels) {
            pinnedChannels.length = 0;
            pinnedChannels.push(...result.pinnedChannels);
        }
        renderChannelGrid();
    });

    chrome.storage.local.get('repositionMode', (result) => {
        repositionBtn.classList.toggle('active', result.repositionMode === true);
        repositionBtn.textContent = result.repositionMode ?  translations[lang]["done_repositioning"] : translations[lang]["reposition_bars"];
    });
}
