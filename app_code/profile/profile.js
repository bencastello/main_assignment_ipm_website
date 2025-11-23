console.log("profile.js loaded");

document.addEventListener("DOMContentLoaded", () => {
    initProfile().catch(err => console.error(err));
});

async function initProfile() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id") || "me";

    const [userData, friendsData, booksData] = await Promise.all([
        fetch("../data/users.json").then(r => r.json()),
        fetch("../data/friends.json").then(r => r.json()),
        fetch("../data/books.json").then(r => r.json())
    ]);

    const users   = userData.users   || [];
    const friends = friendsData.friends || [];
    const books   = booksData.books  || [];

    const userMap = {};
    users.forEach(u => userMap[u.id] = u);
    const friendMap = {};
    friends.forEach(f => friendMap[f.id] = f);
    const bookMap = {};
    books.forEach(b => bookMap[b.id] = b);

    let mode = "self";
    let profile = null;

    if (id === "me" || userMap[id]) {
        mode = "self";
        profile = userMap[id] || userMap["me"];
    } else {
        mode = "friend";
        profile = friendMap[id];
    }

    if (!profile) {
        document.body.innerHTML = "<p>Profile not found.</p>";
        return;
    }

    // DOM refs (an dein HTML angepasst)
    const profileImg       = document.getElementById("profileImg");
    const displayUsername  = document.getElementById("displayUsername");
    const displayRealname  = document.getElementById("displayRealname");
    const displayBio       = document.getElementById("displayBio");
    const goalCount        = document.getElementById("goalCount");
    const statBooks        = document.getElementById("statBooks");
    const statPages        = document.getElementById("statPages");
    const statRating       = document.getElementById("statRating");
    const statStreak       = document.getElementById("statStreak");
    const favRow           = document.getElementById("favRow");
    const currentTitle     = document.querySelector(".current-title");
    const currentMeta      = document.querySelector(".current-meta");
    const currentCover     = document.querySelector(".current-cover");
    const currentPercentEl = document.querySelector(".current-percent");
    const progressFills    = Array.from(document.querySelectorAll(".progress-fill"));
    const openEditBtn      = document.getElementById("openEditBtn");
    const messageBtn       = document.getElementById("messageFriendBtn");

    // Basisdaten
    if (profileImg) {
        const avatar = profile.avatar || "user_icon.png";
        profileImg.src = avatar.startsWith("http") || avatar.startsWith("../")
            ? avatar
            : "../" + avatar;
    }
    if (displayUsername) displayUsername.textContent = profile.username || "@user";
    if (displayRealname) displayRealname.textContent = profile.realname || profile.name || "";
    if (displayBio)      displayBio.textContent = profile.bio || "";

    // Stats & Goal (nur für self sinnvoll, aber wir faken für Freunde notfalls nichts)
    if (mode === "self" && profile.stats) {
        if (goalCount) {
            const goalCur = profile.stats.booksThisYear || 0;
            const goalTarget = 50;
            goalCount.textContent = `${goalCur} / ${goalTarget}`;
        }
        if (statBooks)  statBooks.textContent  = profile.stats.booksThisYear || 0;
        if (statPages)  statPages.textContent  = (profile.stats.pagesRead || 0).toLocaleString();
        if (statRating) statRating.textContent = (profile.stats.avgRating || 0).toFixed(1) + "★";
        if (statStreak) statStreak.textContent = (profile.stats.streakDays || 0) + " d";
    }

    // Favorites
    if (favRow) {
        const favIds = profile.favorites || profile.favourites || [];
        favRow.innerHTML = favIds.map(id => {
            const b = bookMap[id];
            if (!b) return "";
            const cover = b.cover ? `style="background-image:url('../${b.cover}')"` : "";
            return `
                <article class="fav-book">
                    <div class="fav-cover" ${cover}></div>
                    <p class="fav-title">${escapeHtml(b.title)}</p>
                </article>
            `;
        }).join("");
    }

    // Currently reading
    const currentId = profile.currentReading;
    const progress  = profile.currentProgress || 0;
    if (currentId && bookMap[currentId]) {
        const b = bookMap[currentId];
        if (currentTitle) currentTitle.textContent = b.title;
        if (currentMeta)  currentMeta.textContent  = `${b.author} · ${b.genre}`;
        if (currentCover) {
            currentCover.style.backgroundImage = `linear-gradient(135deg, #283048, #859398), url('../${b.cover}')`;
            currentCover.style.backgroundSize = "cover";
        }
        if (currentPercentEl) currentPercentEl.textContent = `${Math.round(progress * 100)}%`;
        progressFills.forEach(fill => {
            const target = fill.dataset.progress ? Number(fill.dataset.progress) : progress * 100;
            requestAnimationFrame(() => {
                fill.style.width = `${target}%`;
            });
        });
    }

    // Edit vs. Message
    if (mode === "self") {
        if (openEditBtn) openEditBtn.classList.remove("hidden");
        if (messageBtn)  messageBtn.classList.add("hidden");
        setupSelfEditing(profile);
    } else {
        if (openEditBtn) openEditBtn.classList.add("hidden");
        if (messageBtn) {
            messageBtn.classList.remove("hidden");
            messageBtn.addEventListener("click", () => {
                const thread = profile.chatThread || profile.id;
                window.location.href = `../chat/chat.html?thread=${encodeURIComponent(thread)}`;
            });
        }
    }
}

