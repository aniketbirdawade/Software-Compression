// Get selected images stored from the first page
const selectedImages = JSON.parse(
  localStorage.getItem("selectedImages") || "[]"
);

// Get required DOM elements
const imageGrid = document.getElementById("imageGrid");
const customizeBtn = document.getElementById("customizeBtn");
const dummyButtons = document.getElementById("dummyButtons");
const readyBtn = document.getElementById("readyBtn");

// Flag to ensure dragging is enabled only once
let isDraggable = false;

/* ---------------- LOAD SELECTED IMAGES ---------------- */

// Display all selected images inside preview container
selectedImages.forEach((src) => {
  const img = document.createElement("img");
  img.src = src;
  imageGrid.appendChild(img);
});

/* ---------------- DRAGGABLE FUNCTION ---------------- */
/* Makes a single element draggable */

function makeDraggable(el) {
  // Convert element to absolute positioning
  el.style.position = "absolute";

  // Set initial position to avoid jumping on drag start
  el.style.left = el.offsetLeft + "px";
  el.style.top = el.offsetTop + "px";

  let startX = 0,
    startY = 0;

  // Mouse down → start dragging
  el.onmousedown = function (e) {
    e.preventDefault();

    // Store initial mouse position
    startX = e.clientX;
    startY = e.clientY;

    // Track mouse movement
    document.onmousemove = drag;

    // Stop dragging on mouse release
    document.onmouseup = stop;
  };

  // Move element as mouse moves
  function drag(e) {
    el.style.left = el.offsetLeft + (e.clientX - startX) + "px";
    el.style.top = el.offsetTop + (e.clientY - startY) + "px";

    // Update mouse position
    startX = e.clientX;
    startY = e.clientY;
  }

  // Stop dragging
  function stop() {
    document.onmousemove = null;
    document.onmouseup = null;
  }
}

/* ---------------- ENABLE DRAGGING ---------------- */

// Enable drag functionality for each button
customizeBtn.onclick = () => {
  if (!isDraggable) {
    dummyButtons
      .querySelectorAll("button")
      .forEach((btn) => makeDraggable(btn));

    customizeBtn.textContent = "Dragging Enabled";
    isDraggable = true;
  }
};

/* ---------------- SAVE POSITIONS & OPEN SLIDESHOW ---------------- */

// Save button positions and move to slideshow page
readyBtn.onclick = () => {
  const positions = {};

  // Store left & top position of each button
  dummyButtons.querySelectorAll("button").forEach((btn) => {
    positions[btn.id] = {
      left: btn.style.left,
      top: btn.style.top,
    };
  });

  // Save button positions to localStorage
  localStorage.setItem("buttonPositions", JSON.stringify(positions));

  // Open slideshow page in new tab
  window.open("slideshow.html", "_blank");
};