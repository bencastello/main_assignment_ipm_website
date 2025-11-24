console.log("store.js loaded (format filter removed + pagination)");

document.addEventListener("DOMContentLoaded", () => {
    const productGrid = document.getElementById("productGrid");
    const resultsInfo = document.getElementById("resultsInfo");
    const globalSearch = document.getElementById("globalSearch");
    const genreChecks = Array.from(document.querySelectorAll("input[name='genre']"));
    const priceMinInput = document.getElementById("priceMin");
    const priceMaxInput = document.getElementById("priceMax");
    const sortSelect = document.getElementById("sortSelect");
    const clearFilters = document.getElementById("clearFiltersBtn");
    const cartEmptyText = document.getElementById("cartEmptyText");
    const cartItemsEl = document.getElementById("cartItems");
    const cartItemCount = document.getElementById("cartItemCount");
    const cartTotalEl = document.getElementById("cartTotal");
    const checkoutBtn = document.getElementById("checkoutBtn");
    const modalOverlay = document.getElementById("modalOverlay");
    const checkoutModal = document.getElementById("checkoutModal");
    const checkoutList = document.getElementById("checkoutList");
    const checkoutTotal = document.getElementById("checkoutTotal");
    const cancelCheckoutBtn = document.getElementById("cancelCheckoutBtn");
    const confirmCheckoutBtn = document.getElementById("confirmCheckoutBtn");
    const checkoutSuccessMsg = document.getElementById("checkoutSuccessMsg");
    const inputName = document.getElementById("inputName");
    const inputEmail = document.getElementById("inputEmail");
    const inputAddress = document.getElementById("inputAddress");

    let allBooks = [];
    let filteredBooks = [];
    let currentPage = 1;
    const ITEMS_PER_PAGE = 10;
    let cart = [];
    let ownedIds = [];
    const CART_KEY = "shelves_store_cart";
    const OWNED_KEY = "ownedBooks";

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
        } catch {
            cart = [];
        }
    }

    function saveCart() {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }

    function loadOwnedBooks() {
        try {
            ownedIds = JSON.parse(localStorage.getItem(OWNED_KEY)) || [];
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
        } catch {
            productGrid.innerHTML = `<p class="store-error">Could not load books.</p>`;
        }
    }

    function applyFilters() {
        let list = [...allBooks];
        const q = (globalSearch?.value || "").trim().toLowerCase();
        if (q) {
            list = list.filter(b => {
                const hay = [
                    b.title,
                    b.author,
                    b.genre,
                    (b.tags || []).join(" ")
                ].join(" ").toLowerCase();
                return hay.includes(q);
            });
        }

        const selectedGenres = genreChecks.filter(cb => cb.checked).map(cb => cb.value);
        if (selectedGenres.length) list = list.filter(b => selectedGenres.includes(b.genre));

        const min = parseFloat(priceMinInput.value || "");
        const max = parseFloat(priceMaxInput.value || "");
        if (!isNaN(min)) list = list.filter(b => Number(b.price) >= min);
        if (!isNaN(max)) list = list.filter(b => Number(b.price) <= max);

        const sort = sortSelect.value;
        list.sort((a, b) => {
            if (sort === "price-asc") return a.price - b.price;
            if (sort === "price-desc") return b.price - a.price;
            if (sort === "title-asc") return a.title.localeCompare(b.title);
            return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        });

        filteredBooks = list;
        currentPage = 1;
        renderProducts();
        updateResultsInfo();
    }

    function updateResultsInfo() {
        resultsInfo.textContent = `${filteredBooks.length} of ${allBooks.length} books`;
    }

    function renderProducts() {
        if (!filteredBooks.length) {
            productGrid.innerHTML = `<p class="no-results">No books match these filters.</p>`;
            renderPagination();
            return;
        }

        const totalPages = Math.ceil(filteredBooks.length / ITEMS_PER_PAGE) || 1;
        if (currentPage > totalPages) currentPage = totalPages;

        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        const pageBooks = filteredBooks.slice(start, end);

        productGrid.innerHTML = pageBooks.map(b => {
            const qty = inCart(b.id);
            const owned = ownedIds.includes(b.id);
            return `
            <article class="product-card" data-id="${b.id}">
                ${owned ? `<span class="owned-badge">Owned</span>` : ""}
                <div class="product-cover" style="background-image:url('${coverUrl(b)}')"></div>
                <div class="product-info">
                    <h4>${escapeHtml(b.title)}</h4>
                    <p class="product-author">${escapeHtml(b.author)}</p>
                    <p class="product-meta"><span>${escapeHtml(b.genre)}</span></p>
                </div>
                <div class="product-footer">
                    <span class="product-price">€${Number(b.price).toFixed(2)}</span>
                    ${
                owned
                    ? `<button class="add-cart-btn" disabled>Already owned</button>`
                    : `<button class="add-cart-btn" data-id="${b.id}">${qty ? `In cart (${qty})` : "Add to cart"}</button>`
            }
                </div>
            </article>`;
        }).join("");

        renderPagination();
    }

    function renderPagination() {
        const totalPages = Math.ceil(filteredBooks.length / ITEMS_PER_PAGE);
        const containerId = "paginationControls";
        let container = document.getElementById(containerId);

        if (!container) {
            container = document.createElement("div");
            container.id = containerId;
            container.className = "pagination";
            productGrid.insertAdjacentElement("afterend", container);
        }

        if (totalPages <= 1) {
            container.innerHTML = "";
            return;
        }

        let html = "";
        for (let i = 1; i <= totalPages; i++) {
            html += `<button class="page-btn ${i === currentPage ? "active" : ""}" data-page="${i}">${i}</button>`;
        }
        container.innerHTML = html;

        container.querySelectorAll(".page-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const page = Number(btn.dataset.page);
                if (!Number.isNaN(page)) {
                    currentPage = page;
                    renderProducts();
                }
            });
        });
    }

    function renderCart() {
        if (!cart.length) {
            cartItemsEl.innerHTML = "";
            cartEmptyText.style.display = "block";
        } else {
            cartEmptyText.style.display = "none";
            cartItemsEl.innerHTML = cart.map(item => `
                <li class="cart-item">
                    <div class="cart-item-info">
                        <div class="cart-item-title">${escapeHtml(item.title)}</div>
                        <div class="cart-item-meta">€${item.price.toFixed(2)} · x${item.qty}</div>
                    </div>
                    <div class="cart-item-controls">
                        <div class="cart-qty-row">
                            <button class="qty-btn cart-minus" data-id="${item.id}">–</button>
                            <span>${item.qty}</span>
                            <button class="qty-btn cart-plus" data-id="${item.id}">+</button>
                        </div>
                    </div>
                </li>
            `).join("");
        }

        cartItemCount.textContent = String(cart.reduce((sum, i) => sum + i.qty, 0));
        cartTotalEl.textContent = `€${cartTotal().toFixed(2)}`;
    }

    function addToCart(book) {
        const existing = cart.find(c => c.id === book.id);
        if (existing) existing.qty++;
        else cart.push({ id: book.id, title: book.title, price: Number(book.price), qty: 1 });

        saveCart();
        renderCart();
        renderProducts();
    }

    function changeCartQty(id, delta) {
        const item = cart.find(c => c.id === id);
        if (!item) return;

        item.qty += delta;
        if (item.qty <= 0) cart = cart.filter(c => c.id !== id);

        saveCart();
        renderCart();
        renderProducts();
    }

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
            alert("Please fill name, email and address.");
            return;
        }

        const set = new Set(ownedIds);
        cart.forEach(item => set.add(item.id));
        ownedIds = [...set];
        saveOwnedBooks();

        checkoutSuccessMsg.classList.remove("hidden");

        cart = [];
        saveCart();
        renderCart();
        applyFilters();
    }

    if (globalSearch) globalSearch.addEventListener("input", debounce(applyFilters, 150));
    genreChecks.forEach(cb => cb.addEventListener("change", applyFilters));
    if (priceMinInput) priceMinInput.addEventListener("input", applyFilters);
    if (priceMaxInput) priceMaxInput.addEventListener("input", applyFilters);
    if (sortSelect) sortSelect.addEventListener("change", applyFilters);

    if (clearFilters) {
        clearFilters.addEventListener("click", () => {
            genreChecks.forEach(cb => cb.checked = false);
            if (priceMinInput) priceMinInput.value = "";
            if (priceMaxInput) priceMaxInput.value = "";
            sortSelect.value = "featured";
            if (globalSearch) globalSearch.value = "";
            applyFilters();
        });
    }

    productGrid.addEventListener("click", ev => {
        const addBtn = ev.target.closest(".add-cart-btn");
        if (addBtn && !addBtn.disabled) {
            const book = allBooks.find(b => b.id === addBtn.dataset.id);
            if (book) addToCart(book);
            return;
        }

        if (!ev.target.closest(".product-footer")) {
            const card = ev.target.closest(".product-card");
            if (card) window.location.href = `../my_books/book_detail.html?id=${card.dataset.id}`;
        }
    });

    cartItemsEl.addEventListener("click", ev => {
        if (ev.target.classList.contains("cart-minus")) changeCartQty(ev.target.dataset.id, -1);
        if (ev.target.classList.contains("cart-plus")) changeCartQty(ev.target.dataset.id, +1);
    });

    checkoutBtn.addEventListener("click", openCheckout);
    cancelCheckoutBtn.addEventListener("click", closeCheckout);
    confirmCheckoutBtn.addEventListener("click", handleConfirmCheckout);

    modalOverlay.addEventListener("click", ev => {
        if (ev.target === modalOverlay) closeCheckout();
    });

    document.addEventListener("keydown", ev => {
        if (ev.key === "Escape") closeCheckout();
    });

    loadCart();
    loadOwnedBooks();
    renderCart();
    loadBooks();
});
