console.log("book_detail.js using books.json");

const BOOKS_URL = "../data/books.json";

function loadOwnedBooks() {
    return JSON.parse(localStorage.getItem("ownedBooks") || "[]");
}

function saveOwnedBooks(arr) {
    localStorage.setItem("ownedBooks", JSON.stringify(arr));
}

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
    const ownedBooks = loadOwnedBooks();

    if (!id) {
        document.getElementById("detailTitle").textContent = "No book selected";
        return;
    }

    const book = books.find(b => b.id === id);
    if (!book) {
        document.getElementById("detailTitle").textContent = "Book not found";
        return;
    }

    const isOwned = ownedBooks.includes(book.id);

    // Titel + Autor
    document.getElementById("detailTitle").textContent = book.title;
    document.getElementById("detailAuthor").textContent = book.author;

    // METADATA (nur wenn owned)
    const metaEl = document.getElementById("detailMeta");
    metaEl.textContent = isOwned
        ? [book.genre, book.pages ? `${book.pages} pages` : null, book.price ? `${book.price} €` : null]
            .filter(Boolean)
            .join(" · ")
        : book.genre || "";

    // Cover setzen
    const coverEl = document.getElementById("detailCover");
    coverEl.style.backgroundImage = `url('../${book.cover}')`;

    // Progress nur anzeigen, wenn owned
    const progressSection = document.querySelector(".detail-progress");
    if (!isOwned) {
        progressSection.style.display = "none";
    } else {
        const progress = typeof book.progress === "number" ? book.progress : 0;
        document.getElementById("detailProgressLabel").textContent = `${progress}%`;
        const fill = document.getElementById("detailProgressFill");
        fill.style.width = "0%";
        requestAnimationFrame(() => (fill.style.width = `${progress}%`));
    }

    // Aktion-Buttons
    const actions = document.querySelector(".detail-actions");

    const continueBtn = document.getElementById("continueBtn");

    if (isOwned) {
        continueBtn.style.display = "inline-flex";
    } else {
        continueBtn.style.display = "none";

        const buyBtn = document.createElement("button");
        buyBtn.textContent = `Buy for ${book.price || "?"} €`;
        buyBtn.className = "primary-btn";
        buyBtn.id = "buyBtn";

        buyBtn.addEventListener("click", () => {
            if (!ownedBooks.includes(book.id)) {
                ownedBooks.push(book.id);
                saveOwnedBooks(ownedBooks);
            }
            window.location.reload();
        });

        actions.prepend(buyBtn);
    }

    document.getElementById("detailDescription").textContent =
        book.description || "No description available.";

    continueBtn.addEventListener("click", () => {
        window.location.href = `reader.html?id=${book.id}`;
    });
}

document.addEventListener("DOMContentLoaded", initDetail);
