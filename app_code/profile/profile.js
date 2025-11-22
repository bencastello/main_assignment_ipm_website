console.log("profile.js loaded");

const params = new URLSearchParams(window.location.search);
const id = params.get("id") || "me";

const profileImg = document.getElementById("profileImg");
const avatarClickable = document.getElementById("avatarClickable");
const openEditBtn = document.getElementById("openEditBtn");
const messageButton = document.getElementById("messageButton");
const privacyCard = document.getElementById("privacyCard");
const prefsContent = document.getElementById("prefsContent");

const FRIENDS = {
    me: {
        name: "@exampleuser",
        real: "Petra Example",
        bio: "Book lover. Avid reader of mystery and fantasy.",
        avatar: "../user_icon.png",
        badges: ["📘 128 books", "🔥 streak 12 days", "⭐ curator"],
        stats: { books: 34, pages: 11240, rating: "4.2★", streak: "28 d" },
        favorites: ["hp2", "faust2", "friends2", "hitchhike"],
        current: { title: "The Long Way...", meta: "Becky Chambers · cozy sci-fi", progress: 64 },
        prefs: ["Fantasy", "Thriller", "Science Fiction"],
        activity: [
            "Curator since 2024",
            "Created 7 recommendation lists",
            "Wrote 15 curator posts",
            "Last active 2 hours ago"
        ]
    },
    anna: {
        name: "@anna",
        real: "Anna Weber",
        bio: "Chaotic fantasy reader. Loves dragons.",
        avatar: "../friends/anna.png",
        badges: ["🐉 fantasy enjoyer"],
        stats: { books: 12, pages: 3000, rating: "4.7★", streak: "6 d" },
        favorites: ["hp2", "hitchhike"],
        current: { title: "Eragon", meta: "dragons etc.", progress: 41 },
        prefs: ["Fantasy", "Romance"],
        activity: ["Finished: Eragon", "Rated ★★★★☆"]
    },
    // ... weitere Freunde
};

const p = FRIENDS[id] || FRIENDS["me"];

document.getElementById("displayUsername").textContent = p.name;
document.getElementById("displayRealname").textContent = p.real;
document.getElementById("displayBio").textContent = p.bio;
profileImg.src = p.avatar;


// Badges
document.getElementById("badgeRow").innerHTML =
    p.badges.map(b => `<span class="badge">${b}</span>`).join("");


// Stats
document.getElementById("statBooks").textContent = p.stats.books;
document.getElementById("statPages").textContent = p.stats.pages;
document.getElementById("statRating").textContent = p.stats.rating;
document.getElementById("statStreak").textContent = p.stats.streak;


// Favorites
const favRow = document.getElementById("favRow");
favRow.innerHTML = p.favorites.map(f => {
    return `
    <article class="fav-book">
        <div class="fav-cover fav-${f}"></div>
        <p class="fav-title">${f}</p>
    </article>`;
}).join("");


// Currently reading
document.getElementById("currentBlock").innerHTML = `
    <div class="current-cover"></div>
    <div class="current-info">
        <p class="current-title">${p.current.title}</p>
        <p class="current-meta">${p.current.meta}</p>

        <div class="current-progress">
            <div class="progress-bar">
                <div class="progress-fill" style="width:${p.current.progress}%"></div>
            </div>
            <div class="current-percent">${p.current.progress}%</div>
        </div>

        <button class="continue-btn">Continue reading</button>
    </div>
`;


// Activity
document.getElementById("activityList").innerHTML =
    p.activity.map(a => `<li>${a}</li>`).join("");


// Preferences
if (id === "me") {
    // full interactive layout (your original pills)
    prefsContent.innerHTML = `
        <h4>Genres</h4>
        <div class="pill-row">
            <button class="pill">Fantasy</button>
            <button class="pill">Thriller</button>
            <button class="pill">Romance</button>
            <button class="pill">Science Fiction</button>
        </div>

        <h4>Tone</h4>
        <div class="pill-row">
            <button class="pill">cozy</button>
            <button class="pill">dark</button>
            <button class="pill">wholesome</button>
        </div>
    `;
} else {
    // display-only
    prefsContent.innerHTML = `
        <h4>Preferences</h4>
        <p>${p.prefs.join(", ")}</p>
    `;
}


// MODE SWITCH (me vs friend)
if (id === "me") {
    // YOU — everything stays enabled
    messageButton.classList.add("hidden");
} else {
    // FRIEND MODE — disable editing
    avatarClickable.classList.add("disabled");
    openEditBtn.classList.add("hidden");
    privacyCard.classList.add("hidden");

    messageButton.classList.remove("hidden");
    messageButton.onclick = () => {
        window.location.href = `../chat/chat.html?thread=${id}`;
    };
}
