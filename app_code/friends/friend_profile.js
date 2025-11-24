console.log("friend_profile.js loaded (fixed)");

async function loadJSON(path) {
    const res = await fetch(path);
    return res.json();
}

function getFriendId() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

function coverUrl(book) {
    if (!book || !book.cover) return "";
    const c = book.cover;
    if (c.startsWith("http") || c.startsWith("/")) return c;
    return "../data/" + c;
}

function avatarUrl(friend) {
    const a = friend.avatar || "";
    if (!a) return "../user_icon.png";
    if (a.startsWith("http") || a.startsWith("../")) return a;
    return "../data/" + a;
}

async function initFriendProfile() {
    const root = document.getElementById("friendProfile");
    if (!root) return;

    const friendId = getFriendId();
    if (!friendId) {
        root.innerHTML = "<p>Friend id missing.</p>";
        return;
    }

    const [friendsData, booksData] = await Promise.all([
        loadJSON("../data/friends.json"),
        loadJSON("../data/books.json")
    ]);

    const friends = friendsData.friends || [];
    const books   = booksData.books   || [];

    const friend = friends.find(f => f.id === friendId);

    if (!friend) {
        root.innerHTML = "<p>Friend not found.</p>";
        return;
    }

    const favorites = (friend.favorites || [])
        .map(id => books.find(b => b.id === id))
        .filter(Boolean);

    const currentBook = books.find(b => b.id === friend.currentReading);

    root.innerHTML = `
        <section class="friend-header">
            <img src="${avatarUrl(friend)}" class="friend-avatar-large" alt="">
            <h2>${friend.realname || friend.username}</h2>
            <p class="username">${friend.username}</p>
            <p class="bio">${friend.bio || ""}</p>
        </section>

        <section class="profile-section">
            <h3>Favorite genres</h3>
            <div class="tag-row">
                ${(friend.favoriteGenres || [])
        .map(g => `<span class="tag">${g}</span>`).join("")}
            </div>
        </section>

        <section class="profile-section">
            <h3>Currently reading</h3>
            ${
        currentBook
            ? `
                <div class="book-row"
                     onclick="window.location.href='../my_books/book_detail.html?id=${currentBook.id}'">
                    <div class="book-cover"
                         style="background-image:url('${coverUrl(currentBook)}')"></div>
                    <div>
                        <h4>${currentBook.title}</h4>
                        <p>${currentBook.author}</p>
                        <p>${Math.round((friend.currentProgress || 0) * 100)}%</p>
                    </div>
                </div>`
            : "<p>No current book.</p>"
    }
        </section>

        <section class="profile-section">
            <h3>Favorites</h3>
            <div class="favorites-row">
                ${
        favorites.length
            ? favorites.map(b => `
                            <div class="fav-book"
                                 onclick="window.location.href='../my_books/book_detail.html?id=${b.id}'">
                                <div class="fav-cover"
                                     style="background-image:url('${coverUrl(b)}')"></div>
                                <p>${b.title}</p>
                            </div>
                        `).join("")
            : "<p>No favorites yet.</p>"
    }
            </div>
        </section>
    `;
}

document.addEventListener("DOMContentLoaded", initFriendProfile);
