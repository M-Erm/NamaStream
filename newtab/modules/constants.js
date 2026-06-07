export const DEFAULT_SETTINGS = {
    "layout-firefox-logo": true,
    "layout-firefox-wordmark": true,
    "layout-search-bar": true,

    "youtube-streams": true,
    "agenda": true,
    "twitch-streams": true,

    "layout-vertical-twitch": false,
    "layout-resizable-bar": false,
    "repositionMode": false,

    "barPositions": {},
    "barSizes": {}
};

export const weatherMap = {
  0: "☀️ Céu limpo",
  1: "🌤️ Parcialmente limpo",
  2: "⛅ Nublado",
  3: "☁️ Muito nublado",
  61: "🌧️ Chuvendo",
  95: "⛈️ Tempestade"
};

export const translations = {
    "en": {
        "watching_now": "Watching Now",
        "hours": " hours",
        "hour": " hour",
        "in_1_minute": "in 1 minute",
        "minutes": " minutes",
        "in": "in ",
        "starts": "Starts",
        "feeling": "Feeling",
        "humidity": "Humidity",
        "wind_speed": "Wind Speed"
    },
    "pt-BR": {
        "watching_now": "Assistindo agora",
        "in": "em ",
        "starts": "Começa",
        "hours": " horas",
        "hour": " hora",
        "in_1_minute": "em 1 minuto",
        "minutes": " minutos",
        "feeling": "Sensação",
        "humidity": "Umidade",
        "wind_speed": "Vento"
    }
};

export const userLanguage = navigator.language || "en";
export const lang = translations[userLanguage] || translations["en"];
