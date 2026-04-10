// ===========================================
// Quando informação for alterada no popup, salva a informação do DB da API Chrome.Storage (local)
// ===========================================

const channelIDs = [
  {name: "Dokibird", channelId: "UComInW10MkHJs-_vi4rHQCQ"},
  {name: "HololiveEN", channelId: "UCotXwY6s8pWmuWd_snKYjhg"},
  {name: "Pekora", channelId: "UC1DCedRgGHBdm81E1llLhOQ"},
  {name: "Bae", channelId: "UCgmPnx-EEeOrZSg5Tiw7ZRQ"},
  {name: "Bijou", channelId: "UC9p_lqQ0FEDz327Vgf5JwqA"},
  {name: "Marine", channelId: "UCCzUftO8KOVkV4wQG1vkUvg"},
  {name: "Calli", channelId: "UCL_qhgtOy0dy1Agp8vkySQg"},
  {name: "Nerissa", channelId: "UC_sFNM0z0MWm9A6WlKPuMMg"},
  {name: "Kobo", channelId: "UCjLEmnpCNeisMxy134KPwWw"},
  {name: "Nimi", channelId: "UCIfAvpeIWGHb0duCkMkmm2Q"},
  {name: "Shiori", channelId: "UCgnfPPb9JI3e9A4cXHnWbyg"},
  {name: "Dooby", channelId: "UC6T7TJZbW6nO-qsc5coo8Pg"},
  {name: "Maid Mint", channelId: "UCcHHkJ98eSfa5aj0mdTwwLQ"},
  {name: "Cecilia", channelId: "UCvN5h1ShZtc7nlo3pezRayg"},
  {name: "Hajime", channelId: "UC1iA6_NT4mtAcIII6ygrvCw"},
  {name: "ERB", channelId: "UCW5uhrG1eCBYditmhL0Ykjw"},
  {name: "Zeta", channelId: "UCTvHWSfBZgtxE4sILOaurIQ"},
  {name: "Okayu", channelId: "UCvaTdHTWBGv3MKj3KVqJVCw"},
  {name: "Kiara", channelId: "UCHsx4Hqa-1ORjQTh9TYDhww"},
  {name: "Kronii", channelId: "UCmbs8T6MWqUHP1tIQvSgKrg"},
  {name: "Gigi", channelId: "UCDHABijvPBnJm7F-KlNME3w"},
  {name: "Elite Miko", channelId: "UC-hM6YJuNYVAmUWxeIr9FeA"},
  {name: "Kaela", channelId: "UCZLZ8Jjx_RN2CXloOmgTHVg"},
  {name: "iRyS", channelId: "UC8rcEBzJSleTkf_-agPM20g"},
  {name: "Ina", channelId: "UCMwGHR0BTZuLsmjY_NT5Pwg"},
  {name: "Laplus", channelId: "UCENwRMx5Yh42zWpzURebzTw"},
  {name: "Towa", channelId: "UC1uv2Oq6kNxgATlCiez59hw"},
  {name: "Suisei", channelId: "UC5CwaMl1eIgY8h02uZw7u8A"},
  {name: "Korone", channelId: "UChAnqc_AY5_I3Px5dig3X1Q"},
  {name: "Saba", channelId: "UCxsZ6NCzjU_t4YSxQLBcM5A"},
  {name: "Raora", channelId: "UCl69AEx4MdqMZH7Jtsm7Tig"},
  {name: "Fuwamoco", channelId: "UCt9H_RpQzhxzlyBxFqrdHqA"},
  {name: "Ollie", channelId: "UCYz_5n-uDuChHtLo7My1HnQ"},
];

let disabledChannels = new Set();
let pinnedChannels   = [];

const views   = document.querySelectorAll('.view');
const backBtn = document.getElementById('back-btn');
const title   = document.getElementById('popup-title');

const viewTitles = {
    'view-default':  'VTubers Dashboard',
    'view-channels': 'Channels',
    'view-layout':   'Layout',
};

function showView(viewId) {
    views.forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');

    title.textContent = viewTitles[viewId];

    backBtn.classList.toggle('hidden', viewId === 'view-default'); // Mostra seta de voltar em qualquer view que não seja a padrão
}

document.querySelectorAll('.action-btn[data-target]').forEach(btn => {
    btn.addEventListener('click', () => showView(btn.dataset.target));
});


backBtn.addEventListener('click', () => showView('view-default'));
document.getElementById('close-btn').addEventListener('click', () => window.close());


const sortToggle = document.getElementById('sort-by-branch');
sortToggle.addEventListener('click', () => {
    const isOn = sortToggle.dataset.on === 'true';
    sortToggle.dataset.on = String(!isOn);
    // TODO: salvar no chrome.storage e aplicar na newtab
});

document.querySelectorAll('#view-default .check-row input').forEach(cb => {
    cb.addEventListener('change', () => {
        // TODO: salvar no chrome.storage
        // Estrutura: chrome.storage.local.set({ [cb.id]: cb.checked })
        console.log(`${cb.id} →`, cb.checked);
    });
});

function renderChannelGrid() {
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
            // TODO: persistir no chrome.storage
        });

        card.addEventListener('contextmenu', (e) => { // Clique direito → toggle pin
            e.preventDefault();
            const idx = pinnedChannels.indexOf(channel.channelId);
            if (idx !== -1) {
                pinnedChannels.splice(idx, 1); // remove pin
            } else {
                pinnedChannels.push(channel.channelId); // adiciona no fim
            }
            renderChannelGrid();
            // TODO: persistir no chrome.storage
        });

        grid.appendChild(card);
    });
}


const layoutCheckboxes = document.querySelectorAll('#view-layout .check-row input');

const previewLabels = {
    'layout-streams-yt':     'Streams YT',
    'layout-agenda':         'Agenda',
    'layout-streams-twitch': 'Streams Twitch',
    'layout-vertical-twitch': 'Vertical Twitch',
};

function updateLayoutPreview() {
    const preview = document.getElementById('layout-preview');
    preview.innerHTML = '';

    layoutCheckboxes.forEach(cb => {
        if (!cb.checked) return;

        const block = document.createElement('div');
        block.className = 'preview-block';
        if (cb.id === 'layout-vertical-twitch') block.classList.add('preview-vertical');
        block.textContent = previewLabels[cb.id];
        preview.appendChild(block);
    });

    if (preview.children.length === 0) {
        preview.innerHTML = '<span style="color:var(--text-dim);font-size:11px;margin:auto">Nenhum elemento ativo</span>';
    }
}

layoutCheckboxes.forEach(cb => {
    cb.addEventListener('change', updateLayoutPreview);
});

document.addEventListener('DOMContentLoaded', () => {
    showView('view-default');
    renderChannelGrid();
    updateLayoutPreview();
    // TODO: carregar estado salvo do chrome.storage e aplicar nos checkboxes, disabledChannels, pinnedChannels
});