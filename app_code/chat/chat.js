console.log("chat.js loaded");

// Central JSON sources
const FRIENDS_URL = "../data/friends.json";
const USERS_URL = "../data/users.json";

// DOM Refs
const sidebar = document.getElementById("chatSidebar");
const messagesEl = document.getElementById("chatMessages");
const input = document.getElementById("chatInput");
const sendBtn = document.getElementById("chatSend");

let THREADS = [];
let ACTIVE_THREAD = null;

// Fake local message storage
function loadLocalMessages(threadId) {
    return JSON.parse(localStorage.getItem("chat_" + threadId) || "[]");
}

function saveLocalMessages(threadId, messages) {
    localStorage.setItem("chat_" + threadId, JSON.stringify(messages));
}

// Load base data
async function loadAllData() {
    const [friendsRes, usersRes] = await Promise.all([
        fetch(FRIENDS_URL),
        fetch(USERS_URL)
    ]);

    const friends = (await friendsRes.json()).friends || [];
    const users = (await usersRes.json()).users || [];

    return { friends, users };
}

// Build threads list (friends + bookclub pseudo-thread)
function buildThreads({ friends }) {
    THREADS = [
        { id: "bookclub", name: "Book Club", system: true },
        ...friends.map(f => ({
            id: f.id,
            name: f.name,
            avatar: f.avatar || null
        }))
    ];
}

function renderSidebar() {
    sidebar.innerHTML = "";

    THREADS.forEach(t => {
        const div = document.createElement("div");
        div.className = "chat-thread";
        div.dataset.id = t.id;
        div.textContent = t.name;

        if (t.id === ACTIVE_THREAD) {
            div.classList.add("chat-thread-active");
        }

        div.addEventListener("click", () => openThread(t.id));
        sidebar.appendChild(div);
    });
}

function renderMessages(threadId) {
    messagesEl.innerHTML = "";

    const msgs = loadLocalMessages(threadId);

    msgs.forEach(msg => {
        const el = document.createElement("div");
        el.className = "chat-message";
        if (msg.me) el.classList.add("chat-message--me");
        el.textContent = msg.text;
        messagesEl.appendChild(el);
    });

    messagesEl.scrollTop = messagesEl.scrollHeight;
}

function openThread(threadId) {
    ACTIVE_THREAD = threadId;
    renderSidebar();
    renderMessages(threadId);
}

// Send message
function sendMessage() {
    const text = input.value.trim();
    if (!text || !ACTIVE_THREAD) return;

    const msgs = loadLocalMessages(ACTIVE_THREAD);

    msgs.push({
        me: true,
        text,
        ts: Date.now()
    });

    saveLocalMessages(ACTIVE_THREAD, msgs);

    input.value = "";
    renderMessages(ACTIVE_THREAD);
}

sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keydown", e => {
    if (e.key === "Enter") sendMessage();
});

// Initialize
async function initChat() {
    const data = await loadAllData();
    buildThreads(data);
    renderSidebar();

    // Auto-open first thread
    if (THREADS.length > 0) {
        openThread(THREADS[0].id);
    }
}

document.addEventListener("DOMContentLoaded", initChat);
