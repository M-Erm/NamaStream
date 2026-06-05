import { channelIDs } from './channels-data.js';
import { translations, lang } from './translations.js';

export let disabledChannels = new Set();
export let pinnedChannels = [];

export function renderChannelGrid() {
    const grid = document.getElementById('yt-channel-grid');
    grid.innerHTML = '';

    channelIDs.forEach(channel => {
        const card = document.createElement('div');
        card.className = 'channel-card';
        if (disabledChannels.has(channel.channelId)) card.classList.add('disabled');

        const avatar = document.createElement('div');
        avatar.className = 'ch-avatar';

        const name = document.createElement('span');
        name.className = 'ch-name';
        name.textContent = channel.name;

        card.appendChild(avatar);
        card.appendChild(name);

        const pinIndex = pinnedChannels.indexOf(channel.channelId);
        if (pinIndex !== -1) {
            const badge = document.createElement('span');
            badge.className = 'pin-badge';
            badge.textContent = pinIndex + 1;
            card.appendChild(badge);
        }

        card.addEventListener('click', () => {
            if (disabledChannels.has(channel.channelId)) {
                disabledChannels.delete(channel.channelId);
            } else {
                disabledChannels.add(channel.channelId);
            }
            renderChannelGrid();
            chrome.storage.local.set({ disabledChannels: Array.from(disabledChannels) });
        });

        card.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const idx = pinnedChannels.indexOf(channel.channelId);
            if (idx !== -1) {
                pinnedChannels.splice(idx, 1);
            } else {
                pinnedChannels.push(channel.channelId);
            }
            renderChannelGrid();
            chrome.storage.local.set({ pinnedChannels });
        });

        grid.appendChild(card);
    });
}
