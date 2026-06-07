import { translations, lang } from "./translations.js";

export const repositionBtn = document.getElementById("reposition-mode-btn");

export function initLayoutOptions() {
    const layoutCheckboxes = document.querySelectorAll("#view-layout .check-row input");

    layoutCheckboxes.forEach(checkbox => {
        checkbox.addEventListener("change", () => {
            chrome.storage.local.set({ [checkbox.id]: checkbox.checked });
        });
    });

    repositionBtn.addEventListener("click", () => {
        chrome.storage.local.get("repositionMode", (result) => {
            const next = !result.repositionMode;
            chrome.storage.local.set({ repositionMode: next });
            repositionBtn.classList.toggle("active", next);
            repositionBtn.textContent = next ? translations[lang]["done_repositioning"] : translations[lang]["reposition_bars"];
        });
    });

    document.getElementById("reset-bar-positions").addEventListener("click", () => {
        chrome.storage.local.set({ barPositions: {} });
    });
}
