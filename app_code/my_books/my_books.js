// app_code/my_books/my_books.js
document.addEventListener("DOMContentLoaded", () => {

    const books = [
        {
            id: "hp2",
            title: "Harry Potter II",
            author: "J.K. Rowling",
            cover: "../covers/hp2.jpg",
            progress: 0.62,
            added: "2025-01-12"
        },
        {
            id: "faust2",
            title: "Faust II",
            author: "J.W. von Goethe",
            cover: "../covers/faust2.jpg",
            progress: 0.15,
            added: "2025-01-10"
        },
        {
            id: "friends2",
            title: "FRIENDS II",
            author: "Lena Hart",
            cover: "../covers/friends2.jpg",
            progress: 1,
            added: "2024-12-30"
        },
        {
            id: "hitchhike",
            title: "Hitchhike through the Galaxy",
            author: "Douglas Adams",
            cover: "../covers/hitch.jpg",
            progress: 0,
            added: "2024-12-20"
        }
    ];

    // Progress aus localStorage mergen
    books.forEach(book => {
        const stored = localStorage.getItem("shelves_progress_" + book.id);
        if (stored !== null) {
            const val = parseFloat(stored);
            if (!Number.isNaN(val)) {
                book.progress = Math.min(1, Math.max(0, val));
            }
        }
    });

    const continueReading = books.filter(b => b.progress > 0 && b.progress < 1);

    const recentAdded = books
        .slice()
        .sort((a, b) => new Date(b.added) - new Date(a.added))
        .slice(0, 8);

    const library = books;

    function cardClickHandler(id) {
        window.location.href = `book_detail.html?id=${encodeURIComponent(id)}`;
    }

    function renderContinue() {
        const container = document.getElementById("continueList");
        if (!container) return;

        container.innerHTML = continueReading.map(b => `
            <div class="book-card-horizontal" data-id="${b.id}">
                <div class="cover" style="background-image:url(${b.cover})"></div>
                <div class="title">${b.title}</div>
                <div class="author">${b.author}</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width:${b.progress * 100}%"></div>
                </div>
            </div>
        `).join("");

        container.querySelectorAll(".book-card-horizontal").forEach(card => {
            card.addEventListener("click", () => cardClickHandler(card.dataset.id));
        });
    }

    function renderRecent() {
        const container = document.getElementById("recentList");
        if (!container) return;

        container.innerHTML = recentAdded.map(b => `
            <div class="book-card-horizontal" data-id="${b.id}">
                <div class="cover" style="background-image:url(${b.cover})"></div>
                <div class="title">${b.title}</div>
                <div class="author">${b.author}</div>
            </div>
        `).join("");

        container.querySelectorAll(".book-card-horizontal").forEach(card => {
            card.addEventListener("click", () => cardClickHandler(card.dataset.id));
        });
    }

    function renderLibrary() {
        const container = document.getElementById("libraryGrid");
        if (!container) return;

        container.innerHTML = library.map(b => `
            <div class="book-card-grid" data-id="${b.id}">
                <div class="cover" style="background-image:url(${b.cover})"></div>
                <div class="title">${b.title}</div>
                <div class="author">${b.author}</div>
            </div>
        `).join("");

        container.querySelectorAll(".book-card-grid").forEach(card => {
            card.addEventListener("click", () => cardClickHandler(card.dataset.id));
        });
    }

    renderContinue();
    renderRecent();
    renderLibrary();
});
