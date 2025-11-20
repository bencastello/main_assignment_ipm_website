const filterButton = document.getElementById("filterButton");
const filterMenu = document.getElementById("filterMenu");
const overlay = document.getElementById("overlay");
const submenuGenres = document.getElementById("submenu-genres");
const submenuPrice = document.getElementById("submenu-price");
const submenuSort = document.getElementById("submenu-sortby");

// Open filter menu
filterButton.onclick = () => {
  filterMenu.classList.remove("hidden");
  overlay.classList.remove("hidden");
};

// Close all menus when clicking overlay
overlay.onclick = () => {
  filterMenu.classList.add("hidden");
  submenuGenres.classList.add("hidden");
  submenuPrice.classList.add("hidden");
  submenuSort.classList.add("hidden");
  overlay.classList.add("hidden");
};

// Handle submenu opening/closing
document.querySelectorAll(".filter-list li").forEach(item => {
  item.addEventListener("click", (e) => {
    const menuType = item.dataset.menu;
    
    // If "Apply Filters" is clicked, close everything
    if (menuType === "apply") {
      filterMenu.classList.add("hidden");
      submenuGenres.classList.add("hidden");
      submenuPrice.classList.add("hidden");
      submenuSort.classList.add("hidden");
      overlay.classList.add("hidden");
      return;
    }
    
    // Get the submenu to show
    let targetSubmenu = null;
    if (menuType === "genres") targetSubmenu = submenuGenres;
    if (menuType === "price") targetSubmenu = submenuPrice;
    if (menuType === "sortby") targetSubmenu = submenuSort;
    
    // Check if this submenu is already open
    const isAlreadyOpen = !targetSubmenu.classList.contains("hidden");
    
    // Close all submenus first
    submenuGenres.classList.add("hidden");
    submenuPrice.classList.add("hidden");
    submenuSort.classList.add("hidden");
    
    // If it wasn't open, open it now (toggle behavior)
    if (!isAlreadyOpen && targetSubmenu) {
      targetSubmenu.classList.remove("hidden");
    
      /* This code is used when letting the submenu box appear on top of the filter box
      // Position submenu right below the clicked item
      const itemRect = item.getBoundingClientRect();
      const menuRect = filterMenu.getBoundingClientRect();
      
      targetSubmenu.style.top = (itemRect.bottom - menuRect.top) + "px";
      targetSubmenu.style.left = "0";
      */
    }
  });
});

/* ------------------------------
   LIVE PRICE SLIDER UPDATE
--------------------------------*/
const minSlider = document.getElementById("priceMin");
const maxSlider = document.getElementById("priceMax");
const priceLabel2 = document.querySelector(".price-label");

// Dynamische aktive Leiste
const track = document.querySelector(".slider-track");
let activeRange = document.createElement("div");
activeRange.classList.add("slider-active-range");
track.appendChild(activeRange);

function updateSlider() {
  let minVal = parseInt(minSlider.value);
  let maxVal = parseInt(maxSlider.value);
  
  // Thumbs dürfen sich nicht kreuzen
  if (minVal > maxVal - 1) {
    minSlider.value = maxVal - 1;
    minVal = maxVal - 1;
  }
  if (maxVal < minVal + 1) {
    maxSlider.value = minVal + 1;
    maxVal = minVal + 1;
  }
  
  let percentMin = (minVal / 100) * 100;
  let percentMax = (maxVal / 100) * 100;
  
  activeRange.style.left = percentMin + "%";
  activeRange.style.right = (100 - percentMax) + "%";
  
  // Live Text
  priceLabel2.textContent = `${minVal}€ – ${maxVal}€`;
}

minSlider.addEventListener("input", updateSlider);
maxSlider.addEventListener("input", updateSlider);

// Initial
updateSlider();