function setupSelfEditing(profile) {
    const modalOverlay    = document.getElementById("modalOverlay");
    const editModal       = document.getElementById("editModal");
    const openEditBtn     = document.getElementById("openEditBtn");
    const editUsername    = document.getElementById("editUsername");
    const editRealname    = document.getElementById("editRealname");
    const editBio         = document.getElementById("editBio");
    const saveProfileBtn  = document.getElementById("saveProfileBtn");
    const cancelEditBtn   = document.getElementById("cancelEditBtn");
    const profileImg      = document.getElementById("profileImg");
    const avatarClickable = document.getElementById("avatarClickable");
    const photoModal      = document.getElementById("photoModal");
    const uploadInput     = document.getElementById("uploadInput");
    const randomAvatarBtn = document.getElementById("randomAvatarBtn");

    const displayUsername = document.getElementById("displayUsername");
    const displayRealname = document.getElementById("displayRealname");
    const displayBio      = document.getElementById("displayBio");

    function openModal(modal) {
        modalOverlay.classList.remove("hidden");
        modal.classList.remove("hidden");
        requestAnimationFrame(() => modal.classList.add("visible"));
    }

    function closeModal(modal) {
        modal.classList.remove("visible");
        setTimeout(() => {
            modal.classList.add("hidden");
            if (!document.querySelector(".modal.visible")) {
                modalOverlay.classList.add("hidden");
            }
        }, 180);
    }

    if (openEditBtn) {
        openEditBtn.addEventListener("click", () => {
            editUsername.value = displayUsername.textContent.trim();
            editRealname.value = displayRealname.textContent.trim();
            editBio.value      = displayBio.textContent.trim();
            openModal(editModal);
        });
    }

    if (saveProfileBtn) {
        saveProfileBtn.addEventListener("click", () => {
            const newUser = editUsername.value.trim();
            const newReal = editRealname.value.trim();
            const newBio  = editBio.value.trim();

            if (newUser) displayUsername.textContent = newUser;
            if (newReal) displayRealname.textContent = newReal;
            displayBio.textContent = newBio || displayBio.textContent;

            closeModal(editModal);
        });
    }

    if (cancelEditBtn) cancelEditBtn.addEventListener("click", () => closeModal(editModal));

    if (avatarClickable) {
        avatarClickable.addEventListener("click", () => openModal(photoModal));
    }

    if (randomAvatarBtn) {
        randomAvatarBtn.addEventListener("click", () => {
            const seed = Math.floor(Math.random() * 100000);
            profileImg.src = `https://api.dicebear.com/7.x/thumbs/svg?seed=${seed}`;
            closeModal(photoModal);
        });
    }

    if (uploadInput) {
        uploadInput.addEventListener("change", e => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => { profileImg.src = reader.result; };
            reader.readAsDataURL(file);
            closeModal(photoModal);
        });
    }

    modalOverlay.addEventListener("click", () => {
        [editModal, photoModal].forEach(m => {
            if (!m.classList.contains("hidden")) closeModal(m);
        });
    });

    document.addEventListener("keydown", e => {
        if (e.key === "Escape") {
            [editModal, photoModal].forEach(m => {
                if (!m.classList.contains("hidden")) closeModal(m);
            });
        }
    });
}

function escapeHtml(str) {
    return String(str || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
