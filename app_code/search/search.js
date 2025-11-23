console.log("search.js loaded");

async function loadAllData() {
    const [booksRes, usersRes, friendsRes] = await Promise.all([
        fetch("data/search_index.json"),
        fetch("data/books.json"),
        fetch("data/users.json"),
        fetch("data/friends.json")
    ]);

    const booksData = await booksRes.json();
    const usersData = await usersRes.json();
    const friendsData = await friendsRes.json();

    return {
        books: booksData.books || [],
        users: usersData.users || [],
        friends: friendsData.friends || []
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
    input.value = "";
    results.innerHTML = "";
}

window.openGlobalSearch = openSearch;
if (trigger) trigger.addEventListener("click", openSearch);

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

// ---------- live search ----------
input.addEventListener("input", async (e) => {
    const q = e.target.value.trim().toLowerCase();
    if (!q) {
        results.innerHTML = "";
        return;
    }

    if (!CACHE) CACHE = await loadAllData();
    const { books, users, friends } = CACHE;

    const out = [];

    // BOOKS
    const foundBooks = books.filter(b =>
        b.title.toLowerCase().includes(q) ||
        (b.author || "").toLowerCase().includes(q)
    );
    if (foundBooks.length > 0) {
        out.push(`<div class="result-category">Books</div>`);
        foundBooks.forEach(b => {
            out.push(`
                <div class="result-item"
                     onclick="window.location.href='my_books/book_detail.html?id=${b.id}'">
                    <div class="result-cover" style="background-image:url('${b.cover}')"></div>
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
    if (foundUsers.length > 0) {
        out.push(`<div class="result-category">Users</div>`);
        foundUsers.forEach(u => {
            out.push(`
                <div class="result-item"
                     onclick="window.location.href='profile/profile.html?id=${u.id}'">
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
    if (foundFriends.length > 0) {
        out.push(`<div class="result-category">Friends</div>`);
        foundFriends.forEach(f => {
            out.push(`
                <div class="result-item"
                     onclick="window.location.href='friends/friend_profile.html?id=${f.id}'">
                    <div class="result-meta">
                        <h4>${f.name}</h4>
                        <p>friend</p>
                    </div>
                </div>
            `);
        });
    }

    if (out.length === 0) {
        results.innerHTML = `<div class="no-results">No results found.</div>`;
    } else {
        results.innerHTML = out.join("");
    }
});
