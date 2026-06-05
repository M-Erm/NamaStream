// ==========================================
// 1. Pega 3 vídeos de cada canal (getYoutubeContent)
// 2. Pega as informações de cada vídeo (getVideoInfo)
// ==========================================

const channelIDs = [
  {name: "Dokibird", channelId: "UComInW10MkHJs-_vi4rHQCQ"}, // Name: para organização pessoal
  {name: "HololiveEnglish", channelId: "UCotXwY6s8pWmuWd_snKYjhg"},
  {name: "Pekora", channelId: "UC1DCedRgGHBdm81E1llLhOQ"},
  {name: "Bae", channelId: "UCgmPnx-EEeOrZSg5Tiw7ZRQ"},
  {name: "Bijou", channelId: "UC9p_lqQ0FEDz327Vgf5JwqA"},
  {name: "Marine", channelId: "UCCzUftO8KOVkV4wQG1vkUvg"},
  {name: "Calli", channelId: "UCL_qhgtOy0dy1Agp8vkySQg"},
  {name: "Nerissa", channelId: "UC_sFNM0z0MWm9A6WlKPuMMg"},
  {name: "Kobo", channelId: "UCjLEmnpCNeisMxy134KPwWw"},
  {name: "Nimi", channelId: "UCIfAvpeIWGHb0duCkMkmm2Q"},
  {name: "Shiori", channelId: "UCgnfPPb9JI3e9A4cXHnWbyg"},
  {name: "Dooby", channelId: "UC6T7TJZbW6nO-qsc5coo8Pg"},
  {name: "Maid_mint", channelId: "UCcHHkJ98eSfa5aj0mdTwwLQ"},
  {name: "Cecilia", channelId: "UCvN5h1ShZtc7nly3pezRayg"},
  {name: "Hajime", channelId: "UC1iA6_NT4mtAcIII6ygrvCw"},
  {name: "ERB", channelId: "UCW5uhrG1eCBYditmhL0Ykjw"},
  {name: "Zeta", channelId: "UCTvHWSfBZgtxE4sILOaurIQ"},
  {name: "Okayu", channelId: "UCvaTdHTWBGv3MKj3KVqJVCw"},
  {name: "Kiara", channelId: "UCHsx4Hqa-1ORjQTh9TYDhww"},
  {name: "Kronii", channelId: "UCmbs8T6MWqUHP1tIQvSgKrg"},
  {name: "Gigi", channelId: "UCDHABijvPBnJm7F-KlNME3w"},
  {name: "Elite_Miko", channelId: "UC-hM6YJuNYVAmUWxeIr9FeA"},
  {name: "Kaela", channelId: "UCZLZ8Jjx_RN2CXloOmgTHVg"},
  {name: "iRyS", channelId: "UC8rcEBzJSleTkf_-agPM20g"},
  {name: "Ina", channelId: "UCMwGHR0BTZuLsmjY_NT5Pwg"},
  {name: "Laplus", channelId: "UCENwRMx5Yh42zWpzURebzTw"},
  {name: "Towa", channelId: "UC1uv2Oq6kNxgATlCiez59hw"},
  {name: "Suisei", channelId: "UC5CwaMl1eIgY8h02uZw7u8A"},
  {name: "Korone", channelId: "UChAnqc_AY5_I3Px5dig3X1Q"},
  {name: "Saba", channelId: "UCxsZ6NCzjU_t4YSxQLBcM5A"},
  {name: "Raora", channelId: "UCl69AEx4MdqMZH7Jtsm7Tig"},
  {name: "Fuwamoco", channelId: "UCt9H_RpQzhxzlyBxFqrdHqA"},
  {name: "Ollie", channelId: "UCYz_5n-uDuChHtLo7My1HnQ"},
  {name: "schachi", channelId: "UCuBEdI-24bquMoP_dACignQ"}
]

const playlistIDs = channelIDs.map( ({ channelId }) => `UU${ channelId.slice(2) }`);

export async function getStreams(YOUTUBE_API_KEY) 
{ 
  const playlistData = await getYoutubeContent(playlistIDs, YOUTUBE_API_KEY); 
  const streams = await getVideoInfo(playlistData, YOUTUBE_API_KEY); 
  return streams; 
}

async function getYoutubeContent(playlistIDs, YOUTUBE_API_KEY) {
  const playlists = [];

  for (let i = 0; i < playlistIDs.length; i += 6) {
    const batch = playlistIDs.slice(i, i + 6);

    const chunk = await Promise.all(
      batch.map(async (playlistId) => {

        const url = `https://www.googleapis.com/youtube/v3/playlistItems` + `?part=snippet` +
        `&fields=items(snippet(resourceId/videoId))` +
        `&playlistId=${playlistId}&maxResults=3&key=${YOUTUBE_API_KEY}`;

        try {
          const res = await fetch(url);

          if (!res.ok) {
            console.error("YT API error:", playlistId, res.status);
            return null;
          }

          return res.json();
        } catch (e) {
          console.error("Fetch error:", playlistId, e.message);
          return null;
        }
      })
    );

    for (const playlist of chunk) {
      if (playlist) 
        playlists.push(playlist);
    }
  }

  return playlists;
}

async function getVideoInfo(data, YOUTUBE_API_KEY) {
  const requests = [];
  const videoIds = [];
  const cleanResponse = [];

  for (const playlist of data) {
    const items = playlist?.items;
    if (!items) continue;

    for (const video of items) {
      const id = video?.snippet?.resourceId?.videoId;
      if (id) videoIds.push(id);
    }
  }

  if (videoIds.length === 0) console.warn("Nenhum vídeo encontrado em algum canal");

  for (let i = 0; i < videoIds.length; i += 50) {
    const ids = videoIds.slice(i, i + 50).join(',');

    const url = `https://www.googleapis.com/youtube/v3/videos?` + 
    `part=snippet,liveStreamingDetails` + 
    `&fields=items(id,snippet(title,channelId,channelTitle,thumbnails/maxres/url,thumbnails/high/url),liveStreamingDetails)` + 
    `&id=${ids}&key=${YOUTUBE_API_KEY}`;
    
    requests.push(
      fetch(url)
        .then( (res) => {
          if (!res.ok) {
            console.error({status: res.status});
            return null;
          }
          return res.json();
          })
        .catch(err => {
          console.error(err);
          return null;
        })
    );
  }
  const videosResponse = (await Promise.all(requests)).filter(Boolean);

  for (const response of videosResponse) {
    const items = response?.items;
    if (!items) continue;

    for (const video of items) {
      cleanResponse.push({
        id: video.id,
        title: video.snippet.title,
        channelId: video.snippet.channelId,
        channel: video.snippet.channelTitle,
        thumbnailMax: video.snippet.thumbnails.maxres?.url ?? null,
        thumbnailHigh: video.snippet.thumbnails.high?.url ?? null,
        concurrentViewers: video.liveStreamingDetails?.concurrentViewers ?? null,
        actualStartTime: video.liveStreamingDetails?.actualStartTime ?? null,
        actualEndTime: video.liveStreamingDetails?.actualEndTime ?? null,
        scheduledStartTime: video.liveStreamingDetails?.scheduledStartTime ?? null,
      });
    }
  }

  return cleanResponse;
}