console.log("homepage.js loaded (fixed)");

document.addEventListener("DOMContentLoaded", () => {

    const continueList = document.getElementById("continueList");
    const trendingList = document.getElementById("trendingList");

    async function loadBooks() {
        try {
            const res = await fetch("data/books.json");
            const data = await res.json();
            return data.books || [];
        } catch (err) {
            console.error("Could not load books.json", err);
            return [];
        }
    }

    function loadOwnedBooks() {
        try {
            return JSON.parse(localStorage.getItem("ownedBooks") || "[]");
        } catch {
            return [];
        }
    }

    function coverUrl(b) {
        if (!b.cover) return "";
        if (b.cover.startsWith("http") || b.cover.startsWith("/")) return b.cover;
        return b.cover.startsWith("covers") ? b.cover : "covers/" + b.cover;
    }

    function createCard(book) {
        return `
            <article class="home-cont-card"
                onclick="window.location.href='my_books/book_detail.html?id=${book.id}'">
                <div class="home-cont-cover"
                     style="background-image:url('${coverUrl(book)}')"></div>
                <p>${book.title}</p>
            </article>`;
    }

    async function initHome() {
        const books = await loadBooks();
        const owned = loadOwnedBooks();

        if (!books.length) return;

        // CONTINUE READING = owned + progress > 0
        const reading = books.filter(b => owned.includes(b.id) && (b.progress || 0) > 0);
        const readingDisplay = reading.slice(0, 6);

        continueList.innerHTML =
            readingDisplay.length
                ? readingDisplay.map(createCard).join("")
                : "<p class='no-results'>You're not reading anything yet.</p>";

        // TRENDING = featured or random fallback
        let trending = books.filter(b => b.featured);
        if (!trending.length) trending = books.slice(0, 10);

        trendingList.innerHTML = trending.map(b => `
            <article class="home-trend-card"
                     onclick="window.location.href='my_books/book_detail.html?id=${b.id}'">
                <div class="home-trend-cover"
                    style="background-image:url('${coverUrl(b)}')"></div>
                <p>${b.title}</p>
            </article>
        `).join("");
    }

    initHome();
});
