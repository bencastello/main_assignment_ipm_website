console.log("my_books.js loaded (JSON version)");

const BOOKS_URL = "../data/books.json";

async function loadBooks() {
    try {
        const res = await fetch(BOOKS_URL);
        const data = await res.json();
        return data.books || [];
    } catch (err) {
        console.error("Failed loading books.json", err);
        return [];
    }
}

// ------------------------------
// BOOK GROUPS
// ------------------------------
// Simpler: du könntest diese Infos auch später in users.json speichern.
const USER_READING = ["hp2", "faust2"];           // continue reading
const USER_RECENT  = ["friends2", "hitchhike"];   // recently added
const USER_LIBRARY = true;                        // = alle books.json

// ------------------------------
// DOM REFS
// ------------------------------
const continueList = document.getElementById("continueList");
const recentList   = document.getElementById("recentList");
const libraryGrid  = document.getElementById("libraryGrid");

// ------------------------------
// CARD TEMPLATES
// ------------------------------

function cardHorizontal(book, progress = null) {
    return `
        <div class="book-card-horizontal"
             onclick="window.location.href='book_detail.html?id=${book.id}'">
            <div class="cover" style="background-image:url('../${book.cover}')"></div>
            <div class="title">${book.title}</div>
            <div class="author">${book.author}</div>
            ${
        progress !== null
            ? `
                <div class="progress-bar">
                    <div class="progress-fill" style="width:${progress}%"></div>
                </div>
            `
            : ""
    }
        </div>
    `;
}

function cardGrid(book) {
    return `
        <div class="book-card-grid"
             onclick="window.location.href='book_detail.html?id=${book.id}'">
            <div class="cover" style="background-image:url('../${book.cover}')"></div>
            <div class="title">${book.title}</div>
            <div class="author">${book.author}</div>
        </div>
    `;
}

// ------------------------------
// INIT
// ------------------------------

async function initMyBooks() {
    const books = await loadBooks();
    if (!books.length) return;

    // Continue reading
    const continueBooks = books.filter(b => USER_READING.includes(b.id));
    continueList.innerHTML = continueBooks.length
        ? continueBooks
            .map(b => cardHorizontal(b, b.progress || 0))
            .join("")
        : `<p class="empty-note">Nothing to show yet.</p>`;

    // Recently added
    const recentBooks = books.filter(b => USER_RECENT.includes(b.id));
    recentList.innerHTML = recentBooks.length
        ? recentBooks.map(cardHorizontal).join("")
        : `<p class="empty-note">No recent additions.</p>`;

    // Library (Grid)
    libraryGrid.innerHTML = books.map(cardGrid).join("");
}

document.addEventListener("DOMContentLoaded", initMyBooks);
