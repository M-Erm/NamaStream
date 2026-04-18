//
// Retorna Cache e guarda cache usando KV Storage
//

import { getStreams } from './youtubeService.js';
import { getTwitchStreams } from './twitchService.js';

export async function returnYoutubeData(env) 
{
    const cache = await env.STREAMS_KV.get("youtube"); // Tenta recuperar do KV

    return JSON.parse(cache);
}

export async function returnTwitchData(env) 
{
    const cache = await env.STREAMS_KV.get("twitch"); // Tenta recuperar do KV

    return JSON.parse(cache);
}

export async function refreshCache(YOUTUBE_API_KEY, Client_Id, Client_Secret, env) 
{
    const youtubedata = await getStreams(YOUTUBE_API_KEY);
    const twitchdata = await getTwitchStreams(Client_Id, Client_Secret);
    await cacheData(youtubedata, twitchdata, env);
}

async function cacheData(youtubedata, twitchdata, env) 
{
    await Promise.all([
        env.STREAMS_KV.put("youtube", JSON.stringify(youtubedata)),
        env.STREAMS_KV.put("twitch", JSON.stringify(twitchdata))
    ]);
}