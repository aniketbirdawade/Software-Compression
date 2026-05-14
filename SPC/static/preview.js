let selectedImages = JSON.parse(localStorage.getItem("selectedImages") || "[]");
let slideSpeed = parseFloat(localStorage.getItem("slideSpeed") || "2");

const imageGrid = document.getElementById("imageGrid");
const customizeBtn = document.getElementById("customizeBtn");
const dummyButtons = document.getElementById("dummyButtons");
const readyBtn = document.getElementById("readyBtn");

let draggedEl = null;
let isDraggableEnabled = false;

/* -------- RENDER IMAGE GRID -------- */
function renderImages() {
  imageGrid.innerHTML = "";

  if (selectedImages.length === 0) {
    imageGrid.innerHTML = "<p style='color:#888;'>No images found. Go back and add images.</p>";
    return;
  }

  selectedImages.forEach((src, index) => {
    const img = document.createElement("img");
    img.src = src;
    img.draggable = true;
    img.dataset.index = index;
    img.className = "grid-img";

    img.ondragstart = () => {
      draggedEl = img;
      setTimeout(() => img.classList.add("dragging"), 0);
    };

    img.ondragend = () => {
      img.classList.remove("dragging");
      draggedEl = null;
    };

    img.ondragover = e => e.preventDefault();

    img.ondrop = () => {
      if (!draggedEl || draggedEl === img) return;
      const from = +draggedEl.dataset.index;
      const to = +img.dataset.index;
      const moved = selectedImages.splice(from, 1)[0];
      selectedImages.splice(to, 0, moved);
      localStorage.setItem("selectedImages", JSON.stringify(selectedImages));
      renderImages();
    };

    imageGrid.appendChild(img);
  });
}

renderImages();

/* -------- CUSTOMIZE BUTTONS (make draggable) -------- */
function makeDraggable(el) {
  el.style.position = "absolute";
  el.style.cursor = "grab";

  let startX, startY;

  el.onmousedown = e => {
    e.preventDefault();
    startX = e.clientX;
    startY = e.clientY;
    el.style.cursor = "grabbing";

    document.onmousemove = e2 => {
      const dx = e2.clientX - startX;
      const dy = e2.clientY - startY;
      el.style.left = (el.offsetLeft + dx) + "px";
      el.style.top = (el.offsetTop + dy) + "px";
      startX = e2.clientX;
      startY = e2.clientY;
    };

    document.onmouseup = () => {
      el.style.cursor = "grab";
      document.onmousemove = null;
      document.onmouseup = null;
    };
  };
}

customizeBtn.onclick = () => {
  if (!isDraggableEnabled) {
    // Make the container relative so absolute positions work
    dummyButtons.style.position = "relative";
    dummyButtons.style.height = "200px";
    dummyButtons.style.border = "2px dashed #aaa";
    dummyButtons.style.borderRadius = "8px";
    dummyButtons.style.marginTop = "10px";

    // Position each button initially
    const btns = dummyButtons.querySelectorAll("button");
    let leftOffset = 10;
    btns.forEach(btn => {
      btn.style.left = leftOffset + "px";
      btn.style.top = "80px";
      leftOffset += 120;
      makeDraggable(btn);
    });

    isDraggableEnabled = true;
    customizeBtn.textContent = "✅ Done Customizing";
  }
};

/* -------- READY: save positions → go to slideshow -------- */
readyBtn.onclick = () => {
  if (selectedImages.length === 0) {
    alert("No images to show. Please go back and add images.");
    return;
  }

  // Save button positions if customized
  const positions = {};
  dummyButtons.querySelectorAll("button").forEach(btn => {
    positions[btn.id] = {
      left: btn.style.left || "",
      top: btn.style.top || ""
    };
  });

  localStorage.setItem("buttonPositions", JSON.stringify(positions));
  localStorage.setItem("selectedImages", JSON.stringify(selectedImages));

  window.location.href = "/slideshow";
};