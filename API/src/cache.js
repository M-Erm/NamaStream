//
// Retorna Cache e guarda cache usando KV Storage
//

import { getYoutubeStreams } from './youtubeService.js';
import { getTwitchStreams } from './twitchService.js';

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
    const youtubedata = await getYoutubeStreams(YOUTUBE_API_KEY);
    const twitchdata = await getTwitchStreams(Client_Id, Client_Secret);

    await cacheData(youtubedata, twitchdata, env);
}

async function cacheData(youtubedata, twitchdata, env) 
{
    await Promise.all([
        env.STREAMS_KV.put("youtube:v2", JSON.stringify(youtubedata)),
        env.STREAMS_KV.put("twitch:v2", JSON.stringify(twitchdata))
    ]);
}