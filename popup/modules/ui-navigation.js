import { translations, lang } from './translations.js';

export const views = document.querySelectorAll('.view');
export const backBtn = document.getElementById('back-btn');
export const title = document.getElementById('popup-title');

export const viewTitles = {
    'view-default':  'NamaStream Settings',
    'view-channels': 'Channels',
    'view-layout':   'Layout',
};

export function renderPage(viewId) {
    views.forEach(view => view.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');

    title.textContent = viewTitles[viewId];
    backBtn.classList.toggle('hidden', viewId === 'view-default');
}

export function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (translations[lang][key]) el.textContent = translations[lang][key];
    });
}

export function initNavigation() {
    document.querySelectorAll('.action-btn[data-target]').forEach(btn => {
        btn.addEventListener('click', () => renderPage(btn.dataset.target));
    });

    backBtn.addEventListener('click', () => renderPage('view-default'));
    document.getElementById('close-btn').addEventListener('click', () => window.close());
}
