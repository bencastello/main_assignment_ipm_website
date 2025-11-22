document.addEventListener("DOMContentLoaded", () => {

    const books = [
        { id: "hp2", title: "Harry Potter II", cover: "covers/hp2.jpg" },
        { id: "faust2", title: "Faust II", cover: "covers/faust2.jpg" },
        { id: "friends2", title: "FRIENDS II", cover: "covers/friends2.jpg" },
        { id: "hitchhike", title: "Hitchhike", cover: "covers/hitch.jpg" }
    ];

    /* ---- CONTINUE ---- */
    const continueList = document.getElementById("continueList");

    const reading = books.filter(b => {
        const p = parseFloat(localStorage.getItem("shelves_progress_" + b.id));
        return p > 0 && p < 1;
    });

    continueList.innerHTML =
        reading.map(b => `
        <div class="home-cont-card" onclick="window.location.href='my_books/book_detail.html?id=${b.id}'">
            <div class="home-cont-cover" style="background-image:url(${b.cover})"></div>
            <p>${b.title}</p>
        </div>
    `).join("");

    /* ---- TRENDING ---- */
    const trendingList = document.getElementById("trendingList");

    trendingList.innerHTML =
        books.map(b => `
        <div class="home-trend-card" onclick="window.location.href='my_books/book_detail.html?id=${b.id}'">
            <div class="home-trend-cover" style="background-image:url(${b.cover})"></div>
            <p>${b.title}</p>
        </div>
    `).join("");

});
