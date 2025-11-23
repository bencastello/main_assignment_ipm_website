// shelves – store powered by data/books.json
console.log("store.js loaded");

document.addEventListener("DOMContentLoaded", () => {
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

    let allBooks = [];
    let filteredBooks = [];
    let cart = [];

    const CART_KEY = "shelves_store_cart";

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

    function applyFilters() {
        let list = [...allBooks];

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

        const selectedGenres = genreChecks.filter(cb => cb.checked).map(cb => cb.value);
        if (selectedGenres.length) {
            list = list.filter(b => selectedGenres.includes(b.genre));
        }

        const selectedFormats = formatChecks.filter(cb => cb.checked).map(cb => cb.value);
        if (selectedFormats.length) {
            list = list.filter(b => selectedFormats.includes(b.format));
        }

        const min = parseFloat(priceMinInput.value.replace(",", "."));
        const max = parseFloat(priceMaxInput.value.replace(",", "."));
        if (!Number.isNaN(min)) list = list.filter(b => Number(b.price) >= min);
        if (!Number.isNaN(max)) list = list.filter(b => Number(b.price) <= max);

        const sort = sortSelect.value;
        list.sort((a, b) => {
            if (sort === "price-asc") return a.price - b.price;
            if (sort === "price-desc") return b.price - a.price;
            if (sort === "title-asc") return a.title.localeCompare(b.title, "en");
            if (sort === "featured") {
                if (a.featured && !b.featured) return -1;
                if (!a.featured && b.featured) return 1;
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

    function renderProducts() {
        if (!productGrid) return;

        if (!filteredBooks.length) {
            productGrid.innerHTML = `<p class="no-results">No books match these filters.</p>`;
            return;
        }

        productGrid.innerHTML = filteredBooks.map(b => {
            const qty = inCart(b.id);
            return `
                <article class="product-card" data-id="${b.id}">
                    <div class="product-cover" style="background-image:url('${coverUrl(b)}')"></div>
                    <div class="product-info">
                        <h4>${escapeHtml(b.title)}</h4>
                        <p class="product-author">${escapeHtml(b.author)}</p>
                        <p class="product-meta">${escapeHtml(b.genre)} · ${escapeHtml(b.format)}</p>
                    </div>
                    <div class="product-footer">
                        <span class="product-price">€${Number(b.price).toFixed(2)}</span>
                        <button type="button"
                                class="add-cart-btn"
                                data-id="${b.id}">
                            ${qty ? `In cart (${qty})` : "Add to cart"}
                        </button>
                    </div>
                </article>
            `;
        }).join("");
    }

    function renderCart() {
        if (!cartItemsEl || !cartEmptyText || !cartItemCount || !cartTotalEl) return;

        if (!cart.length) {
            cartItemsEl.innerHTML = "";
            cartEmptyText.style.display = "block";
        } else {
            cartEmptyText.style.display = "none";
            cartItemsEl.innerHTML = cart.map(item => `
                <li class="cart-item">
                    <div>
                        <div class="cart-item-title">${escapeHtml(item.title)}</div>
                        <div class="cart-item-meta">
                            €${item.price.toFixed(2)} · x${item.qty}
                        </div>
                    </div>
                    <div class="cart-item-actions">
                        <button type="button" class="cart-minus" data-id="${item.id}">–</button>
                        <button type="button" class="cart-plus" data-id="${item.id}">+</button>
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
        renderProducts();
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

    function openCheckout() {
        if (!cart.length) return;
        modalOverlay.classList.remove("hidden");
        checkoutModal.classList.remove("hidden");
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
        modalOverlay.classList.add("hidden");
        checkoutModal.classList.add("hidden");
    }

    function handleConfirmCheckout() {
        if (!inputName.value.trim() || !inputEmail.value.trim() || !inputAddress.value.trim()) {
            alert("Please fill in name, email and address for this demo checkout.");
            return;
        }
        checkoutSuccessMsg.classList.remove("hidden");
        cart = [];
        saveCart();
        renderCart();
        renderProducts();
    }

    // Events: filters
    if (globalSearch) globalSearch.addEventListener("input", applyFilters);
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

    // Events: product grid
    if (productGrid) {
        productGrid.addEventListener("click", ev => {
            const btn = ev.target.closest(".add-cart-btn");
            if (btn) {
                const id = btn.dataset.id;
                const book = allBooks.find(b => b.id === id);
                if (book) addToCart(book);
                return;
            }

            const card = ev.target.closest(".product-card");
            if (card && !ev.target.closest(".add-cart-btn")) {
                const id = card.dataset.id;
                if (id) {
                    window.location.href = `../my_books/book_detail.html?id=${encodeURIComponent(id)}`;
                }
            }
        });
    }

    // Events: cart
    if (cartItemsEl) {
        cartItemsEl.addEventListener("click", ev => {
            const minus = ev.target.closest(".cart-minus");
            const plus  = ev.target.closest(".cart-plus");
            if (minus) changeCartQty(minus.dataset.id, -1);
            if (plus)  changeCartQty(plus.dataset.id, +1);
        });
    }

    // Events: checkout
    if (checkoutBtn)        checkoutBtn.addEventListener("click", openCheckout);
    if (cancelCheckoutBtn)  cancelCheckoutBtn.addEventListener("click", closeCheckout);
    if (confirmCheckoutBtn) confirmCheckoutBtn.addEventListener("click", handleConfirmCheckout);
    if (modalOverlay)       modalOverlay.addEventListener("click", closeCheckout);
    document.addEventListener("keydown", ev => {
        if (ev.key === "Escape") closeCheckout();
    });

    // Init
    loadCart();
    renderCart();
    loadBooks();
});
