console.log("chat.js loaded");

const STORAGE_KEY = "shelves_chat_threads_v5";

const THREADS_CONFIG = [
    { id: "bookclub", label: "Book Club", description: "Shared notes & chaos." },
    { id: "anna_dm", label: "Anna", description: "1:1 with Anna." },
    { id: "fiio_dm", label: "Fiio", description: "Fiio & memes." }
];

function nowISO() {
    return new Date().toISOString();
}

function formatTime(ts) {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function loadThreads() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return {
                bookclub: [
                    {
                        id: "m1",
                        from: "other",
                        text: "Hello fellow reader, this is where the Reading Group Chat would be",
                        ts: nowISO(),
                        read: false
                    },
                    {
                        id: "m2",
                        from: "other",
                        text: "See you on Sunday?",
                        ts: nowISO(),
                        read: false
                    }
                ]
            };
        }
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object") return {};
        return parsed;
    } catch (e) {
        console.error("Failed to parse chat threads from storage", e);
        return {};
    }
}

function saveThreads(threads) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
    } catch (e) {
        console.error("Failed to save chat threads", e);
    }
}

function ensureThread(threads, id) {
    if (!threads[id]) threads[id] = [];
}

function countUnread(threads) {
    let unread = 0;
    Object.values(threads).forEach(list => {
        list.forEach(m => {
            if (m.from !== "me" && !m.read) unread++;
        });
    });
    return unread;
}

function updateGlobalBadge(threads) {
    const badge = document.getElementById("chatBadge");
    if (!badge) return;
    const unread = countUnread(threads);
    if (unread > 0) {
        badge.hidden = false;
        badge.textContent = unread > 9 ? "9+" : String(unread);
    } else {
        badge.hidden = true;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    let threads = loadThreads();
    updateGlobalBadge(threads);

    const chatRoot = document.getElementById("chatPageRoot");
    if (!chatRoot) return;

    let activeThreadId = THREADS_CONFIG[0].id;
    ensureThread(threads, activeThreadId);

    const sidebarEl = document.getElementById("chatSidebar");
    const messagesEl = document.getElementById("chatMessages");
    const inputEl = document.getElementById("chatInput");
    const sendBtn = document.getElementById("chatSend");
    const formEl = document.getElementById("chatForm");

    if (!sidebarEl || !messagesEl || !inputEl || !sendBtn || !formEl) {
        console.warn("Chat DOM not complete, aborting wiring.");
        return;
    }

    function renderSidebar() {
        const ul = document.createElement("ul");
        ul.className = "chat-thread-list";

        THREADS_CONFIG.forEach(thread => {
            ensureThread(threads, thread.id);
            const unread = threads[thread.id].filter(
                m => m.from !== "me" && !m.read
            ).length;

            const li = document.createElement("li");
            li.className = "chat-thread-item" + (thread.id === activeThreadId ? " active" : "");
            li.textContent = thread.label;

            if (unread > 0) {
                const badge = document.createElement("span");
                badge.className = "chat-thread-badge";
                badge.textContent = unread > 9 ? "9+" : String(unread);
                li.appendChild(badge);
            }

            li.addEventListener("click", () => {
                activeThreadId = thread.id;
                ensureThread(threads, activeThreadId);
                renderSidebar();
                renderMessages();
            });

            ul.appendChild(li);
        });

        sidebarEl.innerHTML = "";
        const title = document.createElement("div");
        title.className = "chat-sidebar-title";
        title.textContent = "Chats";
        sidebarEl.appendChild(title);
        sidebarEl.appendChild(ul);
    }

    function markThreadRead(id) {
        const list = threads[id] || [];
        list.forEach(m => {
            if (m.from !== "me") m.read = true;
        });
    }

    function renderMessages() {
        ensureThread(threads, activeThreadId);
        const list = threads[activeThreadId];

        if (!list || list.length === 0) {
            messagesEl.innerHTML =
                '<div class="chat-empty">No messages yet. Say hi to everyone!</div>';
        } else {
            messagesEl.innerHTML = list
                .map(m => {
                    const meClass = m.from === "me" ? " me" : "";
                    const label = m.from === "me" ? "You" : "Them";
                    return `
                        <div class="message-row${meClass}">
                            <div class="message-bubble">
                                <div>${m.text}</div>
                                <div class="message-meta">${label} · ${formatTime(m.ts)}</div>
                            </div>
                        </div>
                    `;
                })
                .join("");
        }

        messagesEl.scrollTop = messagesEl.scrollHeight;

        markThreadRead(activeThreadId);
        saveThreads(threads);
        updateGlobalBadge(threads);
        renderSidebar();
    }

    function sendMessage() {
        const text = inputEl.value.trim();
        if (!text) return;

        ensureThread(threads, activeThreadId);
        const list = threads[activeThreadId];

        const nextId = list.length
            ? list[list.length - 1].id + "_n"
            : "m1";

        list.push({
            id: nextId,
            from: "me",
            text,
            ts: nowISO(),
            read: true
        });

        inputEl.value = "";
        saveThreads(threads);
        renderMessages();
    }

    formEl.addEventListener("submit", e => {
        e.preventDefault();
        sendMessage();
    });

    sendBtn.addEventListener("click", e => {
        e.preventDefault();
        sendMessage();
    });

    inputEl.addEventListener("keydown", e => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    renderSidebar();
    renderMessages();
});
