let selectedImages =
  JSON.parse(localStorage.getItem("selectedImages") || "[]");

const imageGrid = document.getElementById("imageGrid");
const customizeBtn = document.getElementById("customizeBtn");
const dummyButtons = document.getElementById("dummyButtons");
const readyBtn = document.getElementById("readyBtn");

let draggedImage = null;
let isDraggableButtons = false;

function renderImages() {
  imageGrid.innerHTML = "";
  selectedImages.forEach((src, index) => {
    const img = document.createElement("img");
    img.src = src;
    img.draggable = true;
    img.dataset.index = index;

    img.ondragstart = () => {
      draggedImage = img;
      img.classList.add("dragging");
    };

    img.ondragend = () => {
      img.classList.remove("dragging");
      draggedImage = null;
    };

    img.ondragover = e => e.preventDefault();

    img.ondrop = () => {
      if (!draggedImage || draggedImage === img) return;

      const from = +draggedImage.dataset.index;
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

/* Button dragging */
function makeDraggable(el) {
  el.style.position = "absolute";
  el.style.left = el.offsetLeft + "px";
  el.style.top = el.offsetTop + "px";

  let startX, startY;

  el.onmousedown = e => {
    startX = e.clientX;
    startY = e.clientY;
    document.onmousemove = drag;
    document.onmouseup = stop;
  };

  function drag(e) {
    el.style.left = el.offsetLeft + (e.clientX - startX) + "px";
    el.style.top = el.offsetTop + (e.clientY - startY) + "px";
    startX = e.clientX;
    startY = e.clientY;
  }

  function stop() {
    document.onmousemove = null;
    document.onmouseup = null;
  }
}

customizeBtn.onclick = () => {
  if (!isDraggableButtons) {
    dummyButtons.querySelectorAll("button").forEach(makeDraggable);
    isDraggableButtons = true;
  }
};

readyBtn.onclick = () => {
  const positions = {};
  dummyButtons.querySelectorAll("button").forEach(btn => {
    positions[btn.id] = {
      left: btn.style.left,
      top: btn.style.top
    };
  });

  localStorage.setItem("buttonPositions", JSON.stringify(positions));
  window.open("slideshow.html", "_blank");
};