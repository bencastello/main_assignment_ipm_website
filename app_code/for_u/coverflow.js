document.addEventListener("DOMContentLoaded", function () {

    const items = Array.from(document.querySelectorAll(".cf-item"));
    const left = document.querySelector(".cf-arrow-left");
    const right = document.querySelector(".cf-arrow-right");

    let current = 0;

    function update() {
        items.forEach((item, i) => {

            const offset = i - current;
            const abs = Math.abs(offset);

            /* Abstand horizontal */
            const baseX = 260;
            const x = offset * baseX;

            /* Größe */
            const scale = (i === current)
                ? 1.7               // Fokusbuch groß
                : 1.0 - abs * 0.15; // Nebenbücher kleiner

            /* Tiefe */
            const z = (i === current)
                ? 350
                : 200 - abs * 120;

            /* leichte Rotation */
            const rot = offset * -35;

            /* Sichtbarkeit */
            const opacity = Math.max(0, 1 - abs * 0.3);

            item.style.opacity = opacity;

            /* FINAL TRANSFORM – zentriert */
            item.style.transform = `
                translate(-50%, -50%)
                translateX(${x}px)
                translateZ(${z}px)
                rotateY(${rot}deg)
                scale(${scale})
            `;

            /* Aktivstate */
            if (i === current) {
                item.classList.add("is-active");
            } else {
                item.classList.remove("is-active");
            }
        });
    }

    function go(n) {
        current = Math.max(0, Math.min(n, items.length - 1));
        update();
    }

    /* Pfeile */
    left.addEventListener("click", () => go(current - 1));
    right.addEventListener("click", () => go(current + 1));

    /* Klick auf Buch */
    items.forEach((item, index) => {
        item.addEventListener("click", () => {
            if (index === current) {
                console.log("Open book:", item.querySelector(".cf-title")?.textContent);
            } else {
                go(index);
            }
        });
    });

    /* Keyboard */
    document.addEventListener("keydown", e => {
        if (e.key === "ArrowLeft") go(current - 1);
        if (e.key === "ArrowRight") go(current + 1);
        if (e.key === "Enter") items[current].click();
    });

    update();
});
