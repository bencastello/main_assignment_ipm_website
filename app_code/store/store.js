document.addEventListener("DOMContentLoaded", () => {

    // ========= DATA =========

    const products = [
        {
            id: "hp2",
            title: "Harry Potter II",
            author: "J.K. Rowling",
            genre: "Fantasy",
            format: "Hardcover",
            price: 14.99,
            featured: true,
            inStock: true
        },
        {
            id: "faust2",
            title: "Faust II",
            author: "J. W. von Goethe",
            genre: "Classics",
            format: "Paperback",
            price: 11.50,
            featured: true,
            inStock: true
        },
        {
            id: "friends2",
            title: "FRIENDS II",
            author: "Lena Hart",
            genre: "Contemporary",
            format: "Paperback",
            price: 16.90,
            featured: false,
            inStock: true
        },
        {
            id: "hitchhike",
            title: "Hitchhike through the Galaxy",
            author: "Douglas Adams",
            genre: "Sci-Fi",
            format: "Paperback",
            price: 13.40,
            featured: true,
            inStock: true
        },
        {
            id: "nonfic1",
            title: "Thinking in Systems",
            author: "Donella Meadows",
            genre: "Non-Fiction",
            format: "Paperback",
            price: 18.00,
            featured: false,
            inStock: true
        },
        {
            id: "nonfic2",
            title: "Atomic Habits",
            author: "James Clear",
            genre: "Non-Fiction",
            format: "Hardcover",
            price: 21.00,
            featured: false,
            inStock: true
        },
        {
            id: "sff1",
            title: "The City We Became",
            author: "N. K. Jemisin",
            genre: "Fantasy",
            format: "Paperback",
            price: 17.20,
            featured: false,
            inStock: true
        },
        {
            id: "sff2",
            title: "Project Hail Mary",
            author: "Andy Weir",
            genre: "Sci-Fi",
            format: "Hardcover",
            price: 22.50,
            featured: false,
            inStock: true
        }
    ];

    // ========= ELEMENTS =========

    const productGrid = document.getElementById("productGrid");
    const resultsInfo = document.getElementById("resultsInfo");
    const globalSearch = document.getElementById("globalSearch");
    const sortSelect = document.getElementById("sortSelect");
    const clearFiltersBtn = document.getElementById("clearFiltersBtn");
    const priceMinInput = document.getElementById("priceMin");
    const priceMaxInput = document.getElementById("priceMax");

    const cartItemsEl = document.getElementById("cartItems");
    const cartEmptyText = document.getElementById("cartEmptyText");
    const cartItemCountEl = document.getElementById("cartItemCount");
    const cartTotalEl = document.getElementById("cartTotal");
    const checkoutBtn = document.getElementById("checkoutBtn");

    const modalOverlay = document.getElementById("modalOverlay");
    const checkoutModal = document.getElementById("checkoutModal");
    const checkoutList = document.getElementById("checkoutList");
    const checkoutTotalEl = document.getElementById("checkoutTotal");
    const cancelCheckoutBtn = document.getElementById("cancelCheckoutBtn");
    const confirmCheckoutBtn = document.getElementById("confirmCheckoutBtn");
    const checkoutSuccessMsg = document.getElementById("checkoutSuccessMsg");

    const inputName = document.getElementById("inputName");
    const inputEmail = document.getElementById("inputEmail");
    const inputAddress = document.getElementById("inputAddress");


    // ========= STATE =========

    let cart = [];
    let currentSearch = "";
    let currentSort = "featured";

    function getSelected(name) {
        return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`))
            .map(el => el.value);
    }

    // ========= FILTER + SORT =========

    function filterAndSortProducts() {
        const selectedGenres = getSelected("genre");
        const selectedFormats = getSelected("format");

        const minPrice = Number(priceMinInput.value) || 0;
        const maxPrice = Number(priceMaxInput.value) || Infinity;

        let list = products.filter(p => {
            const matchesSearch =
                currentSearch === "" ||
                p.title.toLowerCase().includes(currentSearch) ||
                p.author.toLowerCase().includes(currentSearch);

            const matchesGenre =
                selectedGenres.length === 0 || selectedGenres.includes(p.genre);

            const matchesFormat =
                selectedFormats.length === 0 || selectedFormats.includes(p.format);

            const matchesPrice =
                p.price >= minPrice && p.price <= maxPrice;

            return matchesSearch && matchesGenre && matchesFormat && matchesPrice;
        });

        switch (currentSort) {
            case "price-asc":
                list.sort((a, b) => a.price - b.price);
                break;
            case "price-desc":
                list.sort((a, b) => b.price - a.price);
                break;
            case "title-asc":
                list.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case "featured":
            default:
                list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
                break;
        }

        return list;
    }

    // ========= RENDER PRODUCTS =========

    function renderProducts() {
        const list = filterAndSortProducts();

        productGrid.innerHTML = "";

        list.forEach(p => {
            const card = document.createElement("article");
            card.className = "product-card";

            const cover = document.createElement("div");
            cover.className = "product-cover";

            // simple color cue by genre
            if (p.genre === "Fantasy") cover.style.background = "linear-gradient(135deg,#182848,#4b6cb7)";
            if (p.genre === "Sci-Fi") cover.style.background = "linear-gradient(135deg,#11998e,#38ef7d)";
            if (p.genre === "Classics") cover.style.background = "linear-gradient(135deg,#4b0000,#c31432)";
            if (p.genre === "Contemporary") cover.style.background = "linear-gradient(135deg,#f7971e,#ffd200)";
            if (p.genre === "Non-Fiction") cover.style.background = "linear-gradient(135deg,#283048,#859398)";

            const title = document.createElement("p");
            title.className = "product-title";
            title.textContent = p.title;

            const author = document.createElement("p");
            author.className = "product-author";
            author.textContent = p.author;

            const metaTop = document.createElement("div");
            metaTop.className = "product-meta";

            const price = document.createElement("span");
            price.className = "product-price";
            price.textContent = `€${p.price.toFixed(2)}`;

            const genreChip = document.createElement("span");
            genreChip.className = "product-genre";
            genreChip.textContent = p.genre;

            metaTop.append(price, genreChip);

            const metaBottom = document.createElement("div");
            metaBottom.className = "product-meta";

            const format = document.createElement("span");
            format.className = "product-format";
            format.textContent = p.format;

            const stock = document.createElement("span");
            stock.className = "stock-label";
            stock.textContent = p.inStock ? "in stock" : "sold out";

            metaBottom.append(format, stock);

            const actions = document.createElement("div");
            actions.className = "product-actions";

            const addBtn = document.createElement("button");
            addBtn.className = "add-btn";
            addBtn.textContent = "add to cart";
            addBtn.disabled = !p.inStock;
            addBtn.addEventListener("click", () => addToCart(p.id));

            actions.append(addBtn);

            card.append(cover, title, author, metaTop, metaBottom, actions);
            productGrid.appendChild(card);
        });

        resultsInfo.textContent = `${list.length} result${list.length === 1 ? "" : "s"}`;
    }

    // ========= CART =========

    function addToCart(id) {
        const existing = cart.find(item => item.id === id);
        if (existing) {
            existing.qty += 1;
        } else {
            cart.push({ id, qty: 1 });
        }
        renderCart();
    }

    function changeQty(id, delta) {
        const item = cart.find(i => i.id === id);
        if (!item) return;
        item.qty += delta;
        if (item.qty <= 0) {
            cart = cart.filter(i => i.id !== id);
        }
        renderCart();
    }

    function removeFromCart(id) {
        cart = cart.filter(i => i.id !== id);
        renderCart();
    }

    function renderCart() {
        cartItemsEl.innerHTML = "";

        if (cart.length === 0) {
            cartEmptyText.classList.remove("hidden");
        } else {
            cartEmptyText.classList.add("hidden");
        }

        let total = 0;
        let itemsCount = 0;

        cart.forEach(ci => {
            const p = products.find(pr => pr.id === ci.id);
            if (!p) return;

            itemsCount += ci.qty;
            total += p.price * ci.qty;

            const li = document.createElement("li");
            li.className = "cart-item";

            const info = document.createElement("div");
            info.className = "cart-item-info";

            const t = document.createElement("div");
            t.className = "cart-item-title";
            t.textContent = p.title;

            const meta = document.createElement("div");
            meta.className = "cart-item-meta";
            meta.textContent = `${ci.qty} × €${p.price.toFixed(2)}`;

            info.append(t, meta);

            const controls = document.createElement("div");
            controls.className = "cart-item-controls";

            const qtyRow = document.createElement("div");
            qtyRow.className = "cart-qty-row";

            const minus = document.createElement("button");
            minus.className = "qty-btn";
            minus.textContent = "–";
            minus.addEventListener("click", () => changeQty(p.id, -1));

            const qtyLabel = document.createElement("span");
            qtyLabel.textContent = ci.qty;

            const plus = document.createElement("button");
            plus.className = "qty-btn";
            plus.textContent = "+";
            plus.addEventListener("click", () => changeQty(p.id, 1));

            qtyRow.append(minus, qtyLabel, plus);

            const remove = document.createElement("button");
            remove.className = "remove-btn";
            remove.textContent = "remove";
            remove.addEventListener("click", () => removeFromCart(p.id));

            controls.append(qtyRow, remove);

            li.append(info, controls);
            cartItemsEl.appendChild(li);
        });

        cartItemCountEl.textContent = itemsCount.toString();
        cartTotalEl.textContent = `€${total.toFixed(2)}`;
    }

    // ========= MODAL (FAKE CHECKOUT) =========

    function openModal(modal) {
        modalOverlay.classList.remove("hidden");
        modal.classList.remove("hidden");
        requestAnimationFrame(() => modal.classList.add("visible"));
    }

    function closeModal(modal) {
        modal.classList.remove("visible");
        setTimeout(() => {
            modal.classList.add("hidden");
            modalOverlay.classList.add("hidden");
        }, 180);
    }

    function openCheckout() {
        if (cart.length === 0) return;

        checkoutList.innerHTML = "";
        let total = 0;

        cart.forEach(ci => {
            const p = products.find(pr => pr.id === ci.id);
            if (!p) return;
            total += p.price * ci.qty;

            const li = document.createElement("li");
            const left = document.createElement("span");
            left.textContent = `${p.title} × ${ci.qty}`;
            const right = document.createElement("span");
            right.textContent = `€${(p.price * ci.qty).toFixed(2)}`;
            li.append(left, right);
            checkoutList.appendChild(li);
        });

        checkoutTotalEl.textContent = `€${total.toFixed(2)}`;
        checkoutSuccessMsg.classList.add("hidden");

        openModal(checkoutModal);
    }

    checkoutBtn.addEventListener("click", openCheckout);

    cancelCheckoutBtn.addEventListener("click", () => {
        closeModal(checkoutModal);
    });

    confirmCheckoutBtn.addEventListener("click", () => {
        const name = inputName.value.trim();
        const email = inputEmail.value.trim();
        const address = inputAddress.value.trim();

        if (!name || !email || !address) {
            alert("Please fill in name, email and address.");
            return;
        }

        checkoutSuccessMsg.classList.remove("hidden");
        cart = [];
        renderCart();
    });

    modalOverlay.addEventListener("click", () => {
        if (!checkoutModal.classList.contains("hidden")) {
            closeModal(checkoutModal);
        }
    });

    document.addEventListener("keydown", e => {
        if (e.key === "Escape" && !checkoutModal.classList.contains("hidden")) {
            closeModal(checkoutModal);
        }
    });

    // ========= FILTER EVENTS =========

    globalSearch.addEventListener("input", () => {
        currentSearch = globalSearch.value.trim().toLowerCase();
        renderProducts();
    });

    sortSelect.addEventListener("change", () => {
        currentSort = sortSelect.value;
        renderProducts();
    });

    document.querySelectorAll('input[name="genre"], input[name="format"]').forEach(input => {
        input.addEventListener("change", renderProducts);
    });

    priceMinInput.addEventListener("input", renderProducts);
    priceMaxInput.addEventListener("input", renderProducts);

    clearFiltersBtn.addEventListener("click", () => {
        document.querySelectorAll('input[name="genre"], input[name="format"]').forEach(i => i.checked = false);
        priceMinInput.value = "";
        priceMaxInput.value = "";
        currentSearch = "";
        globalSearch.value = "";
        sortSelect.value = "featured";
        currentSort = "featured";
        renderProducts();
    });

    // ========= INIT =========

    renderProducts();
    renderCart();
});
