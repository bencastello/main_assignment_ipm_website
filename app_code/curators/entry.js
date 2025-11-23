console.log("entry.js loaded");

async function loadCuratorData() {
    const res = await fetch("../data/curators.json");
    return await res.json();
}

function getEntryId() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

async function initEntry() {
    const data = await loadCuratorData();
    const entryId = getEntryId();

    if (!entryId) {
        console.error("No entry id provided");
        return;
    }

    const entry = data.entries.find(e => e.id === entryId);
    if (!entry) {
        console.error("Entry not found:", entryId);
        return;
    }

    // Fill DOM
    document.getElementById("entryTitle").textContent = entry.title;
    document.getElementById("entryCurator").textContent = entry.curator;
    document.getElementById("entryDescription").innerHTML = entry.fullText;

    const coverEl = document.getElementById("entryCover");
    coverEl.style.backgroundImage = `url('../${entry.cover}')`;

    const openBtn = document.getElementById("openBookBtn");
    openBtn.onclick = () => window.location.href = entry.bookLink;
}

document.addEventListener("DOMContentLoaded", initEntry);
