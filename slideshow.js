// Get selected slideshow images from localStorage
const selectedImages = JSON.parse(
  localStorage.getItem("selectedImages") || "[]"
);

// Get saved button positions from preview page
const buttonPositions = JSON.parse(
  localStorage.getItem("buttonPositions") || {}
);

// Get DOM elements
const slideshowContainer = document.getElementById("slideshowContainer");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");

// Slideshow state variables
let currentIndex = 0;
let intervalId = null;

/* ---------------- SHOW IMAGE ---------------- */

// Display current image in slideshow container
function showImage() {
  slideshowContainer.innerHTML = 
    `<img src="${selectedImages[currentIndex]}">`;
}

/* ---------------- BUTTON ACTIONS ---------------- */

// Show previous image
prevBtn.onclick = () => {
  currentIndex =
    (currentIndex - 1 + selectedImages.length) % selectedImages.length;
  showImage();
};

// Show next image
nextBtn.onclick = () => {
  currentIndex = (currentIndex + 1) % selectedImages.length;
  showImage();
};

// Start automatic slideshow
startBtn.onclick = () => {
  if (!intervalId) {
    intervalId = setInterval(nextBtn.onclick, 2000); // 2 seconds per slide
  }
};

// Stop automatic slideshow
stopBtn.onclick = () => {
  clearInterval(intervalId);
  intervalId = null;
};

// Show first image when page loads
showImage();

/* ---------------- APPLY SAVED BUTTON POSITIONS ---------------- */

// Restore button positions saved from preview page
Object.keys(buttonPositions).forEach((id) => {
  const btn = document.getElementById(id);
  if (btn) {
    btn.style.position = "absolute";
    btn.style.left = buttonPositions[id].left;
    btn.style.top = buttonPositions[id].top;
  }
});