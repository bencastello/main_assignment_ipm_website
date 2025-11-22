console.log("search.js loaded");

let SEARCH_DATA = null;

async function loadSearchData() {
    if (SEARCH_DATA) return SEARCH_DATA;

    try {
        const res = await fetch("search/search_data.json");   // <-- FIXED PATH
        SEARCH_DATA = await res.json();
        console.log("Loaded search_data.json:", SEARCH_DATA);
    } catch (err) {
        console.error("Could not load search data", err);
        SEARCH_DATA = { books: [], curators: [], users: [], store: [] };
    }
    return SEARCH_DATA;
}

const overlay = document.getElementById("globalSearchOverlay");
const input = document.getElementById("globalSearchInput");
const results = document.getElementById("globalSearchResults");
const trigger = document.getElementById("searchTrigger");

if (!overlay || !input || !results) {
    console.warn("Search elements missing.");
} else {

    function openSearch() {
        overlay.classList.remove("hidden");
        input.value = "";
        results.innerHTML = "";
        setTimeout(() => input.focus(), 50);
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

    input.addEventListener("input", async (e) => {
        const q = e.target.value.trim().toLowerCase();
        if (!q) {
            results.innerHTML = "";
            return;
        }

        const data = await loadSearchData();
        const out = [];

        // ---- BOOKS ----
        (data.books || [])
            .filter(b =>
                b.title.toLowerCase().includes(q) ||
                (b.author || "").toLowerCase().includes(q)
            )
            .forEach(b => {
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

        // ---- CURATORS ----
        (data.curators || [])
            .filter(c => c.name.toLowerCase().includes(q))
            .forEach(c => {
                out.push(`
                    <div class="result-item"
                        onclick="window.location.href='curators/curators.html'">
                        <div class="result-meta">
                            <h4>${c.name}</h4>
                            <p>${c.bio || ""}</p>
                        </div>
                    </div>
                `);
            });

        // ---- USERS ----
        (data.users || [])
            .filter(u => u.name.toLowerCase().includes(q))
            .forEach(u => {
                out.push(`
                    <div class="result-item"
                        onclick="window.location.href='friends/shelves_friends.html'">
                        <div class="result-meta">
                            <h4>${u.name}</h4>
                            <p>Friend on shelves</p>
                        </div>
                    </div>
                `);
            });

        // ---- STORE ----
        (data.store || [])
            .filter(s => s.title.toLowerCase().includes(q))
            .forEach(s => {
                out.push(`
                    <div class="result-item"
                        onclick="window.location.href='store/store.html'">
                        <div class="result-cover" style="background-image:url('${s.cover}')"></div>
                        <div class="result-meta">
                            <h4>${s.title}</h4>
                            <p>${s.price} €</p>
                        </div>
                    </div>
                `);
            });

        results.innerHTML = out.length ? out.join("") : "<div class='no-results'>No results.</div>";
    });
}
