import { saveBarPosition } from "./bar-positioning.js";

export function makeDraggable(bar) {
    let isDragging = false;
    let hasDragged = false;
    let scrollStart = 0;
    let startPos = 0;

    bar.addEventListener("mousedown", (e) => {
        if (document.body.classList.contains("reposition-mode")) return;

        isDragging = true;
        hasDragged = false;
        e.preventDefault();
        startPos = e.pageX;
        scrollStart = bar.scrollLeft;
        bar.style.cursor = "grabbing";
        bar.style.scrollSnapType = "none";
    });

    document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;

        e.preventDefault();
        const dist = e.pageX - startPos;
        if (Math.abs(dist) > 5) hasDragged = true;
        bar.scrollLeft = scrollStart - dist;
    });

    document.addEventListener("mouseup", () => {
        if (!isDragging) return;

        isDragging = false;
        bar.style.cursor = "grab";
        bar.style.scrollSnapType = "";
    });

    bar.addEventListener("scrollend", () => snapLiveEls(bar));

    bar.addEventListener("click", (e) => {
        if (hasDragged) {
            e.stopPropagation();
            e.preventDefault();
        }
    }, true);

    bar.addEventListener("wheel", (e) => {
        e.preventDefault();
        const direction = e.deltaY > 0 ? 1 : -1;
        bar.scrollBy({ left: direction * 215, behavior: "smooth" });
    }, { passive: false });
}

export function snapLiveEls(bar) {
    const lives = bar.querySelectorAll(".live");
    const barRect = bar.getBoundingClientRect();

    let closestLeft = 0;
    let closestDistance = Infinity;

    lives.forEach(live => {

        const liveLeft = live.getBoundingClientRect().left - barRect.left + bar.scrollLeft;
        const distance = Math.abs(bar.scrollLeft - liveLeft);

        if (distance < closestDistance) {
            closestDistance = distance;
            closestLeft = liveLeft;
        }
    });

    if (closestDistance < Infinity) {
        bar.scrollTo({ left: closestLeft, behavior: "smooth" });
    }
}

export function makeMovable(el) {
    let isMoving = false;
    let startMouseX = 0;
    let startMouseY = 0;

    if (!el.dataset.posX) el.dataset.posX = "0";
    if (!el.dataset.posY) el.dataset.posY = "0";

    el.addEventListener("mousedown", (e) => {
        if (!document.body.classList.contains("reposition-mode")) return;
        if (!e.target.closest(".bar-handle")) return;

        isMoving = true;
        e.preventDefault();
        e.stopPropagation();
        el.style.cursor = "grabbing";
        startMouseX = e.clientX;
        startMouseY = e.clientY;
    });

    document.addEventListener("mousemove", (e) => {
        if (!isMoving) return;
        const x = parseFloat(el.dataset.posX) + (e.clientX - startMouseX);
        const y = parseFloat(el.dataset.posY) + (e.clientY - startMouseY);
        el.style.transform = `translate(${x}px, ${y}px)`;
    });

    document.addEventListener("mouseup", (e) => {
        if (!isMoving) return;
        isMoving = false;
        el.style.cursor = "grab";

        const elX = parseFloat(el.dataset.posX) + (e.clientX - startMouseX);
        const elY = parseFloat(el.dataset.posY) + (e.clientY - startMouseY);

        el.dataset.posX = String(elX);
        el.dataset.posY = String(elY);

        snapBarSections(el);
        saveBarPosition(el.id, elX, elY);
    });
}

export function snapBarSections(movedBar) {
    const rectMoved = movedBar.getBoundingClientRect();

    document.querySelectorAll(".info-bar").forEach(other => {
        if (other === movedBar) return;

        const vertDifference = rectMoved.top - other.getBoundingClientRect().top;

        if (Math.abs(vertDifference) < 20) {
            movedBar.dataset.posY = String(parseFloat(movedBar.dataset.posY) - vertDifference);
            movedBar.style.transform = `translate(${movedBar.dataset.posX}px, ${movedBar.dataset.posY}px)`;
        }
    });
}
