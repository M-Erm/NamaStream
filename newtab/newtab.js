// ===========================================
// Pega informações do Cloudflare workers (Backend) e renderiza na Nova Aba.  
// ===========================================

const firefox_el = document.getElementById('firefox-image-wordmark');
const firefox_logo = firefox_el.querySelector('.image');
const firefox_wordmark = firefox_el.querySelector('.wordmark');

const weatherInfo = document.getElementById("weatherinfo");
const weatherMenu = document.getElementById("weatherMenu");
const input = document.getElementById("weatherLocationInput");
const dropdown = document.getElementById("weatherDropdown");
let debounceTimeout;

const search_bar = document.getElementById('search-bar').querySelector('input'); // Para desabilitar/habilitar
const barsSection = document.getElementById('bars');

const youtube = document.getElementById('youtube').querySelector('.scroll-container'); // Pega o ID específico, não o scroll
const agenda = document.getElementById('agenda').querySelector('.scroll-container');
const twitch = document.getElementById('twitch').querySelector('.scroll-container');

const lives = document.querySelectorAll('.live');

const weatherMap = {
  0: "☀️ Céu limpo",
  1: "🌤️ Parcialmente limpo",
  2: "⛅ Nublado",
  3: "☁️ Muito nublado",
  61: "🌧️ Chuvendo",
  95: "⛈️ Tempestade"
};

const bars = [
    document.getElementById('youtube'),
    document.getElementById('agenda'), // Para desabilitar/habilitar
    document.getElementById('twitch')
]

const translations = {
    "en": {
        "watching_now": "Watching Now",
        "hours": " hours",
        "hour": " hour",
        "in_1_minute": "in 1 minute",
        "minutes": " minutes",
        "in": "in ",
        "starts": "Starts"
    },
    "pt-BR": {
        "watching_now": "Assistindo agora",
        "in": "em ",
        "starts": "Começa",
        "hours": " horas",
        "hour": " hora",
        "in_1_minute": "em 1 minuto",
        "minutes": " minutos"
    }
};

const userLanguage = navigator.language || 'en';
const lang = translations[userLanguage] || translations['en'];

let wallpaperSlots = [];
let pendingFile = null;

function makeDraggable(bar) 
{
    let isDragging = false;
    let hasDragged = false;
    let scrollStart = 0;
    let startPos = 0;

    bar.addEventListener('mousedown', (click) => {
        isDragging = true;
        hasDragged = false;
        click.preventDefault();

        startPos = click.pageX;
        scrollStart = bar.scrollLeft;
        bar.style.cursor = 'grabbing';
        bar.style.scrollSnapType = 'none';
    });

    document.addEventListener('mousemove', (click) => {
        if (!isDragging) return;
        click.preventDefault();

        const dragDistance  = click.pageX - startPos;
        if (Math.abs(dragDistance) > 5) hasDragged = true;
        bar.scrollLeft = scrollStart - dragDistance;
    });

    document.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;

        bar.style.cursor = 'grab';
        bar.style.scrollSnapType = '';
        snapLiveEls(bar)
    });

    bar.addEventListener('click', (click) => {
        if (hasDragged) {
            click.stopPropagation();
            click.preventDefault();
        }
    }, true); 

    bar.addEventListener('wheel', (click) => {
        click.preventDefault();
        
        const itemWidth = 215;
        const direction = click.deltaY > 0 ? 1 : -1;
        
        bar.scrollBy({ left: direction * itemWidth, behavior: 'smooth' });
    }, { passive: false });
}

function snapLiveEls(bar) {

    let closest;
    let closestDistance;

    lives.forEach(live => {
        const distance = Math.abs(bar.scrollLeft - live.offsetLeft);

        if (distance < closestDistance) {
            closestDistance = distance;
            closest = live;
        }
    });

    if (closest) {
        bar.scrollTo( { left: closest.offsetLeft, behavior: 'smooth' });
    }
}

