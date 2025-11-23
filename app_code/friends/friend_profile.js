console.log("friend_profile.js loaded");

async function loadFriends() {
    const res = await fetch("../data/friends.json");
    const data = await res.json();
    return data.friends || [];
}

async function loadBooks() {
    const res = await fetch("../data/books.json");
    const data = await res.json();
    return data.books || [];
}

function getId() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

async function initFriend() {
    const [friends, books] = await Promise.all([loadFriends(), loadBooks()]);
    const id = getId();
    const profile = friends.find(f => f.id === id);

    const container = document.getElementById("friendProfile");

    if (!profile) {
        container.innerHTML = "<h2>Friend not found</h2>";
        return;
    }

    const favBooks = books.filter(b => profile.favBooks?.includes(b.id));

    container.innerHTML = `
        <img class="friend-avatar" src="../${profile.avatar}">
        <h2 class="friend-name">${profile.name}</h2>
        <p class="friend-username">@${profile.username}</p>
        <p class="friend-bio">${profile.bio || ""}</p>

        <section class="friend-books-section">
            <h3>Favorite Books</h3>
            <div class="friend-books-wrapper">
                ${favBooks
        .map(b => `
                        <div class="friend-book-card"
                             onclick="window.location.href='../my_books/book_detail.html?id=${b.id}'">
                            <div class="friend-book-cover"
                                 style="background-image:url('../${b.cover}')"></div>
                            <p>${b.title}</p>
                        </div>
                    `).join("")}
            </div>
        </section>
    `;
}

document.addEventListener("DOMContentLoaded", initFriend);

icon.addEventListener("click", () => {
    window.location.href = `friend_profile.html?id=${f.id}`;
});
