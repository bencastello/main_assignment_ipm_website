let profile = {
    username: "@fellowreader",
    realname: "Fellow Reader",
    bio: "Hello there, it's me :)",
    avatar: "../user_icon.png",
    readingGoal: { current: 34, goal: 50 },
    preferences: {
        genres: ["Fantasy", "Sci-Fi", "Classics", "Crime"]
    },
    stats: {
        books: 34,
        pages: 11240,
        streak: 28
    },
    favorites: [
        { id: 1, title: "The Hobbit", cover: "../covers/hobbit.jpg" },
        { id: 2, title: "Hitchhiker's Guide", cover: "../covers/hhgttg.jpg" },
        { id: 3, title: "Gone Girl", cover: "../covers/gone_girl.jpg" },
        { id: 4, title: "Jane Eyre", cover: "../covers/jane_eyre.jpg" }
    ],
    current: {
        id: 2,
        title: "The Long Way to a Small, Angry Planet",
        author: "Becky Chambers",
        cover: "../covers/long_way.jpg",
        progress: 62
    }
};

const ALL_GENRES = [
    "Fantasy", "Sci-Fi", "Classics", "Crime",
    "Romance", "Thriller", "Horror", "Mystery",
    "Historical", "Adventure", "Drama", "Non-Fiction"
];

async function loadRealBooks() {
    try {
        const res = await fetch("../data/books.json");
        const data = await res.json();
        return data.books || [];
    } catch {
        return [];
    }
}

async function syncProfileBooks() {
    const realBooks = await loadRealBooks();

    function matchTitle(title) {
        return realBooks.find(
            b => b.title.trim().toLowerCase() === title.trim().toLowerCase()
        );
    }

    profile.favorites = [
        matchTitle("The Hobbit"),
        matchTitle("Hitchhiker's Guide"),
        matchTitle("Gone Girl"),
        matchTitle("Jane Eyre")
    ].filter(Boolean);

    const currentReal = matchTitle("The Long Way to a Small, Angry Planet");
    if (currentReal) {
        profile.current.id = currentReal.id;
        profile.current.cover = "../" + currentReal.cover;
        profile.current.author = currentReal.author;
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    await syncProfileBooks();
    loadProfile();
    setupProfileEditing();
    setupAvatarUpload();
    setupGenreModal();
});

function loadProfile() {
    document.getElementById("displayUsername").textContent = profile.username;
    document.getElementById("displayRealname").textContent = profile.realname;
    document.getElementById("displayBio").textContent = profile.bio;
    document.getElementById("profileImg").src = profile.avatar;
    loadGenres();
    loadStats();
    loadFavorites();
    loadCurrentReading();
    loadReadingProgress();
}

function loadGenres() {
    const el = document.getElementById("prefGenres");
    el.innerHTML = "";
    profile.preferences.genres.forEach(g => {
        const pill = document.createElement("div");
        pill.className = "pill";
        pill.textContent = g;
        el.appendChild(pill);
    });
}

function loadStats() {
    document.getElementById("statBooks").textContent = profile.stats.books;
    document.getElementById("statPages").textContent = profile.stats.pages;
    document.getElementById("statStreak").textContent = profile.stats.streak + " d";
}

function loadFavorites() {
    const row = document.getElementById("favoritesRow");
    row.innerHTML = "";
    profile.favorites.forEach(book => {
        const item = document.createElement("div");
        item.className = "fav-book";
        const cover = document.createElement("div");
        cover.className = "fav-cover";
        cover.style.backgroundImage = `url('../${book.cover}')`;
        cover.style.cursor = "pointer";
        cover.addEventListener("click", () => {
            window.location.href = `../my_books/book_detail.html?id=${book.id}`;
        });
        const title = document.createElement("div");
        title.textContent = book.title;
        title.style.fontSize = "13px";
        title.style.cursor = "pointer";
        title.addEventListener("click", () => {
            window.location.href = `../my_books/book_detail.html?id=${book.id}`;
        });
        item.appendChild(cover);
        item.appendChild(title);
        row.appendChild(item);
    });
}

