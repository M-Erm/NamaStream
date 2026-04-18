//
// Handler do server. Hono é o framework para facilitar fazer o server >D
//

import { Hono } from 'hono';
import { returnYoutubeData } from './cache.js';
import { returnTwitchData } from './cache.js';
import { refreshCache } from './cache.js';
import { filterStreams } from './old.js';

interface Env {
  YOUTUBE_API_KEY: string;
  Client_Id: string;
  Client_Secret: string;
}

import type {
  ScheduledController,
  ExecutionContext
} from "@cloudflare/workers-types";

const server = new Hono<{ Bindings: Env }>();

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // faz com que permita qualquer origem
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Access-Control-Allow-Headers': '*',
};

server.get('/streams', async (context) => {
  try {
    const videosResponse = await returnYoutubeData(context.env);
    const data = filterStreams(videosResponse);
    return context.json(data, { headers: corsHeaders });

  } catch (err: any) {
    return context.json(
      {
        error: 'Internal Server Error',
        message: err?.message ?? 'Unknown error',
      },
      { status: 500, headers: corsHeaders }
    );
  }
});

server.get('/v2/youtube', async (context) => {
  try {
    const data = await returnYoutubeData(context.env);

    return context.json(data ?? [], { headers: corsHeaders });
  } catch (err: any) {
    return context.json(
      {
        error: 'Internal Server Error',
        message: err?.message ?? 'Unknown error',
      },
      { status: 500, headers: corsHeaders }
    );
  }
});

server.get('/v2/twitch', async (context) => {
  try {
    const data = await returnTwitchData(context.env);

    return context.json(data ?? [], { headers: corsHeaders });
  } catch (err: any) {
    return context.json(
      {
        error: 'Internal Server Error',
        message: err?.message ?? 'Unknown error',
      },
      { status: 500, headers: corsHeaders }
    );
  }
});

// requisição options (faz automático antes/junto de um fetch) AKA preflight request
server.options('/streams', (context) => {
  return context.text('ok', { headers: corsHeaders });
});

server.options('/v2/youtube', (context) => {
  return context.text('ok', { headers: corsHeaders });
});

server.options('/v2/twitch', (context) => {
  return context.text('ok', { headers: corsHeaders });
});

export default {
  fetch: server.fetch,
  
  scheduled: async (
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext
  ) => {
    console.log("Cron Disparou!");
    ctx.waitUntil(
      refreshCache(env.YOUTUBE_API_KEY, env.Client_Id, env.Client_Secret, env)
      .then(() => console.log("Cache atualizado"))
      .catch(err => console.error("Erro no cron:", err))
    );
  }
}