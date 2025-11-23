console.log("entry.js loaded");

const CURATORS_URL = "../data/curators.json";

async function loadAll() {
    const res = await fetch(CURATORS_URL);
    return await res.json();
}

function getEntryId() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

function findEntry(data, id) {
    for (const c of data.curators) {
        const hit = c.entries.find(e => e.id === id);
        if (hit) return { curator: c, entry: hit };
    }
    return null;
}

function renderEntry(curator, entry) {
    const box = document.getElementById("entryContainer");

    box.innerHTML = `
        <div class="entry-header">
            <h2>${entry.title}</h2>
            <p class="entry-by">by ${curator.name}</p>
        </div>

        <div class="entry-cover-large" style="background:${entry.coverFallback}"></div>

        <p class="entry-teaser">${entry.teaser}</p>

        <p class="entry-body">
            This is a placeholder for long-form curator content.  
            You can replace this with real text later, but at least  
            it won’t break your page now.
        </p>
    `;
}

async function initEntry() {
    const id = getEntryId();
    if (!id) return;

    const data = await loadAll();
    const match = findEntry(data, id);

    if (!match) {
        document.getElementById("entryContainer").innerHTML = `
            <p>Entry not found.</p>`;
        return;
    }

    renderEntry(match.curator, match.entry);
}

document.addEventListener("DOMContentLoaded", initEntry);
