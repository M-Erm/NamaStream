export let wallpaperSlots = [];
export let pendingFile = null;

export function renderWallpaperSlots()
{
    const slotEls = document.querySelectorAll('.slot');

    slotEls.forEach((el, index) => {
        const slot = wallpaperSlots[index];

        if (slot) {
            el.style.backgroundImage = `url(${slot.data})`;
            el.style.backgroundSize = 'cover';
            el.classList.remove('empty');
        } else {
            el.style.backgroundImage = '';
            el.classList.add('empty');
        }
    });
}

export function bindSlotClicks()
{
    const slotEls = document.querySelectorAll('.slot');

    slotEls.forEach((el) => {
        el.addEventListener('click', async () => {

            const index = parseInt(el.dataset.index);
            if (!wallpaperSlots[index]) return;

            const chosen = wallpaperSlots.splice(index, 1)[0];
            wallpaperSlots.unshift(chosen);

            await chrome.storage.local.set({ wallpapers: wallpaperSlots });

            document.querySelectorAll('.slot').forEach(s => s.classList.remove('active'));
            document.querySelector('.slot[data-index="0"]').classList.add('active');

            renderWallpaperSlots();
            document.documentElement.style.setProperty('--wallpaper-url', `url(${wallpaperSlots[0].data})`);
        });
    });
}

export async function searchWallpapers()
{
    const query = document.getElementById('wallpaper-search').value;
    const results = document.getElementById('wallpaper-results');

    results.innerHTML = '';

    const response = await fetch(`https://namastream.migueloliv-dev.workers.dev/v3/searchwallhaven?q=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
        console.error('Failed to fetch wallpapers');
        return;
    }

    const ResponseData = await response.json();

    document.getElementById('modal-results').classList.remove('hidden');

    ResponseData.data.forEach(wallpaper => {
        const img = document.createElement('img');

        img.src = wallpaper.thumbs.small;

        img.addEventListener('click', async () => {
            await saveWallpaper({ type: 'url', data: wallpaper.path });
        });

        results.appendChild(img);
    });
}

export function compressImage(file, callback)
{
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
        const maxWidth = 1920;
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width  = img.width  * scale;
        canvas.height = img.height * scale;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const base64 = canvas.toDataURL('image/jpeg', 0.85);
        callback(base64);
        URL.revokeObjectURL(img.src);
    };

    img.src = URL.createObjectURL(file);
}

export async function saveWallpaper(wallpaper)
{
    wallpaperSlots = [wallpaper, ...wallpaperSlots].slice(0, 3);
    await chrome.storage.local.set({ wallpapers: wallpaperSlots });
    renderWallpaperSlots();

    document.documentElement.style.setProperty('--wallpaper-url', `url(${wallpaper.data})`);
}

export function updateWallpaperSlots(newSlots) {
    wallpaperSlots = newSlots;
}

export function updatePendingFile(file) {
    pendingFile = file;
}
