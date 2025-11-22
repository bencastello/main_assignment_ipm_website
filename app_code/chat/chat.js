console.log("chat.js loaded");

const STORAGE_KEY = "shelves_chat_threads_v2";
const STORAGE_ACTIVE = "shelves_chat_active_thread";

// statische "Pseudo-Chats"
const THREADS = [
    {
        id: "general",
        name: "Group chat",
        subtitle: "Project chaos & updates"
    },
    {
        id: "mina",
        name: "Mina",
        subtitle: "DM · fantasy recs"
    },
    {
        id: "leo",
        name: "Leo",
        subtitle: "DM · sci-fi & memes"
    },
    {
        id: "bookclub",
        name: "Book Club",
        subtitle: "#FridayNightReading"
    }
];

let threadsData = {};   // { [threadId]: Message[] }
let currentThreadId = "general";

// ---- helpers ----

function nowISO() {
    return new Date().toISOString();
}

function formatTime(ts) {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function ensureThread(id) {
    if (!threadsData[id]) {
        threadsData[id] = [];
    }
}

function seedIfEmpty() {
    // nur, wenn gar nichts existiert
    const hasAny =
        threadsData &&
        typeof threadsData === "object" &&
        Object.keys(threadsData).length > 0;

    if (hasAny) return;

    threadsData = {
        general: [
            {
                id: 1,
                from: "other",
                text: "Willkommen im shelves Chat 👋",
                ts: nowISO(),
                read: false
            },
            {
                id: 2,
                from: "other",
                text: "Hier könnt ihr später Projektkram und Chaos besprechen.",
                ts: nowISO(),
                read: false
            }
        ],
        mina: [
            {
                id: 1,
                from: "other",
                text: "Ich hab da noch eine Fantasy-Reihe für dich…",
                ts: nowISO(),
                read: false
            }
        ],
        leo: [
            {
                id: 1,
                from: "other",
                text: "Neues Sci-Fi Buch entdeckt, erinnert mich an Hitchhike.",
                ts: nowISO(),
                read: false
            }
        ],
        bookclub: [
            {
                id: 1,
                from: "other",
                text: "Nächster Buchclub: Freitag 20:00 · bring Snacks.",
                ts: nowISO(),
                read: false
            }
        ]
    };
}

function loadThreads() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            threadsData = JSON.parse(raw) || {};
        } else {
            threadsData = {};
        }
    } catch (e) {
        console.error("Failed to load chat threads", e);
        threadsData = {};
    }

    seedIfEmpty();

    // sicherstellen, dass alle Threads existieren
    THREADS.forEach(t => ensureThread(t.id));

    const savedActive = localStorage.getItem(STORAGE_ACTIVE);
    if (savedActive && threadsData[savedActive]) {
        currentThreadId = savedActive;
    } else {
        currentThreadId = "general";
    }
}

function saveThreads() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(threadsData));
    } catch (e) {
        console.error("Failed to save chat threads", e);
    }
}

function getUnreadCount(threadId) {
    const msgs = threadsData[threadId] || [];
    return msgs.filter(m => !m.read && m.from !== "me").length;
}

function getTotalUnread() {
    return THREADS.reduce((sum, t) => sum + getUnreadCount(t.id), 0);
}

// ---- Badge (Homepage & Chat-Seite) ----

function updateGlobalBadge() {
    const badge = document.getElementById("chatBadge");
    if (!badge) return;

    const total = getTotalUnread();
    if (total > 0) {
        badge.hidden = false;
        badge.textContent = total > 9 ? "9+" : String(total);
    } else {
        badge.hidden = true;
    }
}

// ---- Chat-Seite Rendering ----

function renderThreadList() {
    const listEl = document.getElementById("chatThreadsList");
    if (!listEl) return;

    const html = THREADS.map(t => {
        const unread = getUnreadCount(t.id);
        return `
            <button class="chat-thread ${t.id === currentThreadId ? "chat-thread--active" : ""}"
                    data-thread-id="${t.id}">
                <div class="chat-thread-main">
                    <span class="chat-thread-name">${t.name}</span>
                    <span class="chat-thread-sub">${t.subtitle}</span>
                </div>
                ${unread > 0
            ? `<span class="chat-thread-badge">${unread > 9 ? "9+" : unread}</span>`
            : ""}
            </button>
        `;
    }).join("");

    listEl.innerHTML = html;

    // Click handler
    Array.from(listEl.querySelectorAll(".chat-thread")).forEach(btn => {
        btn.addEventListener("click", () => {
            const id = btn.getAttribute("data-thread-id");
            if (!id || id === currentThreadId) return;
            switchThread(id);
        });
    });
}

function renderMessages() {
    const messagesEl = document.getElementById("chatMessagesPage");
    const titleEl = document.getElementById("chatThreadTitle");
    const subtitleEl = document.getElementById("chatThreadSubtitle");

    if (!messagesEl) return;

    const threadMeta = THREADS.find(t => t.id === currentThreadId);
    if (titleEl && threadMeta) {
        titleEl.textContent = threadMeta.name;
    }
    if (subtitleEl && threadMeta) {
        subtitleEl.textContent = threadMeta.subtitle;
    }

    const msgs = threadsData[currentThreadId] || [];
    const html = msgs.map(m => `
        <div class="chat-message ${m.from === "me" ? "chat-message--me" : ""}">
            <div>${m.text}</div>
            <div class="chat-message-meta">
                ${m.from === "me" ? "You" : "System"} · ${formatTime(m.ts)}
            </div>
        </div>
    `).join("");

    messagesEl.innerHTML = html;
    messagesEl.scrollTop = messagesEl.scrollHeight;
}

function markThreadRead(threadId) {
    const msgs = threadsData[threadId] || [];
    threadsData[threadId] = msgs.map(m => {
        if (m.from !== "me") {
            return { ...m, read: true };
        }
        return m;
    });
    saveThreads();
}

function switchThread(id) {
    currentThreadId = id;
    localStorage.setItem(STORAGE_ACTIVE, id);
    markThreadRead(id);
    renderMessages();
    renderThreadList();
    updateGlobalBadge();
}

// ---- Sending messages ----

function sendMessageFromPage(text) {
    const content = text.trim();
    if (!content) return;

    ensureThread(currentThreadId);

    const msgs = threadsData[currentThreadId];
    const nextId = msgs.length ? msgs[msgs.length - 1].id + 1 : 1;

    msgs.push({
        id: nextId,
        from: "me",
        text: content,
        ts: nowISO(),
        read: true
    });

    threadsData[currentThreadId] = msgs;
    saveThreads();
    renderMessages();
    renderThreadList();
    updateGlobalBadge();
}

// ---- Init ----

document.addEventListener("DOMContentLoaded", () => {
    loadThreads();

    const messagesEl = document.getElementById("chatMessagesPage");
    const inputEl    = document.getElementById("chatInputPage");
    const sendEl     = document.getElementById("chatSendPage");

    // Wenn wir auf der Chat-Seite sind:
    if (messagesEl && inputEl && sendEl) {
        renderThreadList();
        markThreadRead(currentThreadId);
        renderMessages();
        updateGlobalBadge();

        sendEl.addEventListener("click", () => {
            sendMessageFromPage(inputEl.value);
            inputEl.value = "";
            inputEl.focus();
        });

        inputEl.addEventListener("keydown", (ev) => {
            if (ev.key === "Enter") {
                ev.preventDefault();
                sendMessageFromPage(inputEl.value);
                inputEl.value = "";
            }
        });
    } else {
        // irgendeine andere Seite (z.B. Homepage) → nur Badge
        updateGlobalBadge();
    }
});
