console.log("profile.js – clean rebuild");

async function loadJSON(path) {
    return (await fetch(path)).json();
}

async function initProfile() {
    const users = await loadJSON("../data/users.json");
    const books = await loadJSON("../data/books.json");

    const me = users.users.find(u => u.id === "me");
    const bookList = books.books;


    const usernameEl = document.getElementById("displayUsername");
    const realnameEl = document.getElementById("displayRealname");
    const bioEl = document.getElementById("displayBio");
    const avatarImg = document.getElementById("profileImg");


    const rawUsername = me.username || "";
    const displayUsername = rawUsername.startsWith("@") ? rawUsername : "@" + rawUsername;
    usernameEl.textContent = displayUsername;
    realnameEl.textContent = me.realname || "";
    bioEl.textContent = me.bio || "";

    const defaultAvatar = "../data/" + me.avatar;


    const savedAvatar = localStorage.getItem("profileAvatar");
    avatarImg.src = savedAvatar || defaultAvatar;


    document.getElementById("badgeRow").innerHTML = "";


    const maxGoal = 50;
    const pct = Math.min(100, Math.round((me.stats.booksThisYear / maxGoal) * 100));
    document.querySelector(".progress-fill").style.width = pct + "%";
    document.getElementById("goalCount").textContent =
        `${me.stats.booksThisYear} / ${maxGoal}`;


    buildPills("prefGenres", me.preferences.genres || []);
    buildPills("prefTone", me.preferences.tone || []);
    buildPills("prefFormats", me.preferences.formats || []);
    buildPills("prefPace", [me.preferences.pace].filter(Boolean));

    function buildPills(id, arr) {
        const wrap = document.getElementById(id);
        wrap.innerHTML = "";
        arr.forEach(p => {
            const el = document.createElement("button");
            el.className = "pill selected";
            el.textContent = p;
            el.addEventListener("click", () => {
                el.classList.toggle("selected");
            });
            wrap.appendChild(el);
        });
    }


    document.getElementById("statBooks").textContent = me.stats.booksThisYear;
    document.getElementById("statPages").textContent = me.stats.pagesRead.toLocaleString();
    document.getElementById("statStreak").textContent = me.stats.streakDays + " d";

    const favWrap = document.getElementById("favoritesRow");
    favWrap.innerHTML = "";

    const candidates = bookList.filter(b => !!b.cover);
    const random4 = [...candidates].sort(() => Math.random() - 0.5).slice(0, 4);

    random4.forEach(b => {
        const el = document.createElement("article");
        el.className = "fav-book";
        el.innerHTML = `
            <div class="fav-cover" style="background-image:url('../${b.cover}')"></div>
            <p class="fav-title">${b.title}</p>
        `;
        el.addEventListener("click", () => {
            window.location.href = `../book_detail/book_detail.html?id=${b.id}`;
        });
        favWrap.appendChild(el);
    });

    const current = bookList.find(b => b.id === me.currentReading);
    const block = document.getElementById("currentReadingBlock");

    if (current) {
        const pr = Math.round((me.currentProgress || 0) * 100);
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

        block.querySelector(".continue-btn").addEventListener("click", () => {
            window.location.href = `../book_detail/book_detail.html?id=${current.id}`;
        });
    }


    const avatarClickable = document.getElementById("avatarClickable");
    const avatarInput = document.getElementById("avatarInput");

    avatarClickable.addEventListener("click", () => {
        avatarInput.click();
    });

    avatarInput.addEventListener("change", event => {
        const file = event.target.files && event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = e => {
            const dataUrl = e.target.result;
            avatarImg.src = dataUrl;
            try {
                localStorage.setItem("profileAvatar", dataUrl);
            } catch (err) {
                console.warn("Could not save avatar to localStorage", err);
            }
        };
        reader.readAsDataURL(file);
    });
}

document.addEventListener("DOMContentLoaded", initProfile);
