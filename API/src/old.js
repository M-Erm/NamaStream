export function filterStreams(videosResponse)
{
    const ScheduledStreams = [];
    const HappeningStreams = [];


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

    return {ScheduledStreams, HappeningStreams};
}