// ===========================================
// Pega informações do Cloudflare workers (Backend) e renderiza na Nova Aba.  
// ===========================================

const youtube = document.getElementById('youtube').querySelector('.scroll-container'); //Precisa do queryselector para pegar a div interna
const agenda = document.getElementById('agenda').querySelector('.scroll-container');
const twitch = document.getElementById('twitch').querySelector('.scroll-container');

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

let slots = [];
let pendingFile = null;

function drag(scrollContainer) 
{
    let isDragging = false;
    let hasDragged = false;
    let scrollStart = 0;
    let startPos = 0;

    scrollContainer.addEventListener('mousedown', (click) => {
        isDragging = true;
        hasDragged = false;
        click.preventDefault();

        startPos = click.pageX;
        scrollStart = scrollContainer.scrollLeft;
        scrollContainer.style.cursor = 'grabbing';
        scrollContainer.style.scrollSnapType = 'none';
    });

    document.addEventListener('mousemove', (click) => {
        if (!isDragging) return;
        click.preventDefault();

        const dragDistance  = click.pageX - startPos;
        if (Math.abs(dragDistance) > 5) hasDragged = true;
        scrollContainer.scrollLeft = scrollStart - dragDistance;
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        scrollContainer.style.cursor = 'grab';
        scrollContainer.style.scrollSnapType = '';
    });

    scrollContainer.addEventListener('click', (click) => {
        if (hasDragged) {
            click.stopPropagation();
            click.preventDefault();
        }
    }, true); 

    scrollContainer.addEventListener('wheel', (click) => {
        click.preventDefault();
        
        const itemWidth = 215;
        const direction = click.deltaY > 0 ? 1 : -1;
        
        scrollContainer.scrollBy({ left: direction * itemWidth, behavior: 'smooth' });
    }, { passive: false });

}

function FilterStreams(videosResponse, twitchResponse)
{
    const ScheduledStreams = [];
    const HappeningStreams = [];
    const TwitchStreams = [];
    let disabledChannels = new Set();
    let pinnedChannels = [];

  // Pega os canais desativados e fixados do storage
    chrome.storage.local.get(['disabledChannels', 'pinnedChannels'], (result) => {
        disabledChannels = new Set(result.disabledChannels || []);
        pinnedChannels = result.pinnedChannels || [];
    });

    console.log("desabilitados:" + disabledChannels);
    console.log("fixados:" + pinnedChannels);

    for (const response of videosResponse) {
        for (const video of response.items) {
            if (!video.liveStreamingDetails) {
                // Not a stream
                continue;
            }
            if (video.liveStreamingDetails.actualStartTime && !video.liveStreamingDetails.actualEndTime) {
                // Live NOW
                HappeningStreams.push(video);
            } else if (video.liveStreamingDetails.scheduledStartTime && !video.liveStreamingDetails.actualStartTime) {
                // Upcoming Live
                ScheduledStreams.push(video);
            }
            // else = Past Live
        }
    } 

    for (const response of twitchResponse.data) {
        TwitchStreams.push(response);
    }

    return {ScheduledStreams, HappeningStreams, TwitchStreams};
}

function renderUIs(HappeningStreams, ScheduledStreams, TwitchStreams)
{
    let youtubeHTML = '';
    let agendaHTML = '';
    let twitchHTML = '';

    ScheduledStreams.sort((a, b) => {
        return new Date(a.liveStreamingDetails.scheduledStartTime) - 
            new Date(b.liveStreamingDetails.scheduledStartTime);
    });

    HappeningStreams.forEach(stream => {
        try {
            youtubeHTML += `
                <div class="live"> 
                    <a href="https://www.youtube.com/watch?v=${stream.id}" target="_blank" class="live-thumb">
                        <img src="${stream.snippet.thumbnails.maxres?.url || stream.snippet.thumbnails.high.url} " alt="Channel Pfp"> 
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
                        <img src="${stream.snippet.thumbnails.maxres.url ?? stream.snippet.thumbnails.default}" alt="Channel Pfp"> 
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

async function loadStreams() 
{
    try {
        console.time('Tempo de Resposta');
        const response = await fetch("https://holo-streams.migueloliv-dev.workers.dev/v2/youtube");
        const twitchRes = await fetch("https://holo-streams.migueloliv-dev.workers.dev/v2/twitch");
        console.timeEnd('Tempo de Resposta');

        const videosResponse = await response.json();
        const twitchResponse = await twitchRes.json();
        const data = FilterStreams(videosResponse, twitchResponse);
        renderUIs(data.HappeningStreams, data.ScheduledStreams, data.TwitchStreams);
        drag(youtube);
        drag(agenda);
    } catch (err) {
        console.error("Erro ao carregar streams:", err);
    }
}

loadStreams();


document.addEventListener('DOMContentLoaded', async () => {
    const result = await chrome.storage.local.get('wallpapers'); // Pega os wallpapers na cache
    slots = result.wallpapers || []; // Se não tiver, inicia vazio
 
    if (slots.length === 0) {
        slots = [{ type: 'url', data: '/logo/DefaultBackground.png' }]; // wallpaper padrão
        await chrome.storage.local.set({ wallpapers: slots });
    }
 
    renderSlots();
    bindSlotClicks();

    if (slots[0]) {
        document.documentElement.style.setProperty(
            '--wallpaper-url',
            `url(${slots[0].data})`
        );
    }
});
 
function renderSlots() {
    const slotEls = document.querySelectorAll('.slot');
 
    slotEls.forEach((el, index) => {
        const slot = slots[index];
 
        if (slot) { // Se tiver index(wallpaper), renderiza. Se não, deixa vazio
            el.style.backgroundImage = `url(${slot.data})`;
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
            if (!slots[index]) return; // if slot vazio
 
            const chosen = slots.splice(index, 1)[0]; // remove de onde estava
            slots.unshift(chosen); // coloca na frente
 
            await chrome.storage.local.set({ wallpapers: slots }); // Salva a nova ORDEM na cache
 
            document.querySelectorAll('.slot').forEach(s => s.classList.remove('active')); // Atualiza qual slot tem a borda ativa
            document.querySelector('.slot[data-index="0"]').classList.add('active');
 
            renderSlots();
            document.documentElement.style.setProperty('--wallpaper-url', `url(${slots[0].data})`);
        });
    });
}
 
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
 
function compressImage(file, callback) { 
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

async function saveWallpaper(wallpaper) {
    slots = [wallpaper, ...slots].slice(0, 3); // Slice faz com que só tenha 3 wallpapers, removendo o mais antigo se passar disso
    await chrome.storage.local.set({ wallpapers: slots }); // Salva o WALLPAPER na cache
    renderSlots();

    document.documentElement.style.setProperty('--wallpaper-url', `url(${wallpaper.data})`);
}

document.getElementById('wallpaper-btn').addEventListener('click', () => {
    document.getElementById('wallpaper-popup').classList.remove('hidden');
});

document.getElementById('popup-close').addEventListener('click', () => {
    document.getElementById('wallpaper-popup').classList.add('hidden');
});