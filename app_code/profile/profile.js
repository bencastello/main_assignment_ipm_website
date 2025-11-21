/* === for the PROFILE PICTURE SELECTION === */

const profilePicture = document.getElementById('profilePicture');
const overlay = document.getElementById('pictureOverlay');
const selectionBox = document.getElementById('selectionBox');
const galleryBox = document.getElementById('galleryBox');
const randomAvatarBtn = document.getElementById('randomAvatar');
const fromLibraryBtn = document.getElementById('fromLibrary');
const galleryItems = document.querySelectorAll('.gallery-item');

// Öffne Selection Box beim Klick auf Profilbild
profilePicture.addEventListener('click', () => {
    overlay.classList.remove('hidden');
    selectionBox.classList.remove('hidden');
});

// Schließe alles beim Klick auf Overlay
overlay.addEventListener('click', () => {
    overlay.classList.add('hidden');
    selectionBox.classList.add('hidden');
    galleryBox.classList.add('hidden');
});

// Random Avatar → Schließe alles
randomAvatarBtn.addEventListener('click', () => {
    overlay.classList.add('hidden');
    selectionBox.classList.add('hidden');
    // Hier kannst du später einen zufälligen Avatar setzen
});

// From Library → Zeige Galerie
fromLibraryBtn.addEventListener('click', () => {
    selectionBox.classList.add('hidden');
    galleryBox.classList.remove('hidden');
});

// Galerie Item geklickt → Zurück zur Profilseite
galleryItems.forEach(item => {
    item.addEventListener('click', () => {
        overlay.classList.add('hidden');
        galleryBox.classList.add('hidden');
        // Hier kannst du später das ausgewählte Bild setzen
    });
});


/* === for the GENRES === */

const modifyBtn = document.getElementById('modifyBtn');
const genreLabels = document.querySelectorAll('.genre-list label');
let isModifyMode = false;

modifyBtn.addEventListener('click', () => {
    if (!isModifyMode) {
        // MODIFY MODE: Verstecke nicht-ausgewählte
        genreLabels.forEach(label => {
            const checkbox = label.querySelector('input[type="checkbox"]');
            if (!checkbox.checked) {
                label.classList.add('hidden');
            }
        });
        modifyBtn.textContent = 'Modify';
        isModifyMode = true;
    } else {
        // ZURÜCK: Zeige alle wieder
        genreLabels.forEach(label => {
            label.classList.remove('hidden');
        });
        isModifyMode = false;
    }
});

