console.log("reader.js loaded");

const BOOKS_URL = "../data/books.json";
const PROGRESS_KEY = "shelves_reader_progress";
const CHARS_PER_PAGE = 1500;

async function loadBooks() {
    const res = await fetch(BOOKS_URL);
    const data = await res.json();
    return data.books || [];
}

async function loadBookText(path) {
    if (path.startsWith("/") || path.startsWith("../") || path.startsWith("./")) {
        const res = await fetch(path);
        return await res.text();
    }
    if (path.startsWith("books/")) {
        const res = await fetch("../" + path);
        return await res.text();
    }
    const res = await fetch("../data/" + path);
    return await res.text();
}

function splitIntoPages(text) {
    const pages = [];
    let pos = 0;
    while (pos < text.length) {
        const slice = text.slice(pos, pos + CHARS_PER_PAGE);
        const lastSpace = slice.lastIndexOf(" ");
        const cut = lastSpace > 0 ? lastSpace : slice.length;
        pages.push(slice.slice(0, cut).trim());
        pos += cut;
    }
    return pages;
}

function getIdFromQuery() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id") || "hitchhike";
}

function loadProgress(bookId) {
    const all = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
    return all[bookId] || { page: 0 };
}

function saveProgress(bookId, page) {
    const all = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
    all[bookId] = { page };
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(all));
}

async function initReader() {
    const books = await loadBooks();
    const bookId = getIdFromQuery();
    const book = books.find(b => b.id === bookId);

    const titleEl = document.getElementById("readerTitle");
    const progressLabel = document.getElementById("readerProgressLabel");
    const progressFill = document.getElementById("readerProgressFill");
    const leftPage = document.getElementById("leftPage");
    const rightPage = document.getElementById("rightPage");

    if (!book) {
        titleEl.textContent = "Not found";
        leftPage.textContent = "This book does not exist.";
        rightPage.textContent = "";
        return;
    }

    titleEl.textContent = book.title;

    let pages = [];

    if (book.textFile) {
        try {
            const raw = await loadBookText(book.textFile);
            pages = splitIntoPages(raw);
        } catch (e) {
            pages = ["Could not load text file: " + e.message];
        }
    } else {
        pages = ["No content available for this book."];
    }

    let currentPage = loadProgress(bookId).page;

    function renderSpread() {
        leftPage.textContent = pages[currentPage] || "";
        rightPage.textContent = pages[currentPage + 1] || "";
        const pct = Math.round((currentPage / (pages.length - 1)) * 100);
        progressLabel.textContent = pct + "%";
        progressFill.style.width = pct + "%";
        saveProgress(bookId, currentPage);
    }

    renderSpread();

    document.getElementById("nextChunk").addEventListener("click", () => {
        if (currentPage < pages.length - 2) {
            rightPage.classList.add("flipping");
            setTimeout(() => {
                currentPage += 2;
                rightPage.classList.remove("flipping");
                renderSpread();
            }, 700);
        }
    });

    document.getElementById("prevChunk").addEventListener("click", () => {
        if (currentPage >= 2) {
            leftPage.classList.add("flipping");
            setTimeout(() => {
                currentPage -= 2;
                leftPage.classList.remove("flipping");
                renderSpread();
            }, 700);
        }
    });

    document.getElementById("backBtn").addEventListener("click", () => {
        window.history.back();
    });
}

document.addEventListener("DOMContentLoaded", initReader);
