document.addEventListener("DOMContentLoaded", () => {
    // Elements
    const profileImg = document.getElementById("profileImg");
    const avatarClickable = document.getElementById("avatarClickable");

    const displayUsername = document.getElementById("displayUsername");
    const displayRealname = document.getElementById("displayRealname");
    const displayBio = document.getElementById("displayBio");

    const openEditBtn = document.getElementById("openEditBtn");
    const modalOverlay = document.getElementById("modalOverlay");
    const editModal = document.getElementById("editModal");
    const photoModal = document.getElementById("photoModal");

    const editUsernameInput = document.getElementById("editUsername");
    const editRealnameInput = document.getElementById("editRealname");
    const editBioInput = document.getElementById("editBio");
    const saveProfileBtn = document.getElementById("saveProfileBtn");
    const cancelEditBtn = document.getElementById("cancelEditBtn");

    const uploadInput = document.getElementById("uploadInput");
    const randomAvatarBtn = document.getElementById("randomAvatarBtn");

    const pills = Array.from(document.querySelectorAll(".pill"));
    const progressFills = Array.from(document.querySelectorAll(".progress-fill"));


    // ==============
    // Initial Avatar
    // ==============
    if (!profileImg.src) {
        const seed = Math.floor(Math.random() * 100000);
        profileImg.src = `https://api.dicebear.com/7.x/thumbs/svg?seed=${seed}`;
    }


    // ==============
    // Progress Anim
    // ==============
    progressFills.forEach(fill => {
        const target = Number(fill.dataset.progress || "0");
        requestAnimationFrame(() => {
            fill.style.width = `${target}%`;
        });
    });


    // ==============
    // Preferences Pills
    // ==============
    pills.forEach(pill => {
        pill.addEventListener("click", () => {
            pill.classList.toggle("selected");
        });
    });


    // ==============
    // Modals helper
    // ==============
    function openModal(modal) {
        modalOverlay.classList.remove("hidden");
        modal.classList.remove("hidden");
        requestAnimationFrame(() => {
            modal.classList.add("visible");
        });
    }

    function closeModal(modal) {
        modal.classList.remove("visible");
        setTimeout(() => {
            modal.classList.add("hidden");
            if (!document.querySelector(".modal.visible")) {
                modalOverlay.classList.add("hidden");
            }
        }, 180);
    }


    // ==============
    // Edit Profile Modal
    // ==============
    openEditBtn.addEventListener("click", () => {
        editUsernameInput.value = displayUsername.textContent.trim();
        editRealnameInput.value = displayRealname.textContent.trim();
        editBioInput.value = displayBio.textContent.trim();
        openModal(editModal);
    });

    saveProfileBtn.addEventListener("click", () => {
        const newUser = editUsernameInput.value.trim();
        const newReal = editRealnameInput.value.trim();
        const newBio = editBioInput.value.trim();

        if (newUser) displayUsername.textContent = newUser;
        if (newReal) displayRealname.textContent = newReal;
        displayBio.textContent = newBio || displayBio.textContent;

        closeModal(editModal);
    });

    cancelEditBtn.addEventListener("click", () => {
        closeModal(editModal);
    });


    // ==============
    // Photo Modal
    // ==============
    function openPhotoModal() {
        openModal(photoModal);
    }

    avatarClickable.addEventListener("click", openPhotoModal);

    randomAvatarBtn.addEventListener("click", () => {
        const seed = Math.floor(Math.random() * 100000);
        profileImg.src = `https://api.dicebear.com/7.x/thumbs/svg?seed=${seed}`;
        closeModal(photoModal);
    });

    uploadInput.addEventListener("change", e => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            profileImg.src = reader.result;
        };
        reader.readAsDataURL(file);
        closeModal(photoModal);
    });


    // ==============
    // Overlay & ESC
    // ==============
    modalOverlay.addEventListener("click", () => {
        [editModal, photoModal].forEach(m => {
            if (!m.classList.contains("hidden")) {
                closeModal(m);
            }
        });
    });

    document.addEventListener("keydown", e => {
        if (e.key === "Escape") {
            [editModal, photoModal].forEach(m => {
                if (!m.classList.contains("hidden")) {
                    closeModal(m);
                }
            });
        }
    });
});