function makeMovable(el) {
    if (barsSection.classList.contains('fixed')) return;

    let isMoving;
    let startMouseX;
    let startElX = 0;
    let currentX = 0;

    el.addEventListener('mousedown', (click) => {
        isMoving = true;
        click.preventDefault();
        el.style.cursor = 'grabbing';

        startMouseX = click.clientX;
        startElX = el.getBoundingClientRect().left;
    });

    document.addEventListener('mousemove', (event) => {
        if (!isMoving) return;

        const distance = event.clientX - startMouseX;

        el.style.transform = `translateX(${currentX + distance}px)`;
    });

    document.addEventListener('mouseup', (event) => {
        if (!isMoving) return;
        isMoving = false;

        const distance = event.clientX - startMouseX;
        currentX += distance;
    });
}

function snapBarSections() {

}

async function filterStreams(videosResponse, twitchResponse)
{
    const ScheduledStreams = [];
    const HappeningStreams = [];
    const TwitchStreams = [];

    const { disabledChannels = [], pinnedChannels = [] } = await chrome.storage.local.get(['disabledChannels', 'pinnedChannels']);

    for (const response of videosResponse) {
        for (const video of response.items) {

            if (disabledChannels.includes(video.snippet?.channelId)) {
                continue;
            }

            if (!video.liveStreamingDetails) {
                // Não for stream
                continue;
            }
            else if (video.liveStreamingDetails.actualStartTime && !video.liveStreamingDetails.actualEndTime) {
                // Tiver start mas não tiver end -> acontecendo agora
                HappeningStreams.push(video);
            } else if (video.liveStreamingDetails.scheduledStartTime && !video.liveStreamingDetails.actualStartTime) {
                // tiver scheduled start mas não tiver start -> agendado
                ScheduledStreams.push(video);
            }
        }
    } 

    // Se a tá pinado (algo diferente de -1) e b não — a vem primeiro (retorna negativo). Se b tá pinado e a não — b vem primeiro (retorna positivo). 
    ScheduledStreams.sort((a, b) => { 
        if (pinnedChannels.indexOf(a.snippet.channelId) !== -1 && pinnedChannels.indexOf(b.snippet.channelId) === -1) {
            return new Date(a.liveStreamingDetails.scheduledStartTime) - new Date(b.liveStreamingDetails.scheduledStartTime) - 1000000000;
        } else if (pinnedChannels.indexOf(b.snippet.channelId) !== -1 && pinnedChannels.indexOf(a.snippet.channelId) === -1) {
            return new Date(a.liveStreamingDetails.scheduledStartTime) - new Date(b.liveStreamingDetails.scheduledStartTime) + 1000000000;
        }
        return new Date(a.liveStreamingDetails.scheduledStartTime) - new Date(b.liveStreamingDetails.scheduledStartTime);
    });

    HappeningStreams.sort((a, b) => { 
        if (pinnedChannels.indexOf(a.snippet.channelId) !== -1 && pinnedChannels.indexOf(b.snippet.channelId) === -1) {
            return new Date(a.liveStreamingDetails.scheduledStartTime) - new Date(b.liveStreamingDetails.scheduledStartTime) - 1000000000; 
        } else if (pinnedChannels.indexOf(b.snippet.channelId) !== -1 && pinnedChannels.indexOf(a.snippet.channelId) === -1) {
            return new Date(a.liveStreamingDetails.scheduledStartTime) - new Date(b.liveStreamingDetails.scheduledStartTime) + 1000000000; 
        }
        return new Date(a.liveStreamingDetails.scheduledStartTime) - new Date(b.liveStreamingDetails.scheduledStartTime);
    });

    for (const response of twitchResponse.data) {
        TwitchStreams.push(response);
    }

    return {ScheduledStreams, HappeningStreams, TwitchStreams};
}

