export async function saveBarPosition(id, x, y)
{
    const result = await chrome.storage.local.get("barPositions");
    const barPositions = result.barPositions || {};
    barPositions[id] = { x, y };

    await chrome.storage.local.set({ barPositions });
}

export async function restoreBarPositions()
{
    const result = await chrome.storage.local.get("barPositions");
    const barPositions = result.barPositions || {};

    document.querySelectorAll(".info-bar").forEach(el => {
        const pos = barPositions[el.id];
        if (!pos) return;

        el.dataset.posX = pos.x;
        el.dataset.posY = pos.y;

        el.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
    });
}

export function saveRestoreBarSizes()
{
    const sizes = JSON.parse(localStorage.getItem("info-bar-sizes") || "{}");

    document.querySelectorAll(".info-bar").forEach((bar, index) => {
        if (sizes[index]) {
            bar.style.width = sizes[index].width;
            bar.style.height = sizes[index].height;
        }

        const observer = new ResizeObserver(() => {
            const currentSizes = JSON.parse(localStorage.getItem("info-bar-sizes") || "{}");

            currentSizes[index] = {
                width: bar.style.width || `${bar.offsetWidth}px`,
                height: bar.style.height || `${bar.offsetHeight}px`
            };

            localStorage.setItem("info-bar-sizes", JSON.stringify(currentSizes));
        });

        observer.observe(bar);
    });
}
