export async function filterStreams(youtubeData, twitchStreams)
{
    const ScheduledStreams = [];
    const HappeningStreams = [];
    const TwitchStreams = [];

    const { disabledChannels = [], pinnedChannels = [] } = await chrome.storage.local.get(['disabledChannels', 'pinnedChannels']);

    for (const video of youtubeData) {
        if (disabledChannels.includes(video.channelId)) {
            continue;
        }

        if (video.actualStartTime && !video.actualEndTime) {
            HappeningStreams.push(video);
        } else if (video.scheduledStartTime && !video.actualStartTime) {
            ScheduledStreams.push(video);
        }
    }

    ScheduledStreams.sort((a, b) => {
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

    for (const stream of twitchStreams) {
        TwitchStreams.push(stream);
    }

    return {ScheduledStreams, HappeningStreams, TwitchStreams};
}