function renderStreams(HappeningStreams, ScheduledStreams, TwitchStreams)
{
    let youtubeHTML = '';
    let agendaHTML = '';
    let twitchHTML = '';

    chrome.storage.local.get(['layout-firefox-logo', 'layout-firefox-wordmark', 'layout-search-bar'], (result) => {
        firefox_logo.classList.toggle('hidden', result['layout-firefox-logo'] === false);
        firefox_wordmark.classList.toggle('hidden', result['layout-firefox-wordmark'] === false);
        search_bar.classList.toggle( 'hidden', result['layout-search-bar'] === false);
    });

    chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local') {
        if (changes['layout-firefox-logo']) {
            firefox_logo.classList.toggle('hidden', changes['layout-firefox-logo'].newValue === false);
        } else if (changes['layout-firefox-wordmark']) {
            firefox_wordmark.classList.toggle('hidden', changes['layout-firefox-wordmark'].newValue === false);
        } else if (changes['layout-search-bar']) {
            search_bar.classList.toggle('hidden', changes['layout-search-bar'].newValue === false);
        }
    }});

    chrome.storage.local.get(['agenda', 'youtube-streams', 'twitch-streams'], (result) => {
        bars[0].classList.toggle('hidden', result['youtube-streams'] === false);
        bars[1].classList.toggle('hidden', result['agenda'] === false);
        bars[2].classList.toggle('hidden', result['twitch-streams'] === false);
    });

    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'local') {
            if (changes['youtube-streams']) {
                bars[0].classList.toggle('hidden', changes['youtube-streams'].newValue === false);
            } else if (changes['agenda']) {
                bars[1].classList.toggle('hidden', changes['agenda'].newValue === false);
            } else if (changes['twitch-streams']) {
                bars[2].classList.toggle('hidden', changes['twitch-streams'].newValue === false);
            }
        }
    });

    HappeningStreams.forEach(stream => {
        try {
            youtubeHTML += `
                <div class="live"> 
                    <a href="https://www.youtube.com/watch?v=${stream.id}" target="_blank" class="live-thumb">
                        <img src="${stream.snippet.thumbnails.maxres?.url ?? stream.snippet.thumbnails.high.url} " alt="Channel Pfp"> 
                    </a>
                    <div class="live-info">
                        <div>
                            <a target="_blank" class="streamtitle" href="https://www.youtube.com/watch?v=${stream.id}">${stream.snippet.title}</a>
                        </div>

                        <a target="_blank" class="channelname" href="https://www.youtube.com/channel/${stream.snippet.channelId}"> ${stream.snippet.channelTitle} </a>
                        <div style="color: white">${stream.liveStreamingDetails.concurrentViewers} ${lang.watching_now} </div>
                    </div>
                </div>`
                
        } catch (err) {
            console.log(err);
        }
    });

    ScheduledStreams.forEach(stream => {
        try {

            let displayText;
            const localCurrentTime = new Date();

            const localStreamHour = new Date(stream.liveStreamingDetails.scheduledStartTime);
            const localStreamDate = localStreamHour.toLocaleDateString('pt-BR');

            const localStreamTimeLeftMS = localStreamHour - localCurrentTime; //Resposta em ms (número muito alto, como 1000000000)

            const localStreamTimeLeft = localStreamTimeLeftMS / (60 * 60 * 1000); // Passa a ser em Horas 
            const localStreamHoursLeft = Math.floor(localStreamTimeLeft)

            if (localStreamHoursLeft >= 24) {
                displayText = localStreamDate; // Se > 24 horas, vira data
            } else if (localStreamHoursLeft > 1) {
                displayText = lang.in + localStreamHoursLeft.toLocaleString() + lang.hours;
            } else if (localStreamHoursLeft === 1){
                displayText = lang.in + localStreamHoursLeft.toLocaleString() + lang.hour;
            }else {
                const localStreamMinutesLeft = Math.floor(localStreamTimeLeft * 60);
                if (localStreamMinutesLeft === 1) {
                    displayText = lang.in_1_minute;
                } else {
                    displayText = lang.in + localStreamMinutesLeft + lang.minutes;
                }
            }

            const localStreamStartTime = new Date(stream.liveStreamingDetails.scheduledStartTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

            agendaHTML += `
                <div class="live"> 
                    <a href="https://www.youtube.com/watch?v=${stream.id}" target="_blank" class="live-thumb">
                        <img src="${stream.snippet.thumbnails.maxres.url ?? stream.snippet.thumbnails.high.url}" alt="Channel Pfp"> 
                    </a>
                    <div class="live-info">
                        <div>
                            <a target="_blank" class="streamtitle" href="https://www.youtube.com/watch?v=${stream.id}">${stream.snippet.title}</a>
                        </div>

                        <a target="_blank" class="channelname" href="https://www.youtube.com/channel/${stream.snippet.channelId}"> ${stream.snippet.channelTitle} </a>
                        <div style="color: white"> ${lang.starts} ${displayText} (${localStreamStartTime})</div>
                    </div>
                </div>`
        } catch (err) {
            console.log(err);
        }
    });

    TwitchStreams.forEach(stream => {
    try {
        twitchHTML += `
            <div class="live"> 
                <a href="https://www.twitch.tv/${stream.user_name}" target="_blank" class="live-thumb">
                    <img src="${stream.thumbnail_url.replace("{width}", "320").replace("{height}", "180")}" alt="Channel Pfp"> 
                </a>
                <div class="live-info">
                    <div>
                        <a target="_blank" class="streamtitle" href="https://www.twitch.tv/${stream.user_name}">${stream.title}</a>
                </div>

                    <a target="_blank" class="channelname" href="https://www.twitch.tv/${stream.user_name}"> ${stream.user_name} </a>
                    <div style="color: white">${stream.viewer_count} ${lang.watching_now} </div>
                </div>
            </div>`
    } catch (err) {
        console.log(err);
    }
})

    youtube.innerHTML = youtubeHTML;
    agenda.innerHTML = agendaHTML;
    twitch.innerHTML = twitchHTML;
}

