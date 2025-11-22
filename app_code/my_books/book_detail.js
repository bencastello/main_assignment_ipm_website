// app_code/my_books/book_detail.js
document.addEventListener("DOMContentLoaded", () => {

    const params = new URLSearchParams(window.location.search);
    const bookId = params.get("id");

    const books = [
        {
            id: "hp2",
            title: "Harry Potter II",
            author: "J.K. Rowling",
            cover: "../covers/hp2.jpg",
            description: "The second year at Hogwarts brings new dangers, a mysterious chamber and a very cursed diary.",
            meta: "Fantasy · Friend rec"
        },
        {
            id: "faust2",
            title: "Faust II",
            author: "J.W. von Goethe",
            cover: "../covers/faust2.jpg",
            description: "A dense, wild and surreal continuation of Faust’s pact and journey through allegorical worlds.",
            meta: "Classics · Deep stuff"
        },
        {
            id: "friends2",
            title: "FRIENDS II",
            author: "Lena Hart",
            cover: "../covers/friends2.jpg",
            description: "Chaotic friend group energy, messy love lives and questionable life choices. Light, fast, addictive.",
            meta: "Contemporary · Lighthearted chaos"
        },
        {
            id: "hitchhike",
            title: "Hitchhike through the Galaxy",
            author: "Douglas Adams",
            cover: "../covers/hitch.jpg",
            description: "Absurd sci-fi roadtrip with questionable survival chances and a lot of sarcasm.",
            meta: "Sci-Fi · Absurdist humor"
        }
    ];

    const book = books.find(b => b.id === bookId) || books[0];

    const coverEl = document.getElementById("detailCover");
    const titleEl = document.getElementById("detailTitle");
    const authorEl = document.getElementById("detailAuthor");
    const metaEl = document.getElementById("detailMeta");
    const descEl = document.getElementById("detailDescription");
    const progressLabel = document.getElementById("detailProgressLabel");
    const progressFill = document.getElementById("detailProgressFill");
    const continueBtn = document.getElementById("continueBtn");

    // Daten setzen
    coverEl.style.backgroundImage = `url(${book.cover})`;
    titleEl.textContent = book.title;
    authorEl.textContent = book.author;
    metaEl.textContent = book.meta;
    descEl.textContent = book.description;

    const stored = localStorage.getItem("shelves_progress_" + book.id);
    const progress = stored !== null ? Math.min(1, Math.max(0, parseFloat(stored))) : 0;

    progressLabel.textContent = Math.round(progress * 100) + "%";
    progressFill.style.width = (progress * 100) + "%";

    continueBtn.addEventListener("click", () => {
        window.location.href = `reader.html?id=${encodeURIComponent(book.id)}`;
    });
});
