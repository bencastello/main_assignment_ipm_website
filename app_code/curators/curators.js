console.log("curators.js loaded");

const DATA_URL = "../data/curators.json";
const bookOfWeekSection = document.getElementById("bookOfWeekSection");
const curatorsGrid = document.getElementById("curatorsGrid");

// Load data
async function loadCurators() {
    try {
        const res = await fetch(DATA_URL);
        const data = await res.json();

        renderBookOfWeek(data.bookOfWeek);
        renderCurators(data.curators);

    } catch (err) {
        console.error("Curators JSON error:", err);
    }
}

// Render BOW
function renderBookOfWeek(bow) {
    if (!bow) return;

    bookOfWeekSection.innerHTML = `
        <div class="bow-card">
            <div class="bow-cover" style="background-image:url('../${bow.cover}')"></div>

            <div class="bow-text">
                <h2>${bow.title}</h2>
                <p>${bow.teaser}</p>

                <button class="curator-btn"
                    onclick="window.location.href='../${bow.detailPage}'">
                    Read more →
                </button>
            </div>
        </div>
    `;
}

// Render curator grid
function renderCurators(list) {
    curatorsGrid.innerHTML = list.map(c => `
        <div class="curator-card"
             onclick="window.location.href='entry.html?id=${c.id}'">

            <div class="curator-img"
                style="background-image:url('../${c.image}')"></div>

            <h3>${c.name}</h3>
            <p class="curator-bio">${c.bio}</p>

            <button class="curator-btn">Read more →</button>
        </div>
    `).join("");
}

document.addEventListener("DOMContentLoaded", loadCurators);
