console.log("book_detail.js using books.json");

const BOOKS_URL = "../data/books.json";

async function loadBooks() {
    try {
        const res = await fetch(BOOKS_URL);
        const data = await res.json();
        return data.books || [];
    } catch (err) {
        console.error("Could not load books.json", err);
        return [];
    }
}

function getIdFromQuery() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id") || null;
}

async function initDetail() {
    const books = await loadBooks();
    const id = getIdFromQuery();

    if (!id) {
        console.warn("No ID in query.");
        document.getElementById("detailTitle").textContent = "No book selected";
        return;
    }

    const book = books.find(b => b.id === id);

    if (!book) {
        console.warn("Book not found:", id);
        document.getElementById("detailTitle").textContent = "Book not found";
        return;
    }

    // Titel + Autor
    document.getElementById("detailTitle").textContent = book.title;
    document.getElementById("detailAuthor").textContent = book.author;

    // Meta: Genre, pages, price
    const metaEl = document.getElementById("detailMeta");
    const metaParts = [];

    if (book.genre) metaParts.push(book.genre);
    if (book.pages) metaParts.push(`${book.pages} pages`);
    if (book.price) metaParts.push(`${book.price.toFixed(2)} €`);

    metaEl.textContent = metaParts.join(" · ");

    // Cover
    const coverEl = document.getElementById("detailCover");
    if (coverEl) {
        coverEl.style.backgroundImage = `url('../${book.cover}')`;
    }

    // Progress
    const progress = typeof book.progress === "number" ? book.progress : 0;

    document.getElementById("detailProgressLabel").textContent = `${progress}%`;
    const fill = document.getElementById("detailProgressFill");
    fill.style.width = "0%";
    requestAnimationFrame(() => {
        fill.style.width = `${progress}%`;
    });

    // Description
    document.getElementById("detailDescription").textContent =
        book.description || "No description available.";

    // Continue Reading Button
    const contBtn = document.getElementById("continueBtn");
    contBtn.addEventListener("click", () => {
        window.location.href = "reader.html?id=" + book.id;
    });
}

document.addEventListener("DOMContentLoaded", initDetail);
