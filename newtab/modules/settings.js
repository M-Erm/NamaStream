import { DEFAULT_SETTINGS } from './constants.js';
import { firefox_logo, firefox_wordmark, search_bar, barsSection, bars } from './dom-refs.js';

export async function getCachedSettings()
{
    const result =
        await chrome.storage.local.get(
            Object.keys(DEFAULT_SETTINGS)
        );

    return {
        ...DEFAULT_SETTINGS, // spread: começa com os defaults, sobrescreve com o que veio do storage
        ...result
    };
}

export function initCachedSettings(settings)
{
    bars[0].classList.toggle( 'hidden', !settings['youtube-streams'] );
    bars[1].classList.toggle( 'hidden', !settings['agenda'] );
    bars[2].classList.toggle( 'hidden', !settings['twitch-streams']);

    firefox_logo.classList.toggle( 'hidden', !settings['layout-firefox-logo'] );
    firefox_wordmark.classList.toggle( 'hidden', !settings['layout-firefox-wordmark'] );
    search_bar.classList.toggle( 'hidden', !settings['layout-search-bar'] );
    
    barsSection.classList.toggle('twitch-vertical', settings['layout-vertical-twitch']);
    barsSection.classList.toggle('resizable', settings['layout-resizable-bar']);

    document.body.classList.toggle( 'reposition-mode', settings.repositionMode );
}
