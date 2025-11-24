console.log("profile.js – clean rebuild");

async function loadJSON(path){ return (await fetch(path)).json(); }

async function initProfile() {
    const users = await loadJSON("../data/users.json");
    const books = await loadJSON("../data/books.json");

    const me = users.users.find(u => u.id === "me");
    const bookList = books.books;

    /* HERO */
    document.getElementById("profileImg").src = "../data/" + me.avatar;
    document.getElementById("displayUsername").textContent = "@" + me.username;
    document.getElementById("displayRealname").textContent = me.realname;
    document.getElementById("displayBio").textContent = me.bio;

    /* Badges */
    const badgeRow = document.getElementById("badgeRow");
    badgeRow.innerHTML = `
        <span class="badge">📘 ${me.stats.booksThisYear} books</span>
        <span class="badge">🔥 streak ${me.stats.streakDays} days</span>
        <span class="badge">⭐ curator</span>
    `;

    /* Reading goal */
    const maxGoal = 50;
    const pct = Math.min(100, Math.round(me.stats.booksThisYear / maxGoal * 100));

    document.querySelector(".progress-fill").style.width = pct + "%";
    document.getElementById("goalCount").textContent =
        `${me.stats.booksThisYear} / ${maxGoal}`;

    /* Preferences */
    buildPills("prefGenres", me.preferences.genres);
    buildPills("prefTone", me.preferences.tone);
    buildPills("prefFormats", me.preferences.formats);
    buildPills("prefPace", [me.preferences.pace]);

    function buildPills(id, arr){
        const wrap = document.getElementById(id);
        wrap.innerHTML = "";
        arr.forEach(p => {
            const el = document.createElement("button");
            el.className = "pill selected";
            el.textContent = p;
            wrap.appendChild(el);
        });
    }

    /* Stats */
    document.getElementById("statBooks").textContent = me.stats.booksThisYear;
    document.getElementById("statPages").textContent = me.stats.pagesRead.toLocaleString();
    document.getElementById("statRating").textContent = me.stats.avgRating + "★";
    document.getElementById("statStreak").textContent = me.stats.streakDays + " d";

    /* Favorites */
    const favWrap = document.getElementById("favoritesRow");
    favWrap.innerHTML = "";

    me.favorites.forEach(id => {
        const b = bookList.find(x => x.id === id);
        if (!b) return;

        const el = document.createElement("article");
        el.className = "fav-book";
        el.innerHTML = `
            <div class="fav-cover" style="background-image:url('../${b.cover}')"></div>
            <p class="fav-title">${b.title}</p>
        `;
        el.onclick = () => window.location.href =
            `../book_detail/book_detail.html?id=${b.id}`;

        favWrap.appendChild(el);
    });

    /* Current reading */
    const current = bookList.find(b => b.id === me.currentReading);
    const block = document.getElementById("currentReadingBlock");

    if (current) {
        const pr = Math.round(me.currentProgress * 100);
        block.innerHTML = `
            <div class="current-cover" style="background-image:url('../${current.cover}')"></div>
            <div class="current-info">
                <p class="current-title">${current.title}</p>
                <p class="current-meta">${current.author} · ${current.genre}</p>

                <div class="current-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width:${pr}%"></div>
                    </div>
                    <div class="current-percent">${pr}%</div>
                </div>

                <button class="continue-btn">Continue reading</button>
            </div>
        `;

        block.querySelector(".continue-btn").onclick = () =>
            window.location.href =
                `../book_detail/book_detail.html?id=${current.id}`;
    }
}

document.addEventListener("DOMContentLoaded", initProfile);
