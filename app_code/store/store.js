// shelves – store powered by data/books.json (optimized)
console.log("store.js loaded (optimized)");

document.addEventListener("DOMContentLoaded", () => {
    // === DOM REFS ===
    const productGrid   = document.getElementById("productGrid");
    const resultsInfo   = document.getElementById("resultsInfo");

    const globalSearch  = document.getElementById("globalSearch");
    const genreChecks   = Array.from(document.querySelectorAll("input[name='genre']"));
    const formatChecks  = Array.from(document.querySelectorAll("input[name='format']"));
    const priceMinInput = document.getElementById("priceMin");
    const priceMaxInput = document.getElementById("priceMax");
    const sortSelect    = document.getElementById("sortSelect");
    const clearFilters  = document.getElementById("clearFiltersBtn");

    const cartEmptyText = document.getElementById("cartEmptyText");
    const cartItemsEl   = document.getElementById("cartItems");
    const cartItemCount = document.getElementById("cartItemCount");
    const cartTotalEl   = document.getElementById("cartTotal");

    const checkoutBtn         = document.getElementById("checkoutBtn");
    const modalOverlay        = document.getElementById("modalOverlay");
    const checkoutModal       = document.getElementById("checkoutModal");
    const checkoutList        = document.getElementById("checkoutList");
    const checkoutTotal       = document.getElementById("checkoutTotal");
    const cancelCheckoutBtn   = document.getElementById("cancelCheckoutBtn");
    const confirmCheckoutBtn  = document.getElementById("confirmCheckoutBtn");
    const checkoutSuccessMsg  = document.getElementById("checkoutSuccessMsg");

    const inputName    = document.getElementById("inputName");
    const inputEmail   = document.getElementById("inputEmail");
    const inputAddress = document.getElementById("inputAddress");

    // === STATE ===
    let allBooks = [];
    let filteredBooks = [];
    let cart = [];
    let ownedIds = [];

    const CART_KEY  = "shelves_store_cart";
    const OWNED_KEY = "ownedBooks";

    // === HELPERS ===

    function debounce(fn, delay = 150) {
        let t;
        return (...args) => {
            clearTimeout(t);
            t = setTimeout(() => fn(...args), delay);
        };
    }

    function coverUrl(book) {
        if (!book.cover) return "";
        const c = book.cover;
        if (c.startsWith("http") || c.startsWith("/")) return c;
        return "../" + c;
    }

    function escapeHtml(str) {
        return String(str || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function loadCart() {
        try {
            const raw = localStorage.getItem(CART_KEY);
            cart = raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.error("Failed to load cart", e);
            cart = [];
        }
    }

    function saveCart() {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }

    function loadOwnedBooks() {
        try {
            const raw = localStorage.getItem(OWNED_KEY);
            ownedIds = raw ? JSON.parse(raw) : [];
        } catch {
            ownedIds = [];
        }
    }

    function saveOwnedBooks() {
        localStorage.setItem(OWNED_KEY, JSON.stringify(ownedIds));
    }

    function inCart(id) {
        const item = cart.find(c => c.id === id);
        return item ? item.qty : 0;
    }

    function cartTotal() {
        return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    }

    async function loadBooks() {
        try {
            const res = await fetch("../data/books.json");
            const json = await res.json();
            allBooks = Array.isArray(json.books) ? json.books : [];
            applyFilters();
        } catch (err) {
            console.error("Could not load books.json", err);
            if (productGrid) {
                productGrid.innerHTML = `<p class="store-error">Could not load books.</p>`;
            }
        }
    }

    // === FILTERING & SORTING ===

    function applyFilters() {
        let list = [...allBooks];

        // search
        const q = (globalSearch?.value || "").trim().toLowerCase();
        if (q) {
            list = list.filter(b => {
                const haystack = [
                    b.title,
                    b.author,
                    b.genre,
                    b.format,
                    (b.tags || []).join(" ")
                ].join(" ").toLowerCase();
                return haystack.includes(q);
            });
        }

        // genre
        const selectedGenres = genreChecks.filter(cb => cb.checked).map(cb => cb.value);
        if (selectedGenres.length) {
            list = list.filter(b => selectedGenres.includes(b.genre));
        }

        // format
        const selectedFormats = formatChecks.filter(cb => cb.checked).map(cb => cb.value);
        if (selectedFormats.length) {
            list = list.filter(b => selectedFormats.includes(b.format));
        }

        // price
        const min = parseFloat((priceMinInput?.value || "").replace(",", "."));
        const max = parseFloat((priceMaxInput?.value || "").replace(",", "."));
        if (!Number.isNaN(min)) list = list.filter(b => Number(b.price) >= min);
        if (!Number.isNaN(max)) list = list.filter(b => Number(b.price) <= max);

        // sort
        const sort = sortSelect?.value || "featured";
        list.sort((a, b) => {
            if (sort === "price-asc") return a.price - b.price;
            if (sort === "price-desc") return b.price - a.price;
            if (sort === "title-asc") return a.title.localeCompare(b.title, "en");
            if (sort === "featured") {
                // featured first, Rest danach
                const af = a.featured ? 1 : 0;
                const bf = b.featured ? 1 : 0;
                if (af !== bf) return bf - af;
                return a.title.localeCompare(b.title, "en");
            }
            return 0;
        });

        filteredBooks = list;
        renderProducts();
        updateResultsInfo();
    }

    function updateResultsInfo() {
        if (!resultsInfo) return;
        if (!allBooks.length) {
            resultsInfo.textContent = "";
            return;
        }
        resultsInfo.textContent = `${filteredBooks.length} of ${allBooks.length} books`;
    }

    // === RENDER PRODUCTS ===

    function renderProducts() {
        if (!productGrid) return;

        if (!filteredBooks.length) {
            productGrid.innerHTML = `<p class="no-results">No books match these filters.</p>`;
            return;
        }

        productGrid.innerHTML = filteredBooks.map(b => {
            const qty   = inCart(b.id);
            const owned = ownedIds.includes(b.id);

            return `
                <article class="product-card" data-id="${b.id}">
                    ${owned ? `<span class="owned-badge">Owned</span>` : ""}
                    <div class="product-cover" style="background-image:url('${coverUrl(b)}')"></div>
                    <div class="product-info">
                        <h4>${escapeHtml(b.title)}</h4>
                        <p class="product-author">${escapeHtml(b.author)}</p>
                        <p class="product-meta">
                            <span>${escapeHtml(b.genre)}</span>
                            <span>${escapeHtml(b.format)}</span>
                        </p>
                    </div>
                    <div class="product-footer">
                        <span class="product-price">€${Number(b.price).toFixed(2)}</span>
                        ${
                owned
                    ? `<button type="button" class="add-cart-btn" disabled>Already owned</button>`
                    : `<button type="button"
                                       class="add-cart-btn"
                                       data-id="${b.id}">
                                    ${qty ? `In cart (${qty})` : "Add to cart"}
                               </button>`
            }
                    </div>
                </article>
            `;
        }).join("");
    }

    // === CART ===

    function renderCart() {
        if (!cartItemsEl || !cartEmptyText || !cartItemCount || !cartTotalEl) return;

        if (!cart.length) {
            cartItemsEl.innerHTML = "";
            cartEmptyText.style.display = "block";
        } else {
            cartEmptyText.style.display = "none";
            cartItemsEl.innerHTML = cart.map(item => `
                <li class="cart-item">
                    <div class="cart-item-info">
                        <div class="cart-item-title">${escapeHtml(item.title)}</div>
                        <div class="cart-item-meta">
                            €${item.price.toFixed(2)} · x${item.qty}
                        </div>
                    </div>
                    <div class="cart-item-controls">
                        <div class="cart-qty-row">
                            <button type="button" class="qty-btn cart-minus" data-id="${item.id}">–</button>
                            <span>${item.qty}</span>
                            <button type="button" class="qty-btn cart-plus" data-id="${item.id}">+</button>
                        </div>
                    </div>
                </li>
            `).join("");
        }

        const total = cartTotal();
        cartItemCount.textContent = String(cart.reduce((sum, i) => sum + i.qty, 0));
        cartTotalEl.textContent = `€${total.toFixed(2)}`;
    }

    function addToCart(book) {
        const existing = cart.find(c => c.id === book.id);
        if (existing) existing.qty += 1;
        else cart.push({ id: book.id, title: book.title, price: Number(book.price), qty: 1 });
        saveCart();
        renderCart();
        renderProducts(); // damit Button-Text & Menge updaten
    }

    function changeCartQty(id, delta) {
        const idx = cart.findIndex(c => c.id === id);
        if (idx === -1) return;
        cart[idx].qty += delta;
        if (cart[idx].qty <= 0) cart.splice(idx, 1);
        saveCart();
        renderCart();
        renderProducts();
    }

    // === CHECKOUT / MODAL ===

    function openCheckout() {
        if (!cart.length) return;

        modalOverlay.classList.remove("hidden");
        checkoutModal.classList.remove("hidden");
        checkoutModal.classList.add("visible");
        checkoutSuccessMsg.classList.add("hidden");

        checkoutList.innerHTML = cart.map(item => `
            <li>
                <span>${escapeHtml(item.title)} × ${item.qty}</span>
                <span>€${(item.price * item.qty).toFixed(2)}</span>
            </li>
        `).join("");

        checkoutTotal.textContent = `€${cartTotal().toFixed(2)}`;
    }

    function closeCheckout() {
        checkoutModal.classList.remove("visible");
        modalOverlay.classList.add("hidden");
        checkoutModal.classList.add("hidden");
    }

    function handleConfirmCheckout() {
        if (!inputName.value.trim() || !inputEmail.value.trim() || !inputAddress.value.trim()) {
            alert("Please fill in name, email and address for this demo checkout.");
            return;
        }

        // Mark all cart items as owned
        const ownedSet = new Set(ownedIds);
        cart.forEach(item => ownedSet.add(item.id));
        ownedIds = Array.from(ownedSet);
        saveOwnedBooks();

        checkoutSuccessMsg.classList.remove("hidden");

        // Clear cart & refresh UI
        cart = [];
        saveCart();
        renderCart();
        applyFilters(); // damit „Owned“ im Store sichtbar wird
    }

    // === EVENTS: FILTERS ===

    if (globalSearch) globalSearch.addEventListener("input", debounce(applyFilters, 150));
    genreChecks.forEach(cb => cb.addEventListener("change", applyFilters));
    formatChecks.forEach(cb => cb.addEventListener("change", applyFilters));
    if (priceMinInput) priceMinInput.addEventListener("input", applyFilters);
    if (priceMaxInput) priceMaxInput.addEventListener("input", applyFilters);
    if (sortSelect)    sortSelect.addEventListener("change", applyFilters);

    if (clearFilters) {
        clearFilters.addEventListener("click", () => {
            genreChecks.forEach(cb => cb.checked = false);
            formatChecks.forEach(cb => cb.checked = false);
            if (priceMinInput) priceMinInput.value = "";
            if (priceMaxInput) priceMaxInput.value = "";
            if (sortSelect) sortSelect.value = "featured";
            if (globalSearch) globalSearch.value = "";
            applyFilters();
        });
    }

    // === EVENTS: PRODUCT GRID ===

    if (productGrid) {
        productGrid.addEventListener("click", ev => {
            const addBtn = ev.target.closest(".add-cart-btn");
            if (addBtn && !addBtn.disabled) {
                const id = addBtn.dataset.id;
                const book = allBooks.find(b => b.id === id);
                if (book) addToCart(book);
                return;
            }

            // Klick im Footer nicht als "open detail" werten
            if (ev.target.closest(".product-footer")) return;

            const card = ev.target.closest(".product-card");
            if (card) {
                const id = card.dataset.id;
                if (id) {
                    window.location.href = `../my_books/book_detail.html?id=${encodeURIComponent(id)}`;
                }
            }
        });
    }

    // === EVENTS: CART ===

    if (cartItemsEl) {
        cartItemsEl.addEventListener("click", ev => {
            const minus = ev.target.closest(".cart-minus");
            const plus  = ev.target.closest(".cart-plus");
            if (minus) changeCartQty(minus.dataset.id, -1);
            if (plus)  changeCartQty(plus.dataset.id, +1);
        });
    }

    // === EVENTS: CHECKOUT ===

    if (checkoutBtn)        checkoutBtn.addEventListener("click", openCheckout);
    if (cancelCheckoutBtn)  cancelCheckoutBtn.addEventListener("click", closeCheckout);
    if (confirmCheckoutBtn) confirmCheckoutBtn.addEventListener("click", handleConfirmCheckout);

    if (modalOverlay) {
        modalOverlay.classList.add("hidden");
        modalOverlay.addEventListener("click", ev => {
            if (ev.target === modalOverlay) closeCheckout();
        });
    }

    document.addEventListener("keydown", ev => {
        if (ev.key === "Escape") closeCheckout();
    });

    // === INIT ===
    loadCart();
    loadOwnedBooks();
    renderCart();
    loadBooks();
});
