// animations.js – global fancy stuff for shelves.

document.addEventListener("DOMContentLoaded", () => {

    /* 1) Scroll Reveal */
    const reveals = Array.from(document.querySelectorAll(".reveal"));
    function handleReveal() {
        const vh = window.innerHeight;
        reveals.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < vh - 80) {
                el.classList.add("visible");
            }
        });
    }
    handleReveal();
    document.addEventListener("scroll", handleReveal);

    /* 2) Tilt Cards */
    const tilts = document.querySelectorAll(".tilt");
    tilts.forEach(card => {
        card.addEventListener("mousemove", e => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            const rotateX = (y - 0.5) * 8;   // up/down
            const rotateY = (x - 0.5) * -8; // left/right
            card.style.transform =
                `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
        card.addEventListener("mouseleave", () => {
            card.style.transform = "perspective(700px) rotateX(0) rotateY(0)";
        });
    });

    /* 3) Page transition overlay */
    let overlay = document.querySelector(".page-transition-overlay");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.className = "page-transition-overlay";
        document.body.appendChild(overlay);
    }

    document.querySelectorAll("a[data-transition]").forEach(link => {
        link.addEventListener("click", e => {
            const href = link.getAttribute("href");
            if (!href || href.startsWith("#")) return;
            e.preventDefault();
            overlay.classList.add("active");
            setTimeout(() => {
                window.location.href = href;
            }, 340);
        });
    });

    /* 4) Background particles */
    if (!document.getElementById("bgParticles")) {
        const layer = document.createElement("div");
        layer.id = "bgParticles";
        document.body.appendChild(layer);

        const count = 26;
        for (let i = 0; i < count; i++) {
            const p = document.createElement("div");
            p.className = "particle";
            p.style.left = Math.random() * 100 + "vw";
            p.style.top  = 20 + Math.random() * 80 + "vh";
            p.style.animationDelay = (Math.random() * 10) + "s";
            p.style.animationDuration = (10 + Math.random() * 10) + "s";
            layer.appendChild(p);
        }
    }
});
