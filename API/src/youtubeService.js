// ==========================================
// Pega os vídeos dos canais
// O processo é dividido em 2 etapas:
// 1. Pegar os vídeos dos canais (getYoutubeContent)
// 2. Pegar as informações de cada vídeo (getVideoInfo)
// ==========================================

const channelIDs = [
  {name: "Dokibird", channelId: "UComInW10MkHJs-_vi4rHQCQ"},
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

const playlistIDs = channelIDs.map(el => {
  return {
    name: el.name,
    playlistID: "UU" + el.channelId.slice(2)
  };
});

export async function getStreams(YOUTUBE_API_KEY) 
{ 
  const playlistData = await getYoutubeContent(playlistIDs, YOUTUBE_API_KEY); 
  const streams = await getVideoInfo(playlistData, YOUTUBE_API_KEY); 
  return streams; 
}

async function getYoutubeContent(playlistIDs, YOUTUBE_API_KEY) 
{
  const responses = [];

  for (let i = 0; i < playlistIDs.length; i+= 6) { // Itera o array de 6 em 6
    const promises = [];

    const actualElements = playlistIDs.slice(i, i + 6); // Fatia os ids de 6 em 6
    
    for (const id of actualElements) {
      promises.push(fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${id.playlistID}&maxResults=3&key=${YOUTUBE_API_KEY}`)) //Para cada elemento da iteração (6 elementos), faz um fetch para cada 
    };

    const chunk = await Promise.all(promises);
    responses.push(...chunk);
  }

  const data = await Promise.all( 
    responses.map(res => res.json() 
  )); 

  return data;
}

async function getVideoInfo(data, YOUTUBE_API_KEY) {
  const videoIds = data.flatMap(el => el?.items?.map(v => v.snippet.resourceId.videoId) ?? []);

  if (videoIds.length === 0) {
    console.warn("Nenhum vídeo encontrado em algum canal");
    return [];
  }

  const requests = [];
  for (let i = 0; i < videoIds.length; i += 50) {
    const ids = videoIds.slice(i, i + 50).join(',');
    requests.push(
      fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,liveStreamingDetails&id=${ids}&key=${YOUTUBE_API_KEY}`)
        .then(res => res.json())
    );
  }

  const videosResponse = await Promise.all(requests);
  return videosResponse;
}