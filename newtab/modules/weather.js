import { weatherInfo, weatherMenu, input, dropdown } from './dom-refs.js';
import { lang, weatherMap } from './constants.js';

let debounceTimeout;

export async function initWeather()
{
    const saved = await chrome.storage.local.get([
        "weatherMode",
        "lat",
        "lon",
        "name"
    ]);

    if (saved.weatherMode === "manual" && saved.lat && saved.lon) {
        fetchWeatherFromCoords(saved.lat, saved.lon, saved.name);
    } else {
        fetchWeather();
    }
}

export async function fetchWeather()
{
    navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        fetchWeatherFromCoords(lat, lon);
    });
}

export async function fetchWeatherFromCoords(lat, lon, manualName = null)
{

    const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`);

    const weatherData = await weatherResponse.json();

    let geoData = null;

    if (!manualName) {
        const geoResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`);
        geoData = await geoResponse.json();
    }

    if (manualName) {
        renderWeather(weatherData, null, manualName);
    } else {
        const cityName = geoData?.address?.city || geoData?.address?.town || "Unknown";
        renderWeather(weatherData, geoData, cityName);
    }
}

export function renderWeather(weatherData, geoData, manualName = null)
{
    const current = weatherData.current;

    const place = manualName || (geoData?.address?.city || geoData?.address?.town || geoData?.address?.village || geoData?.address?.municipality || geoData?.address?.county || "Local desconhecido") + (geoData?.address?.state ? `, ${geoData.address.state}` : "");

    document.getElementById("weatherTemp").textContent =`${Math.round(current.temperature_2m)}°`;
    document.getElementById("weatherLocation").textContent = place;
    document.getElementById("weatherFeels").textContent = `${lang.feeling}: ${Math.round(current.apparent_temperature)}°`;
    document.getElementById("weatherHumidity").textContent = `${lang.humidity}: ${current.relative_humidity_2m}%`;
    document.getElementById("weatherWind").textContent = `${lang.wind_speed}: ${Math.round(current.wind_speed_10m)} km/h`;
    setWeatherIcon(current.weather_code);
}

export function renderDropdown(results)
{
    dropdown.innerHTML = "";

    results.forEach((place) => {

        const div = document.createElement("div");
        div.className = "weather-option";

        const label =
            `${place.name}` +
            (place.admin1 ? `, ${place.admin1}` : "") +
            (place.country ? `, ${place.country}` : "");

        div.textContent = label;

        div.addEventListener("click", () => {
            dropdown.innerHTML = "";
            document.getElementById("weatherLocationInput").value = label;

            chrome.storage.local.set({
                weatherMode: "manual",
                lat: place.latitude,
                lon: place.longitude,
                name: place.name
            });

            fetchWeatherFromCoords(place.latitude, place.longitude, place.name);

            weatherInfo.classList.remove("settings-open");
        });

        dropdown.appendChild(div);
    });
}

export function setWeatherIcon(code)
{
    const weatherIcon = document.getElementById("weatherIcon");
    let icon = "night-clear";

    if (code === 0) {
        icon = "sunny";
    }
    else if ([1, 2].includes(code)) {
        icon = "partly-cloudy";
    }
    else if (code === 3) {
        icon = "cloudy";
    }
    else if (code >= 51 && code <= 67) {
        icon = "rain";
    }
    else if (code >= 80) {
        icon = "thunderstorm";
    }

    weatherIcon.style.content =
        `url("chrome://browser/skin/weather/${icon}.svg")`;
}

export { debounceTimeout };
export function setDebounceTimeout(value) {
    debounceTimeout = value;
}