function renderWeather(weatherData, geoData, manualName = null) 
{
    const current = weatherData.current;

const place = manualName || (geoData?.address?.city || geoData?.address?.town || geoData?.address?.village || geoData?.address?.municipality || geoData?.address?.county || "Local desconhecido") + (geoData?.address?.state ? `, ${geoData.address.state}` : "");


    document.getElementById("weatherTemp").textContent =`${Math.round(current.temperature_2m)}°`;
    document.getElementById("weatherLocation").textContent = place;
    document.getElementById("weatherFeels").textContent = `Sensação: ${Math.round(current.apparent_temperature)}°`;
    document.getElementById("weatherHumidity").textContent = `Umidade: ${current.relative_humidity_2m}%`;
    document.getElementById("weatherWind").textContent = `Vento: ${Math.round(current.wind_speed_10m)} km/h`;
    setWeatherIcon(current.weather_code);
}

function renderDropdown(results) 
{

    const dropdown = document.getElementById("weatherDropdown");

    dropdown.innerHTML = "";

    results.forEach((place) => {

        const div = document.createElement("div");
        div.className = "weather-option";

        const label =
            `${place.name}` +
            (place.admin1 ? `, ${place.admin1}` : "") +
            (place.country ? `, ${place.country}` : "");

        div.textContent = label;

        div.addEventListener("click", () => {
            dropdown.innerHTML = "";
            document.getElementById("weatherLocationInput").value = label;

            chrome.storage.local.set({
                weatherMode: "manual",
                lat: place.latitude,
                lon: place.longitude,
                name: place.name
            });

            fetchWeatherFromCoords(place.latitude, place.longitude, place.name);

            weatherInfo.classList.remove("settings-open");
        });

        dropdown.appendChild(div);
    });
}

function setWeatherIcon(code) 
{

    const weatherIcon = document.getElementById("weatherIcon");

    let icon = "night-clear";

    if (code === 0) {
        icon = "sunny";
    }
    else if ([1, 2].includes(code)) {
        icon = "partly-cloudy";
    }
    else if (code === 3) {
        icon = "cloudy";
    }
    else if (code >= 51 && code <= 67) {
        icon = "rain";
    }
    else if (code >= 80) {
        icon = "thunderstorm";
    }

    weatherIcon.style.content =
        `url("chrome://browser/skin/weather/${icon}.svg")`;
}
 
function renderWallpaperSlots() 
{   
    const slotEls = document.querySelectorAll('.slot');
 
    slotEls.forEach((el, index) => {
        const slot = wallpaperSlots[index];
 
        if (slot) { // Se tiver index(wallpaper), renderiza. Se não, deixa vazio
            el.style.backgroundImage = `url(${slot.data})`; 
            el.style.backgroundSize = 'cover';
            el.classList.remove('empty');
        } else {
            el.style.backgroundImage = '';
            el.classList.add('empty');
        }
    });
}

