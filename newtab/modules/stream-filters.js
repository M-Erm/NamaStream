export async function filterStreams(youtubeData, twitchStreams)
{
    const ScheduledStreams = [];
    const HappeningStreams = [];
    const TwitchStreams = [];

    const { disabledChannels = [], pinnedChannels = [] } = await chrome.storage.local.get(["disabledChannels", "pinnedChannels"]);

    for (const video of youtubeData) {
        if (disabledChannels.includes(video.channelId)) continue;

        if (video.actualStartTime && !video.actualEndTime) {
            HappeningStreams.push(video);
        } else if (video.scheduledStartTime && !video.actualStartTime) {
            ScheduledStreams.push(video);
        }
    }

    for (const stream of twitchStreams) {
        if (disabledChannels.includes(stream.login)) continue;
        TwitchStreams.push(stream);
    }

    ScheduledStreams.sort((a, b) => { // se 2 ou nenhum estiverem pinnados, ordena pela data de início
        if (pinnedChannels.indexOf(a.channelId) !== -1 && pinnedChannels.indexOf(b.channelId) === -1) {
            return new Date(a.scheduledStartTime) - new Date(b.scheduledStartTime) - 1000000000;
        } else if (pinnedChannels.indexOf(b.channelId) !== -1 && pinnedChannels.indexOf(a.channelId) === -1) {
            return new Date(a.scheduledStartTime) - new Date(b.scheduledStartTime) + 1000000000;
        }

        return new Date(a.scheduledStartTime) - new Date(b.scheduledStartTime);
    });

    HappeningStreams.sort((a, b) => {
        if (pinnedChannels.indexOf(a.channelId) !== -1 && pinnedChannels.indexOf(b.channelId) === -1) {
            return new Date(a.scheduledStartTime) - new Date(b.scheduledStartTime) - 1000000000;
        } else if (pinnedChannels.indexOf(b.channelId) !== -1 && pinnedChannels.indexOf(a.channelId) === -1) {
            return new Date(a.scheduledStartTime) - new Date(b.scheduledStartTime) + 1000000000;
        }
        return new Date(a.scheduledStartTime) - new Date(b.scheduledStartTime);
    });

    TwitchStreams.sort((a, b) => {
        const aPinned = pinnedChannels.indexOf(a.name);
        const bPinned = pinnedChannels.indexOf(b.name);

        if (aPinned === -1 && bPinned === -1) return 0;
        if (aPinned !== -1 && bPinned === -1) return -1;
        if (bPinned !== -1 && aPinned === -1) return 1;
        return 0;
    });

    return {ScheduledStreams, HappeningStreams, TwitchStreams};
}
