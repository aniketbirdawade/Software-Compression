const slideshowContainer = document.getElementById("slideshowContainer");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const speedInput = document.getElementById("speedInput");
const applySpeedBtn = document.getElementById("applySpeedBtn");
const fullscreenBtn = document.getElementById("fullscreenBtn");
const saveJsonBtn = document.getElementById("saveJsonBtn");
const controls = document.getElementById("controls");

// window.selectedImages and window.slideSpeed are set inline in the HTML
let selectedImages = window.selectedImages || [];
let slideSpeed = window.slideSpeed || 2;
let currentIndex = 0;
let intervalId = null;

speedInput.value = slideSpeed;

/* -------- APPLY SAVED BUTTON POSITIONS -------- */
if (window.buttonPositions) {
  const positions = window.buttonPositions;
  Object.keys(positions).forEach(id => {
    // Map preview button ids to slideshow button ids
    const map = {
      "btn-prev": "prevBtn",
      "btn-start": "startBtn",
      "btn-stop": "stopBtn",
      "btn-next": "nextBtn"
    };
    const realId = map[id] || id;
    const el = document.getElementById(realId);
    if (el && positions[id].left) {
      el.style.position = "relative";
      el.style.left = positions[id].left;
      el.style.top = positions[id].top;
    }
  });
}

/* -------- SHOW IMAGE -------- */
function showImage() {
  if (!selectedImages || selectedImages.length === 0) {
    slideshowContainer.innerHTML = "<p class='no-img'>No images loaded.</p>";
    return;
  }

  const item = selectedImages[currentIndex];
  const src = (typeof item === "object" && item.src) ? item.src : item;

  slideshowContainer.innerHTML = "";
  const img = document.createElement("img");
  img.src = src;
  img.className = "slide-img";
  slideshowContainer.appendChild(img);

  // Update counter if present
  updateCounter();
}

function updateCounter() {
  let counter = document.getElementById("slideCounter");
  if (!counter) {
    counter = document.createElement("div");
    counter.id = "slideCounter";
    counter.className = "slide-counter";
    slideshowContainer.appendChild(counter);
  }
  counter.textContent = `${currentIndex + 1} / ${selectedImages.length}`;
}

/* -------- NAVIGATION -------- */
prevBtn.onclick = () => {
  currentIndex = (currentIndex - 1 + selectedImages.length) % selectedImages.length;
  showImage();
};

nextBtn.onclick = () => {
  currentIndex = (currentIndex + 1) % selectedImages.length;
  showImage();
};

/* -------- START / STOP -------- */
startBtn.onclick = () => {
  if (!intervalId) {
    intervalId = setInterval(() => {
      currentIndex = (currentIndex + 1) % selectedImages.length;
      showImage();
    }, slideSpeed * 1000);
    startBtn.disabled = true;
    stopBtn.disabled = false;
  }
};

stopBtn.onclick = () => {
  clearInterval(intervalId);
  intervalId = null;
  startBtn.disabled = false;
  stopBtn.disabled = true;
};
stopBtn.disabled = true;

/* -------- APPLY SPEED -------- */
applySpeedBtn.onclick = () => {
  const val = parseFloat(speedInput.value);
  if (!val || val <= 0) {
    alert("Enter a valid speed (e.g. 2)");
    return;
  }
  slideSpeed = val;

  if (intervalId) {
    clearInterval(intervalId);
    intervalId = setInterval(() => {
      currentIndex = (currentIndex + 1) % selectedImages.length;
      showImage();
    }, slideSpeed * 1000);
  }
};

/* -------- FULLSCREEN -------- */
fullscreenBtn.onclick = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
    fullscreenBtn.textContent = "Exit Fullscreen";
  } else {
    document.exitFullscreen();
    fullscreenBtn.textContent = "⛶ Fullscreen";
  }
};

/* -------- SAVE JSON (download) -------- */
saveJsonBtn.onclick = () => {
  if (!selectedImages || selectedImages.length === 0) {
    alert("No images to save.");
    return;
  }

  const data = {
    slideSpeed: slideSpeed,
    images: selectedImages.map((item, index) => ({
      order: index,
      src: (typeof item === "object" && item.src) ? item.src : item
    }))
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "slideshow-data.json";
  a.click();
  URL.revokeObjectURL(a.href);
};

/* -------- INIT -------- */
showImage();