function bindSlotClicks() { // Adiciona evento de click em cada slot para escolher wallpaper
    const slotEls = document.querySelectorAll('.slot');
 
    slotEls.forEach((el) => {
        el.addEventListener('click', async () => {

            const index = parseInt(el.dataset.index);
            if (!wallpaperSlots[index]) return; // if slot vazio
 
            const chosen = wallpaperSlots.splice(index, 1)[0]; // remove de onde estava
            wallpaperSlots.unshift(chosen); // coloca na frente
 
            await chrome.storage.local.set({ wallpapers: wallpaperSlots }); // Salva a nova ORDEM na cache
 
            document.querySelectorAll('.slot').forEach(s => s.classList.remove('active')); // Atualiza qual slot tem a borda ativa
            document.querySelector('.slot[data-index="0"]').classList.add('active');
 
            renderWallpaperSlots();
            document.documentElement.style.setProperty('--wallpaper-url', `url(${wallpaperSlots[0].data})`);
        });
    });
}

function compressImage(file, callback) 
{ 
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d'); // Contexto para desenhar a imagem no canvas e depois extrair o base64 comprimido
    const img = new Image();
 
    img.onload = () => {
        const maxWidth = 1920;
        const scale = Math.min(1, maxWidth / img.width); // Se a imagem for maior que 1920px, reduz. Se for menor, mantém o tamanho original
        canvas.width  = img.width  * scale; 
        canvas.height = img.height * scale; 
 
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height); // 0 e 0 são as coordenadas de onde começa o desenho.
 
        const base64 = canvas.toDataURL('image/jpeg', 0.85); // Comprime a imagem para JPEG com qualidade de 85%
        callback(base64);
        URL.revokeObjectURL(img.src); // Libera a memória usada para o objeto URL criado para a imagem, já que não é mais necessário após o carregamento e compressão.
    };
 
    img.src = URL.createObjectURL(file);
}

async function saveWallpaper(wallpaper) 
{
    wallpaperSlots = [wallpaper, ...wallpaperSlots].slice(0, 3); // Slice faz com que só tenha 3 wallpapers, removendo o mais antigo se passar disso
    await chrome.storage.local.set({ wallpapers: wallpaperSlots }); // Salva o WALLPAPER na cache
    renderWallpaperSlots();

    document.documentElement.style.setProperty('--wallpaper-url', `url(${wallpaper.data})`);
}

async function loadStreams() 
{
    try {
        console.time('Tempo de Resposta');
        const response = await fetch("https://namastream.migueloliv-dev.workers.dev/v2/youtube");
        const twitchRes = await fetch("https://namastream.migueloliv-dev.workers.dev/v2/twitch");
        console.timeEnd('Tempo de Resposta');

        const videosResponse = await response.json();
        const twitchResponse = await twitchRes.json();
        const data = await filterStreams(videosResponse, twitchResponse);
        renderStreams(data.HappeningStreams, data.ScheduledStreams, data.TwitchStreams);
        makeDraggable(youtube);
        makeDraggable(agenda);
        makeDraggable(twitch);
        
    } catch (err) {
        console.error("Erro ao carregar streams:", err);
    }
}

async function initWeather() {

    const saved = await chrome.storage.local.get([
        "weatherMode",
        "lat",
        "lon",
        "name"
    ]);

    if (saved.weatherMode === "manual" && saved.lat && saved.lon) {
        fetchWeatherFromCoords(saved.lat, saved.lon, saved.name);
    } else {
        fetchWeather();
    }
}

async function fetchWeather() 
{
    navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        fetchWeatherFromCoords(lat, lon);
    });
}

async function fetchWeatherFromCoords(lat, lon, manualName = null) {

    const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`);

    const weatherData = await weatherResponse.json();

    let geoData = null;

    if (!manualName) { // Só busca bairro/cidade automaticamente se NÃO tiver posto um nome manualmente
        const geoResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`);
        geoData = await geoResponse.json();
    }

    const cityName = geoData.address.city || geoData.address.town || geoData.address.village || geoData.address.municipality || geoData.address.county || "Unknown";

    renderWeather(weatherData, geoData, cityName);
}

weatherMenu.addEventListener("click", (e) => {
    e.stopPropagation();
    weatherInfo.classList.toggle("settings-open");
});

