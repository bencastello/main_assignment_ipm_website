async function loadJSON(path) {
    const res = await fetch(path);
    return await res.json();
}

document.addEventListener("DOMContentLoaded", initCurators);

async function initCurators() {
    try {
        const [curatorData, bookData] = await Promise.all([
            loadJSON("../data/curators.json"),
            loadJSON("../data/books.json")
        ]);

        const books = bookData.books;
        const entries = curatorData.entries;

        const bowEntry = entries.find(e => e.id === curatorData.bookOfWeek);
        const pickEntries = entries.filter(e => e.id !== curatorData.bookOfWeek);

        renderBookOfWeek(bowEntry, books);
        renderPicks(pickEntries, books);
    } catch (err) {
        console.error("Curators page error:", err);
    }
}

function findBook(books, id) {
    return books.find(b => b.id === id);
}

function renderBookOfWeek(entry, books) {
    const container = document.getElementById("bowSection");
    if (!entry) return;

    const book = findBook(books, entry.bookId);
    if (!book) return;

    container.innerHTML = `
        <div class="bow-card">
            <div class="bow-cover" style="background-image:url('../${book.cover}')"></div>
            <div class="bow-text">
                <h2>${book.title}</h2>
                <p>${entry.tagline}</p>
                <button class="bow-btn"
                    onclick="window.location.href='entry.html?id=${entry.id}'">
                    Read more →
                </button>
            </div>
        </div>
    `;
}

function renderPicks(entries, books) {
    const grid = document.getElementById("pickGrid");
    grid.innerHTML = "";

    entries.forEach(entry => {
        const book = findBook(books, entry.bookId);
        if (!book) return;

        const card = document.createElement("article");
        card.className = "pick-card";
        card.onclick = () => {
            window.location.href = `entry.html?id=${entry.id}`;
        };

        card.innerHTML = `
            <div class="pick-cover" style="background-image:url('../${book.cover}')"></div>
            <div class="pick-title">${book.title}</div>
            <div class="pick-curator">Picked by ${entry.curator}</div>
        `;

        grid.appendChild(card);
    });
}
