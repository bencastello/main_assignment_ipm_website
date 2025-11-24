console.log("coverflow.js (JSON mode, random 5) loaded.");

const BOOKS_URL = "../data/books.json";

async function loadBooks() {
    try {
        const res = await fetch(BOOKS_URL);
        const data = await res.json();
        return data.books || [];
    } catch (e) {
        console.error("Failed loading books.json", e);
        return [];
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const books = await loadBooks();
    if (!books.length) {
        console.warn("No books found in books.json");
        return;
    }

    const randomBooks = books.sort(() => Math.random() - 0.5).slice(0, 5);
    const track = document.querySelector(".cf-track");
    track.innerHTML = "";

    randomBooks.forEach((b, i) => {
        const item = document.createElement("div");
        item.classList.add("cf-item");
        item.innerHTML = `
            <div class="cf-cover" style="background-image:url('../${b.cover}')"></div>
            <div class="cf-title">${b.title}</div>
            <div class="cf-meta">${b.author}</div>
        `;
        item.addEventListener("click", () => {
            if (i === current) {
                window.location.href = `../my_books/book_detail.html?id=${b.id}`;
            } else {
                go(i);
            }
        });
        track.appendChild(item);
    });

    const items = Array.from(document.querySelectorAll(".cf-item"));
    const left = document.querySelector(".cf-arrow-left");
    const right = document.querySelector(".cf-arrow-right");
    let current = 0;

    function update() {
        items.forEach((item, i) => {
            const offset = i - current;
            const abs = Math.abs(offset);
            const baseX = 260;
            const x = offset * baseX;
            const scale = i === current ? 1.7 : 1 - abs * 0.15;
            const z = i === current ? 350 : 200 - abs * 120;
            const rot = offset * -35;
            const opacity = Math.max(0, 1 - abs * 0.3);
            item.style.opacity = opacity;
            item.style.transform = `
                translate(-50%, -50%)
                translateX(${x}px)
                translateZ(${z}px)
                rotateY(${rot}deg)
                scale(${scale})
            `;
            if (i === current) item.classList.add("is-active");
            else item.classList.remove("is-active");
        });
    }

    function go(n) {
        current = Math.max(0, Math.min(n, items.length - 1));
        update();
    }

    left.addEventListener("click", () => go(current - 1));
    right.addEventListener("click", () => go(current + 1));

    document.addEventListener("keydown", e => {
        if (e.key === "ArrowLeft") go(current - 1);
        if (e.key === "ArrowRight") go(current + 1);
        if (e.key === "Enter") items[current].click();
    });

    update();
});
