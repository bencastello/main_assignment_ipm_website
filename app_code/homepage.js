document.addEventListener("DOMContentLoaded", () => {
    console.log("homepage.js loaded");

    // simple static data for homepage sections
    const books = [
        { id: "hp2",       title: "Harry Potter II",       cover: "covers/hp2.jpg" },
        { id: "faust2",    title: "Faust II",              cover: "covers/faust2.jpg" },
        { id: "friends2",  title: "FRIENDS II",            cover: "covers/friends2.jpg" },
        { id: "hitchhike", title: "Hitchhike through the Galaxy", cover: "covers/hitch.jpg" }
    ];

    const continueList = document.getElementById("continueList");
    const trendingList = document.getElementById("trendingList");

    if (continueList) {
        const reading = books.slice(0, 3);
        continueList.innerHTML = reading.map(b => `
            <article class="home-cont-card"
                     onclick="window.location.href='my_books/book_detail.html?id=${b.id}'">
                <div class="home-cont-cover" style="background-image:url('${b.cover}')"></div>
                <p>${b.title}</p>
            </article>
        `).join("");
    }

    if (trendingList) {
        trendingList.innerHTML = books.map(b => `
            <article class="home-trend-card"
                     onclick="window.location.href='my_books/book_detail.html?id=${b.id}'">
                <div class="home-trend-cover" style="background-image:url('${b.cover}')"></div>
                <p>${b.title}</p>
            </article>
        `).join("");
    }
});
