console.log("my_books.js loaded (ownedBooks version)");

const BOOKS_URL = "../data/books.json";

/* ------------------------------
   LOAD/SAVE OWNED BOOKS
------------------------------ */
function loadOwnedBooks() {
    return JSON.parse(localStorage.getItem("ownedBooks") || "[]");
}

/* ------------------------------
   LOAD ALL BOOKS
------------------------------ */
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

/* ------------------------------
   DOM
------------------------------ */
const continueList = document.getElementById("continueList");
const recentList   = document.getElementById("recentList");
const libraryGrid  = document.getElementById("libraryGrid");

/* ------------------------------
   CARD TEMPLATES
------------------------------ */

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
        </div>`;
}

function cardGrid(book) {
    return `
        <div class="book-card-grid"
             onclick="window.location.href='book_detail.html?id=${book.id}'">
            <div class="cover" style="background-image:url('../${book.cover}')"></div>
            <div class="title">${book.title}</div>
            <div class="author">${book.author}</div>
        </div>`;
}

/* ------------------------------
   INIT
------------------------------ */

async function initMyBooks() {
    const allBooks = await loadBooks();
    if (!allBooks.length) return;

    const ownedIds = loadOwnedBooks();
    const ownedBooks = allBooks.filter(b => ownedIds.includes(b.id) || b.owned === true);

    /* ------------------------------
       CONTINUE READING
       (owned + progress > 0)
    ------------------------------ */
    const continueBooks = ownedBooks.filter(b => (b.progress || 0) > 0);

    continueList.innerHTML =
        continueBooks.length
            ? continueBooks
                .map(b => cardHorizontal(b, b.progress || 0))
                .join("")
            : `<p class="empty-note">You haven’t started anything yet.</p>`;

    /* ------------------------------
       RECENTLY ADDED
       (einfach die letzten 6 gekauften, newest last in ownedBooks)
    ------------------------------ */

    const recentBooks = ownedBooks
        .slice(-6)        // letzte 6
        .reverse();       // neuestes zuerst

    recentList.innerHTML =
        recentBooks.length
            ? recentBooks.map(b => cardHorizontal(b, null)).join("")
            : `<p class="empty-note">No recent additions.</p>`;

    /* ------------------------------
       FULL LIBRARY (GRID)
    ------------------------------ */
    libraryGrid.innerHTML =
        ownedBooks.length
            ? ownedBooks.map(cardGrid).join("")
            : `<p class="empty-note">You don't own any books yet.</p>`;
}

document.addEventListener("DOMContentLoaded", initMyBooks);
