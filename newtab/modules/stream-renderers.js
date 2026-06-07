import { youtube, agenda, twitch } from "./dom-refs.js";
import { lang } from "./constants.js";

export function renderStreams(HappeningStreams, ScheduledStreams, TwitchStreams)
{
    let youtubeHTML = "";
    let agendaHTML = "";
    let twitchHTML = "";

    HappeningStreams.forEach(stream => {
        try {
            youtubeHTML += `
                <div class="live">
                    <a href="https://www.youtube.com/watch?v=${stream.id}" target="_blank" class="live-thumb">
                        <img src="${stream.thumbnailMax ?? stream.thumbnailHigh} " alt="Channel Pfp">
                    </a>
                    <div class="live-info">
                        <div>
                            <a target="_blank" class="streamtitle" href="https://www.youtube.com/watch?v=${stream.id}">${stream.title}</a>
                        </div>

                        <a target="_blank" class="channelname" href="https://www.youtube.com/channel/${stream.channelId}"> ${stream.channel} </a>
                        <div style="color: white">${stream.concurrentViewers} ${lang.watching_now} </div>
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

            const localStreamHour = new Date(stream.scheduledStartTime);
            const localStreamDate = localStreamHour.toLocaleDateString("pt-BR");

            const localStreamTimeLeftMS = localStreamHour - localCurrentTime;

            const localStreamTimeLeft = localStreamTimeLeftMS / (60 * 60 * 1000);
            const localStreamHoursLeft = Math.floor(localStreamTimeLeft)

            if (localStreamHoursLeft >= 24) {
                displayText = localStreamDate;
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

            const localStreamStartTime = new Date(stream.scheduledStartTime).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

            agendaHTML += `
                <div class="live">
                    <a href="https://www.youtube.com/watch?v=${stream.id}" target="_blank" class="live-thumb">
                        <img src="${stream.thumbnailMax ?? stream.thumbnailHigh}" alt="Channel Pfp">
                    </a>
                    <div class="live-info">
                        <div>
                            <a target="_blank" class="streamtitle" href="https://www.youtube.com/watch?v=${stream.id}">${stream.title}</a>
                        </div>

                        <a target="_blank" class="channelname" href="https://www.youtube.com/channel/${stream.channelId}"> ${stream.channel} </a>
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
                <a href="https://www.twitch.tv/${stream.name}" target="_blank" class="live-thumb">
                    <img src="${stream.thumbnail.replace("{width}", "320").replace("{height}", "180")}" alt="Channel Pfp">
                </a>
                <div class="live-info">
                    <div>
                        <a target="_blank" class="streamtitle" href="https://www.twitch.tv/${stream.name}">${stream.title}</a>
                </div>

                    <a target="_blank" class="channelname" href="https://www.twitch.tv/${stream.name}"> ${stream.name} </a>
                    <div style="color: white">${stream.viewers} ${lang.watching_now} </div>
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
