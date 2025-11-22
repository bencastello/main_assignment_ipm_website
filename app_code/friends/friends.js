console.log("friends.js loaded");

const DATA = [
    { id: "anna",  name: "Anna Weber",  avatar: "friends/anna.png",  genre: "Fantasy" },
    { id: "fiio",  name: "Fiio Tsuma",  avatar: "friends/fiio.png",  genre: "Drama" },
    { id: "lara",  name: "Lara Sonnborn", avatar: "friends/lara.png", genre: "Romance" },
    { id: "geri",  name: "Geri Madsen", avatar: "friends/geri.png", genre: "Philosophy" },
    { id: "sonja", name: "Sonja Heinz", avatar: "friends/sonja.png", genre: "Sci-Fi" },
    { id: "sarah", name: "Sarah Bell", avatar: "friends/sarah.png", genre: "Thriller" }
];

const grid = document.getElementById("friendsGrid");
const search = document.getElementById("friendSearch");

function render(list) {
    grid.innerHTML = list.map(f => `
        <div class="friend-card" onclick="window.location.href='../profile/profile.html?id=${f.id}'">
            <img src="${f.avatar}" class="friend-avatar">
            <div class="friend-name">${f.name}</div>
            <div class="friend-sub">${f.genre}</div>
        </div>
    `).join("");
}

render(DATA);

search.addEventListener("input", () => {
    const q = search.value.toLowerCase();
    const filtered = DATA.filter(f => f.name.toLowerCase().includes(q));
    render(filtered);
});
