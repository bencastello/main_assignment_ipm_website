async function loadJSON(path) {
    const res = await fetch(path);
    return await res.json();
}

document.addEventListener("DOMContentLoaded", initEntry);

async function initEntry() {
    const params = new URLSearchParams(window.location.search);
    const entryId = params.get("id");
    if (!entryId) {
        console.error("No entry id given");
        return;
    }

    try {
        const [curatorData, bookData] = await Promise.all([
            loadJSON("../data/curators.json"),
            loadJSON("../data/books.json")
        ]);

        const entry = curatorData.entries.find(e => e.id === entryId);
        if (!entry) {
            console.error("Entry not found:", entryId);
            return;
        }

        const book = bookData.books.find(b => b.id === entry.bookId);
        if (!book) {
            console.error("Book not found for entry:", entry.bookId);
            return;
        }

        document.getElementById("entryTitle").textContent = book.title;
        document.getElementById("entryCurator").textContent = `Picked by ${entry.curator}`;
        document.getElementById("entryDescription").innerHTML = entry.fullText;

        const coverEl = document.getElementById("entryCover");
        coverEl.style.backgroundImage = `url('../${book.cover}')`;

        const openBtn = document.getElementById("openBookBtn");
        openBtn.textContent = "Buy / view details →";
        openBtn.onclick = () => {
            // von /curators/entry.html aus eine Ebene hoch,
            // dann in /my_books/book_detail.html
            window.location.href = `../my_books/book_detail.html?id=${book.id}`;
        };


    } catch (err) {
        console.error("Entry page error:", err);
    }
}
