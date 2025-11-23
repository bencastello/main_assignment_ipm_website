console.log("reader.js loaded");

const BOOKS_URL = "../data/books.json";
const PROGRESS_KEY = "shelves_reader_progress";

// ------- Load JSON -------

async function loadBooks() {
    const res = await fetch(BOOKS_URL);
    const data = await res.json();
    return data.books || [];
}

// ------- Helpers -------

function getIdFromQuery() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id") || "hitchhike";
}

function loadProgress(bookId) {
    const all = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
    return all[bookId] || { chunk: 0 };
}

function saveProgress(bookId, chunk) {
    const all = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
    all[bookId] = { chunk };
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(all));
}

// ------- Reader Logic -------

async function initReader() {
    const books = await loadBooks();
    const bookId = getIdFromQuery();
    const book = books.find(b => b.id === bookId);

    if (!book) {
        document.getElementById("readerTitle").textContent = "Not found";
        document.getElementById("readerContent").textContent =
            "This book does not exist.";
        return;
    }

    const titleEl = document.getElementById("readerTitle");
    const contentEl = document.getElementById("readerContent");
    const progressLabel = document.getElementById("readerProgressLabel");
    const progressFill = document.getElementById("readerProgressFill");

    titleEl.textContent = book.title;

    // Handle chunks
    const chunks = book.contentChunks || [
        "No content available for this book."
    ];

    const progress = loadProgress(bookId);
    let currentChunk = progress.chunk;

    function renderChunk() {
        contentEl.textContent = chunks[currentChunk];

        // update progress
        const pct = Math.round((currentChunk / (chunks.length - 1)) * 100);
        progressLabel.textContent = pct + "%";
        progressFill.style.width = pct + "%";

        saveProgress(bookId, currentChunk);
    }

    renderChunk();

    // ---- Buttons ----
    document.getElementById("nextChunk").addEventListener("click", () => {
        if (currentChunk < chunks.length - 1) {
            currentChunk++;
            renderChunk();
        }
    });

    document.getElementById("prevChunk").addEventListener("click", () => {
        if (currentChunk > 0) {
            currentChunk--;
            renderChunk();
        }
    });

    document.getElementById("backBtn").addEventListener("click", () => {
        window.history.back();
    });
}

document.addEventListener("DOMContentLoaded", initReader);
