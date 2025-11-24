console.log("friends.js loaded (fixed)");

document.addEventListener("DOMContentLoaded", () => {
    initFriends().catch(err => console.error(err));
});

async function initFriends() {
    const res = await fetch("../data/friends.json");
    const json = await res.json();
    const friends = json.friends || [];
    const grid = document.getElementById("friendsGrid");

    function avatarUrl(friend) {
        const a = friend.avatar || "";
        if (!a) return "../user_icon.png";
        if (a.startsWith("http") || a.startsWith("../")) return a;
        return "../data/" + a;
    }

    function render(list) {
        if (!grid) return;
        if (!list.length) {
            grid.innerHTML = `<p class="empty-row">No friends found.</p>`;
            return;
        }

        grid.innerHTML = list.map(f => {
            const genres = (f.favoriteGenres || []).join(", ");
            return `
                <article class="friend-card">
                    <div class="friend-main" data-id="${f.id}">
                        <img src="${avatarUrl(f)}"
                             alt="${escapeHtml(f.realname || f.username || "")}"
                             class="friend-avatar">
                        <div class="friend-meta">
                            <h3>${escapeHtml(f.username)}</h3>
                            <p>${escapeHtml(f.realname || "")}</p>
                            <p class="friend-genres">${escapeHtml(genres)}</p>
                        </div>
                    </div>
                    <div class="friend-actions">
                        <button class="friend-profile-btn" data-id="${f.id}">
                            View profile
                        </button>
                        <button class="friend-chat-btn"
                                data-thread="${f.chatThread || f.id}">
                            Chat
                        </button>
                    </div>
                </article>
            `;
        }).join("");
    }

    render(friends);

    if (grid) {
        grid.addEventListener("click", (ev) => {
            const profileBtn = ev.target.closest(".friend-profile-btn");
            const chatBtn = ev.target.closest(".friend-chat-btn");
            const main = ev.target.closest(".friend-main");

            if (profileBtn) {
                const id = profileBtn.dataset.id;
                window.location.href = `friend_profile.html?id=${encodeURIComponent(id)}`;
            } else if (chatBtn) {
                const thread = chatBtn.dataset.thread;
                window.location.href = `../chat/chat.html?thread=${encodeURIComponent(thread)}`;
            } else if (main) {
                const id = main.dataset.id;
                window.location.href = `friend_profile.html?id=${encodeURIComponent(id)}`;
            }
        });
    }

    const search = document.getElementById("friendsSearch");
    if (search) {
        search.addEventListener("input", (e) => {
            const q = e.target.value.trim().toLowerCase();
            if (!q) {
                render(friends);
                return;
            }
            const filtered = friends.filter(f => {
                const hay = [
                    f.username,
                    f.realname,
                    (f.tags || []).join(" ")
                ].join(" ").toLowerCase();
                return hay.includes(q);
            });
            render(filtered);
        });
    }
}

function escapeHtml(str) {
    return String(str || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
