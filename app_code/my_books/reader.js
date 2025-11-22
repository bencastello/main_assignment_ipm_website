// app_code/my_books/reader.js
document.addEventListener("DOMContentLoaded", () => {

    const params = new URLSearchParams(window.location.search);
    const bookId = params.get("id") || "hp2";

    const books = {
        hp2: {
            title: "Harry Potter II",
            text: [
                "It’s your second year at Hogwarts. The castle is familiar, but something feels off. Whispers in the corridor, a strange message on the wall, and a diary that probably should not be trusted.",
                "Classes get harder, friendships get tested and teachers remain… confusing at best. Between Quidditch, homework and general impending doom, you are once again in the middle of everything.",
                "The mystery deepens. People you care about end up petrified. There is talk of an ancient chamber, opened again after decades, unleashing something nobody fully understands.",
                "At some point you realise that adults are absolutely not handling this situation well. So obviously, it becomes your job to solve it. Again.",
                "Somewhere between courage, loyalty and sheer chaos, the story finds its way towards a very dangerous showdown."
            ]
        },
        faust2: {
            title: "Faust II",
            text: [
                "Faust leaves the narrow, tragic human drama of part one and walks into a huge, symbolic stage that refuses to explain itself.",
                "You get allegories, historical scenes, mythological figures and a lot of moments where you are not entirely sure what is literal and what isn’t.",
                "It feels like a dream that occasionally becomes a satire, then philosophy, then politics, then a fever.",
                "If you don’t fully understand everything, you are in excellent company.",
                "Still, somewhere underneath all the madness, the same question lingers: what is a good life, and what is it worth?"
            ]
        },
        friends2: {
            title: "FRIENDS II",
            text: [
                "The friend group is back, slightly older, not much wiser and still remarkably bad at clear communication.",
                "New jobs, new crushes, old drama. The usual combination.",
                "Someone moves out, someone moves in, someone absolutely does not move on.",
                "You get texting chaos, kitchen table confessions and way too many midnight walks.",
                "In the end, nothing is fully sorted, but it all feels a little more honest."
            ]
        },
        hitchhike: {
            title: "Hitchhike through the Galaxy",
            text: [
                "You didn’t plan to leave Earth today, but here we are.",
                "Galactic bureaucracy, depressed robots and highly suspicious probability drives are now part of your life.",
                "The good news: you have a towel. The bad news: literally everything else.",
                "Reality keeps getting stranger, but at least the jokes are good.",
                "Somewhere between existential crisis and cosmic nonsense, you keep going."
            ]
        }
    };

    const book = books[bookId] || books.hp2;

    const titleEl = document.getElementById("readerTitle");
    const progressLabel = document.getElementById("readerProgressLabel");
    const progressFill = document.getElementById("readerProgressFill");
    const contentEl = document.getElementById("readerContent");
    const backBtn = document.getElementById("backBtn");
    const nextBtn = document.getElementById("nextChunk");
    const prevBtn = document.getElementById("prevChunk");

    titleEl.textContent = book.title;

    const key = "shelves_progress_" + bookId;
    const stored = localStorage.getItem(key);
    let progress = stored !== null ? Math.min(1, Math.max(0, parseFloat(stored))) : 0;

    const totalChunks = book.text.length;

    function progressToIndex(p) {
        return Math.round(p * (totalChunks - 1));
    }

    let currentIndex = progressToIndex(progress);

    function updateUI() {
        const safeIndex = Math.min(totalChunks - 1, Math.max(0, currentIndex));
        contentEl.textContent = book.text[safeIndex];

        const p = totalChunks > 1 ? safeIndex / (totalChunks - 1) : 1;
        progress = p;

        localStorage.setItem(key, String(p));

        progressLabel.textContent = Math.round(p * 100) + "%";
        progressFill.style.width = (p * 100) + "%";

        prevBtn.disabled = safeIndex === 0;
        nextBtn.textContent = safeIndex === totalChunks - 1 ? "Finish" : "Next";
    }

    backBtn.addEventListener("click", () => {
        window.location.href = `book_detail.html?id=${encodeURIComponent(bookId)}`;
    });

    nextBtn.addEventListener("click", () => {
        if (currentIndex < totalChunks - 1) {
            currentIndex += 1;
            updateUI();
        } else {
            // Am Ende: einfach zurück zur Detailseite
            window.location.href = `book_detail.html?id=${encodeURIComponent(bookId)}`;
        }
    });

    prevBtn.addEventListener("click", () => {
        if (currentIndex > 0) {
            currentIndex -= 1;
            updateUI();
        }
    });

    updateUI();
});
