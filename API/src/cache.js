//
// Retorna Cache e guarda cache usando KV Storage
//
import { getStreams as getYoutubeStreamsOld } from './old.js';
import { getTwitchStreams as getTwitchStreamsOld } from './old.js';
import { getYoutubeStreams as getYoutubeStreamsNew } from './youtubeService.js';
import { getTwitchStreams as getTwitchStreamsNew } from './twitchService.js';

export async function returnOLDYoutubeData(env) 
{
    const cache = await env.STREAMS_KV.get("youtube");

    return cache ? JSON.parse(cache) : [];
}

export async function returnOLDTwitchData(env) 
{
    const cache = await env.STREAMS_KV.get("twitch");

    return cache ? JSON.parse(cache) : [];
}

export async function returnYoutubeData(env) 
{
    const cache = await env.STREAMS_KV.get("youtube:v2");

    return cache ? JSON.parse(cache) : [];
}

export async function returnTwitchData(env) 
{
    const cache = await env.STREAMS_KV.get("twitch:v2");

    return cache ? JSON.parse(cache) : [];
}

export async function refreshCache(YOUTUBE_API_KEY, Client_Id, Client_Secret, env) 
{
    const youtubeOLDdata = await getYoutubeStreamsOld(YOUTUBE_API_KEY);
    const twitchOLDdata = await getTwitchStreamsOld(Client_Id, Client_Secret);

    const youtubedata = await getYoutubeStreamsNew(YOUTUBE_API_KEY);
    const twitchdata = await getTwitchStreamsNew(Client_Id, Client_Secret);

    await cacheData(youtubeOLDdata, twitchOLDdata, youtubedata, twitchdata, env);
}

async function cacheData(youtubeOLDdata, twitchOLDdata, youtubedata, twitchdata, env) 
{
    await Promise.all([
        env.STREAMS_KV.put("youtube", JSON.stringify(youtubeOLDdata)),
        env.STREAMS_KV.put("twitch", JSON.stringify(twitchOLDdata)),
        env.STREAMS_KV.put("youtube:v2", JSON.stringify(youtubedata)),
        env.STREAMS_KV.put("twitch:v2", JSON.stringify(twitchdata))
    ]);
}