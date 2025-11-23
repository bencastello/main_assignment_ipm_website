console.log("curators.js loaded");

// JSON-Pfad
const DATA_URL = "../data/curators.json";

// Elemente holen
const bookOfWeekSection = document.getElementById("bookOfWeekSection");
const curatorsGrid = document.getElementById("curatorsGrid");

// ------------------- LOAD DATA -------------------
async function loadCurators() {
    try {
        const res = await fetch(DATA_URL);
        const data = await res.json();

        if (!data) throw new Error("Empty JSON");

        renderBookOfWeek(data.bookOfWeek);
        renderCurators(data.curators);

    } catch (err) {
        console.error("Curators load error:", err);
    }
}

// ---------------- BOOK OF THE WEEK ---------------
function renderBookOfWeek(bow) {
    if (!bow) {
        bookOfWeekSection.innerHTML = "";
        return;
    }

    bookOfWeekSection.innerHTML = `
        <div class="bow-card">
            <div class="bow-cover" style="background-image:url('../${bow.cover}')"></div>
            <div class="bow-text">
                <h2>${bow.title}</h2>
                <p>${bow.teaser || ""}</p>
                <button class="curator-btn"
                    onclick="window.location.href='../${bow.detailPage}'">
                    Read more →
                </button>
            </div>
        </div>
    `;
}

// ------------------ CURATOR LIST ------------------
function renderCurators(list) {
    if (!list || list.length === 0) {
        curatorsGrid.innerHTML = "<p>No curators yet.</p>";
        return;
    }

    curatorsGrid.innerHTML = list.map(c => `
        <div class="curator-card"
             onclick="window.location.href='entry.html?id=${c.id}'">

            <div class="curator-img"
                style="background-image:url('../${c.image || "curators/placeholder.jpg"}')">
            </div>

            <h3>${c.name}</h3>

            <p class="curator-bio">${c.bio || ""}</p>

            <button class="curator-btn">Read more →</button>
        </div>
    `).join("");
}

// Start!
document.addEventListener("DOMContentLoaded", loadCurators);