document.getElementById("changeCity").addEventListener("click", async () => {
    const newCity = document.getElementById("weatherLocationInput").value;

    const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(newCity)}`);
    const data = await response.json();
    const result = data.results?.[0];

    if (!result) return;

    const lat = result.latitude;
    const lon = result.longitude;
    const name = result.name;

    // salva estado manual
    chrome.storage.local.set({
        weatherMode: "manual",
        lat,
        lon,
        name
    });

    fetchWeatherFromCoords(lat, lon, name);
});

document.getElementById("weatherCloseSettings").addEventListener("click", () => {
        weatherInfo.classList.remove("settings-open");
});

input.addEventListener("input", () => {

    clearTimeout(debounceTimeout);

    debounceTimeout = setTimeout(async () => {

        const query = input.value.trim();

        if (!query) {
            dropdown.innerHTML = "";
            return;
        }

        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5`);
        const data = await res.json();

        renderDropdown(data.results || []);
    }, 300);
});

document.getElementById("weatherAuto").addEventListener("click", () => {
    document.getElementById("weatherLocationInput").value = "";
    weatherInfo.classList.remove("settings-open");

    chrome.storage.local.set({
        weatherMode: "auto",
        lat: null,
        lon: null,
        name: null
    });

    fetchWeather();
});
 
document.getElementById('url-btn').addEventListener('click', async () => {
    const url = document.getElementById('url-input').value.trim();
    if (!url) return;
 
    await saveWallpaper({ type: 'url', data: url });
    document.getElementById('url-input').value = '';
});
 
document.getElementById('file-input').addEventListener('change', (e) => {
    pendingFile = e.target.files[0];
 
    if (pendingFile) {
        document.getElementById('file-name').textContent = pendingFile.name;
        document.getElementById('file-set-btn').disabled = false;
    }
});

document.getElementById('wallpaper-popup').addEventListener('click', (e) => { // fecha se clicar fora do card
    if (e.target === e.currentTarget) {
        e.currentTarget.classList.add('hidden');
    }
});

document.getElementById('file-set-btn').addEventListener('click', () => {
    if (!pendingFile) return;
 
    compressImage(pendingFile, async (base64) => {
        await saveWallpaper({ type: 'base64', data: base64 });
 
        pendingFile = null; // Reseta o file input
        document.getElementById('file-input').value = '';
        document.getElementById('file-name').textContent = 'No file selected';
        document.getElementById('file-set-btn').disabled = true;
    });
});

document.getElementById('wallpaper-btn').addEventListener('click', () => {
    document.getElementById('wallpaper-popup').classList.remove('hidden');
});

document.getElementById('wallpaper-close').addEventListener('click', () => {
    document.getElementById('wallpaper-popup').classList.add('hidden');
});

document.addEventListener('DOMContentLoaded', async () => {

    loadStreams();
    initWeather();

    const wallpaperCache = await chrome.storage.local.get('wallpapers');
    wallpaperSlots = wallpaperCache.wallpapers || [];
 
    if (wallpaperSlots.length === 0) {
        wallpaperSlots = [{ type: 'url', data: '/logo/DefaultBackground.png' }];
        await chrome.storage.local.set({ wallpapers: wallpaperSlots });
    }

    if (wallpaperSlots[0]) {
        document.documentElement.style.setProperty(
            '--wallpaper-url',
            `url(${wallpaperSlots[0].data})`
        );
    }

    chrome.storage.local.get(['layout-fixed-bar', 'layout-resizable-bar'], (result) => {
        barsSection.classList.toggle('fixed', result['layout-fixed-bar']     === true);
        barsSection.classList.toggle('resizable', result['layout-resizable-bar'] === true);
    });

    chrome.storage.onChanged.addListener((changes, area) => {
        if (area !== 'local') return;
    
        if (changes['layout-fixed-bar']) {
            barsSection.classList.toggle('fixed', changes['layout-fixed-bar'].newValue === true);
            if (changes['layout-fixed-bar'].newValue === false) {
                bars.forEach(bar => makeMovable(bar))
            }
        }

        if (changes['layout-resizable-bar']) {
            barsSection.classList.toggle('resizable', changes['layout-resizable-bar'].newValue === true);

            if (changes['layout-resizable-bar'].newValue === false) {
                document.querySelectorAll('.info-bar').forEach(bar => {
                    bar.style.width = '';
                    bar.style.height = '';
                });
            }
        }
    });

    renderWallpaperSlots();
    bindSlotClicks();
});