function loadCurrentReading() {
    const block = document.getElementById("currentReadingBlock");
    block.innerHTML = "";
    const cover = document.createElement("div");
    cover.className = "current-cover";
    cover.style.backgroundImage = `url('${profile.current.cover}')`;
    cover.style.cursor = "pointer";
    cover.addEventListener("click", () => {
        window.location.href = `../my_books/book_detail.html?id=${profile.current.id}`;
    });
    const info = document.createElement("div");
    info.className = "current-info";
    const title = document.createElement("h4");
    title.className = "current-title";
    title.textContent = profile.current.title;
    const meta = document.createElement("div");
    meta.className = "current-meta";
    meta.textContent = profile.current.author;
    const progress = document.createElement("div");
    progress.textContent = profile.current.progress + "% read";
    info.appendChild(title);
    info.appendChild(meta);
    info.appendChild(progress);
    block.appendChild(cover);
    block.appendChild(info);
}

function loadReadingProgress() {
    const { current, goal } = profile.readingGoal;
    const fill = document.getElementById("progressFill");
    fill.style.width = Math.min(100, Math.round((current / goal) * 100)) + "%";
    document.getElementById("goalCount").textContent = `${current} / ${goal}`;
}

function setupAvatarUpload() {
    document.getElementById("avatarClickable").addEventListener("click", () => {
        document.getElementById("avatarInput").click();
    });
    document.getElementById("avatarInput").addEventListener("change", e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            profile.avatar = reader.result;
            document.getElementById("profileImg").src = reader.result;
        };
        reader.readAsDataURL(file);
    });
}

function setupProfileEditing() {
    const modal = document.getElementById("editModal");
    const overlay = document.getElementById("editModalOverlay");
    document.getElementById("openEditBtn").addEventListener("click", () => {
        document.getElementById("editUsername").value = profile.username;
        document.getElementById("editRealname").value = profile.realname;
        document.getElementById("editBio").value = profile.bio;
        modal.classList.remove("hidden");
        overlay.classList.remove("hidden");
    });
    document.getElementById("closeEditModal").addEventListener("click", () => {
        modal.classList.add("hidden");
        overlay.classList.add("hidden");
    });
    document.getElementById("saveEditModal").addEventListener("click", () => {
        profile.username = document.getElementById("editUsername").value;
        profile.realname = document.getElementById("editRealname").value;
        profile.bio = document.getElementById("editBio").value;
        modal.classList.add("hidden");
        overlay.classList.add("hidden");
        loadProfile();
    });
}

function setupGenreModal() {
    const modal = document.getElementById("prefModal");
    const overlay = document.getElementById("prefModalOverlay");
    document.getElementById("openPrefBtn").addEventListener("click", openGenreEditor);
    document.getElementById("closePrefModal").addEventListener("click", () => {
        modal.classList.add("hidden");
        overlay.classList.add("hidden");
    });
    document.getElementById("savePrefModal").addEventListener("click", saveGenres);
}

function openGenreEditor() {
    const container = document.getElementById("editGenres");
    container.innerHTML = "";
    ALL_GENRES.forEach(g => {
        const pill = document.createElement("div");
        pill.className = "pill editable";
        pill.textContent = g;
        if (profile.preferences.genres.includes(g)) {
            pill.classList.add("selected");
        }
        pill.addEventListener("click", () => {
            pill.classList.toggle("selected");
        });
        container.appendChild(pill);
    });
    document.getElementById("prefModal").classList.remove("hidden");
    document.getElementById("prefModalOverlay").classList.remove("hidden");
}

function saveGenres() {
    profile.preferences.genres = Array.from(
        document.querySelectorAll("#editGenres .pill.selected")
    ).map(p => p.textContent);
    document.getElementById("prefModal").classList.add("hidden");
    document.getElementById("prefModalOverlay").classList.add("hidden");
    loadGenres();
}
