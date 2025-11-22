console.log("chat.js loaded");

const params = new URLSearchParams(window.location.search);
let activeThread = params.get("thread") || "bookclub";

const USERS = {
    bookclub: { name: "Book Club" },
    anna:  { name: "Anna Weber" },
    fiio:  { name: "Fiio Tsuma" },
    lara:  { name: "Lara Sonnborn" },
    geri:  { name: "Geri Madsen" },
    sonja: { name: "Sonja Heinz" },
    sarah: { name: "Sarah Bell" }
};

const STORAGE_KEY = "shelves_chat_threads";

let threads = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};

function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
}

function ensureThread(id) {
    if (!threads[id]) {
        threads[id] = [];
        save();
    }
}

function renderSidebar() {
    const sidebar = document.getElementById("chatSidebar");
    sidebar.innerHTML = Object.keys(USERS).map(id => `
        <div class="chat-thread ${id === activeThread ? "chat-thread-active" : ""}"
             onclick="window.location.href='chat.html?thread=${id}'">
            ${USERS[id].name}
        </div>
    `).join("");
}

function renderMessages() {
    ensureThread(activeThread);
    const list = threads[activeThread];
    const box = document.getElementById("chatMessages");

    box.innerHTML = list.map(m => `
        <div class="chat-message ${m.from === "me" ? "chat-message--me" : ""}">
            ${m.text}
        </div>
    `).join("");

    box.scrollTop = box.scrollHeight;
}

renderSidebar();
renderMessages();

document.getElementById("chatSend").onclick = send;
document.getElementById("chatInput").onkeydown = e => {
    if (e.key === "Enter") send();
};

function send() {
    const input = document.getElementById("chatInput");
    const text = input.value.trim();
    if (!text) return;

    ensureThread(activeThread);

    threads[activeThread].push({
        from: "me",
        text
    });

    save();
    input.value = "";
    renderMessages();
}
