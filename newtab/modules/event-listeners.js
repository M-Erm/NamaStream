import { getCachedSettings, initCachedSettings } from "./settings.js";
import { fetchWeather, fetchWeatherFromCoords, renderDropdown } from "./weather.js";
import { compressImage, saveWallpaper, searchWallpapers } from "./wallpapers.js";
import { weatherInfo, weatherMenu, input, dropdown, barsSection } from "./dom-refs.js";

const wallpaperPopup = document.getElementById("wallpaper-popup");
const changeCity = document.getElementById("changeCity");
const weatherLocationInput = document.getElementById("weatherLocationInput");

let debounceTimeout;
let currentPendingFile = null;

export function addEventListeners()
{
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area !== "local") return;

        getCachedSettings().then(initCachedSettings);

        if (changes.repositionMode) {
            document.body.classList.toggle("reposition-mode", changes.repositionMode.newValue );
        }

        if (changes["layout-resizable-bar"]) {
            barsSection.classList.toggle("resizable", changes["layout-resizable-bar"].newValue === true);

            if (changes["layout-resizable-bar"].newValue === false) {
                document.querySelectorAll(".info-bar").forEach(bar => {
                    bar.style.width = "";
                    bar.style.height = "";
                });
            }
        }

        if (changes.barPositions && Object.keys(changes.barPositions.newValue || {}).length === 0) {
            document.querySelectorAll(".info-bar").forEach(bar => {
                bar.style = "";
                bar.dataset.posX = "0";
                bar.dataset.posY = "0";
            });
        }
    });


    weatherMenu.addEventListener("click", (e) => {
        e.stopPropagation();
        weatherInfo.classList.toggle("settings-open");
    });

    changeCity.addEventListener("click", async () => {
        const newCity = weatherLocationInput.value;

        try {
            const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(newCity)}`);
            if (!response.ok)
                throw new Error(`HTTP ${response.status}`); // working but not ok

            const data = await response.json();
            const result = data.results?.[0];

            if (!result) return;

            const lat = result.latitude;
            const lon = result.longitude;
            const name = result.name;

            chrome.storage.local.set({
                weatherMode: "manual",
                lat,
                lon,
                name
            });

            fetchWeatherFromCoords(lat, lon, name);
        } catch(err) {
            console.error("Out of air lmao", err); // not working at all
        }

    });

    document.getElementById("weatherCloseSettings").addEventListener("click", () => {
            weatherInfo.classList.remove("settings-open");
    });

    input.addEventListener("input", () => {
        clearTimeout(debounceTimeout);

        debounceTimeout = setTimeout(async () => {
            const query = input.value.trim();

            if (!query) {
                dropdown.innerHTML = "";
                return;
            }

            try {
                const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5`);

                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }
                const data = await res.json();

                renderDropdown(data.results || []);
            } catch (err) {
                console.error("Geocoding API not working", err);
            }
        }, 300);
    });

    document.getElementById("weatherAuto").addEventListener("click", () => {
        weatherLocationInput.value = "";
        weatherInfo.classList.remove("settings-open");

        chrome.storage.local.set({
            weatherMode: "auto",
            lat: null,
            lon: null,
            name: null
        });

        fetchWeather();
    });

    document.getElementById("url-btn").addEventListener("click", async () => {
        const url = document.getElementById("url-input").value.trim();
        if (!url) return;

        await saveWallpaper({ type: "url", data: url });
        document.getElementById("url-input").value = "";
    });

    wallpaperPopup.addEventListener("click", (e) => {
        if (e.target === e.currentTarget) {
            e.currentTarget.classList.add("hidden");
        }
    });

    document.getElementById("wallpaper-search-btn").addEventListener("click", async () => {
        await searchWallpapers();
        document.getElementById("wallpaper-search-modal").classList.add("hidden");
    });

    document.getElementById("file-input").addEventListener("change", (e) => {
        currentPendingFile = e.target.files[0];
        if (currentPendingFile) {
            document.getElementById("file-name").textContent = currentPendingFile.name;
            document.getElementById("file-set-btn").disabled = false;
        }
    });

    document.getElementById("file-set-btn").addEventListener("click", () => {
        if (!currentPendingFile) return;

        compressImage(currentPendingFile, async (base64) => {
            await saveWallpaper({ type: "base64", data: base64 });

            currentPendingFile = null;
            document.getElementById("file-input").value = "";
            document.getElementById("file-name").textContent = "No file selected";
            document.getElementById("file-set-btn").disabled = true;
        });
    });

    document.getElementById("wallpaper-btn").addEventListener("click", () => {
        wallpaperPopup.classList.remove("hidden");
    });

    document.getElementById("wallpaper-close").addEventListener("click", () => {
        wallpaperPopup.classList.add("hidden");
    });
}
