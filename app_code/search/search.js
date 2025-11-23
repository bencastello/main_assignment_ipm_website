console.log("search.js loaded (universal paths fix)");

// Determine correct root path dynamically
function root(path) {
    // if script runs from homepage.html:
    //   page URL ends with ".../homepage.html" → root = "./"
    // if script runs from my_books/my_books.html:
    //   page URL contains "/my_books/" → root = "../"
    if (window.location.pathname.includes("/my_books/")) return "../" + path;
    if (window.location.pathname.includes("/store/")) return "../" + path;
    if (window.location.pathname.includes("/friends/")) return "../" + path;
    if (window.location.pathname.includes("/profile/")) return "../" + path;
    return path; // homepage
}

async function loadAllData() {
    const [booksRes, usersRes, friendsRes] = await Promise.all([
        fetch(root("data/search_index.json")),
        fetch(root("data/books.json")),
        fetch(root("data/users.json")),
        fetch(root("data/friends.json"))
    ]);

    return {
        books: (await booksRes.json()).books || [],
        users: (await usersRes.json()).users || [],
        friends: (await friendsRes.json()).friends || []
    };
}

// ---------- DOM refs ----------
const overlay  = document.getElementById("globalSearchOverlay");
const input    = document.getElementById("globalSearchInput");
const results  = document.getElementById("globalSearchResults");
const trigger  = document.getElementById("searchTrigger");

let CACHE = null;

// ---------- overlay controls ----------
function openSearch() {
    overlay.classList.remove("hidden");
    input.value = "";
    results.innerHTML = "";
    setTimeout(() => input.focus(), 20);
}

function closeSearch() {
    overlay.classList.add("hidden");
    results.innerHTML = "";
    input.value = "";
}

if (trigger) trigger.addEventListener("click", openSearch);
window.openGlobalSearch = openSearch;

document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openSearch();
    }
    if (e.key === "Escape") closeSearch();
});

overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeSearch();
});

// ---------- RESULT PATH HELPERS ----------
function linkToBook(id) {
    if (window.location.pathname.includes("/my_books/"))
        return `book_detail.html?id=${id}`;
    return `my_books/book_detail.html?id=${id}`;
}

function linkToProfile(id) {
    if (window.location.pathname.includes("/profile/"))
        return `profile.html?id=${id}`;
    return `profile/profile.html?id=${id}`;
}

function linkToFriend(id) {
    if (window.location.pathname.includes("/friends/"))
        return `friend_profile.html?id=${id}`;
    return `friends/friend_profile.html?id=${id}`;
}

// ---------- LIVE SEARCH ----------
input.addEventListener("input", async (e) => {
    const q = e.target.value.trim().toLowerCase();
    if (!q) return (results.innerHTML = "");

    if (!CACHE) CACHE = await loadAllData();
    const { books, users, friends } = CACHE;

    const out = [];

    // BOOKS
    const foundBooks = books.filter(b =>
        b.title.toLowerCase().includes(q) ||
        (b.author || "").toLowerCase().includes(q)
    );
    if (foundBooks.length) {
        out.push(`<div class="result-category">Books</div>`);
        foundBooks.forEach(b => {
            out.push(`
                <div class="result-item" onclick="window.location.href='${linkToBook(b.id)}'">
                    <div class="result-cover" style="background-image:url('${root(b.cover)}')"></div>
                    <div class="result-meta">
                        <h4>${b.title}</h4>
                        <p>${b.author}</p>
                    </div>
                </div>
            `);
        });
    }

    // USERS
    const foundUsers = users.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.realname.toLowerCase().includes(q)
    );
    if (foundUsers.length) {
        out.push(`<div class="result-category">Users</div>`);
        foundUsers.forEach(u => {
            out.push(`
                <div class="result-item" onclick="window.location.href='${linkToProfile(u.id)}'">
                    <div class="result-meta">
                        <h4>${u.realname}</h4>
                        <p>${u.name}</p>
                    </div>
                </div>
            `);
        });
    }

    // FRIENDS
    const foundFriends = friends.filter(f =>
        f.name.toLowerCase().includes(q)
    );
    if (foundFriends.length) {
        out.push(`<div class="result-category">Friends</div>`);
        foundFriends.forEach(f => {
            out.push(`
                <div class="result-item" onclick="window.location.href='${linkToFriend(f.id)}'">
                    <div class="result-meta">
                        <h4>${f.name}</h4>
                        <p>friend</p>
                    </div>
                </div>
            `);
        });
    }

    results.innerHTML = out.length
        ? out.join("")
        : `<div class="no-results">No results found.</div>`;
});
