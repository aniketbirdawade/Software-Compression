const imageInput = document.getElementById("imageInput");
const imageContainer = document.getElementById("imageContainer");
const countText = document.getElementById("countText");
const saveBtn = document.getElementById("saveBtn");

const importJsonBtn = document.getElementById("importJsonBtn");
const jsonInput = document.getElementById("jsonInput");

let selectedImages = [];

/* ---------------- IMAGE SELECTION FLOW ---------------- */

imageInput.addEventListener("change", function () {
  imageContainer.innerHTML = "";
  selectedImages = [];
  updateCount();

  Array.from(this.files).forEach(file => {
  const reader = new FileReader();

  reader.onload = e => {

    const wrapper = document.createElement("div");
    wrapper.className = "imgWrapper";

    const img = document.createElement("img");
    img.src = e.target.result;

    const counter = document.createElement("div");
    counter.className = "counter";
    counter.textContent = "0";

    const addBtn = document.createElement("button");
    addBtn.textContent = "+";
    addBtn.className = "addBtn";

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "-";
    removeBtn.className = "removeBtn";

    let count = 0;

    addBtn.onclick = () => {
      count++;
      counter.textContent = count;
      selectedImages.push(img.src);
      updateCount();
    };

    removeBtn.onclick = () => {
      if (count > 0) {
        count--;
        counter.textContent = count;

        const index = selectedImages.indexOf(img.src);
        if (index !== -1) {
          selectedImages.splice(index, 1);
        }

        updateCount();
      }
    };

    wrapper.appendChild(img);
    wrapper.appendChild(counter);
    wrapper.appendChild(addBtn);
    wrapper.appendChild(removeBtn);

    imageContainer.appendChild(wrapper);
  };

  reader.readAsDataURL(file);
});
});

function updateCount() {
  countText.textContent =
    `Images selected for slideshow: ${selectedImages.length}`;
}

saveBtn.onclick = () => {
  if (selectedImages.length === 0) {
    alert("No images selected");
    return;
  }
  localStorage.setItem("selectedImages", JSON.stringify(selectedImages));
  window.open("preview.html", "_blank");
};

/* ---------------- IMPORT JSON FLOW ---------------- */

// Trigger hidden file input
importJsonBtn.onclick = () => {
  jsonInput.click();
};

// Handle JSON selection
jsonInput.onchange = function () {
  const file = this.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);

      // BASIC VALIDATION
      if (!data.images || !Array.isArray(data.images)) {
        alert("Invalid slideshow JSON file");
        return;
      }

      // Restore images (order preserved)
      const images = data.images
        .sort((a, b) => a.order - b.order)
        .map(img => img.src);

      localStorage.setItem("selectedImages", JSON.stringify(images));

      // Restore speed if present
      if (data.slideSpeed) {
        localStorage.setItem("slideSpeed", data.slideSpeed);
      }

      // Go directly to slideshow
      window.open("slideshow.html", "_blank");

    } catch (err) {
      alert("Failed to read JSON file");
    }
  };

  reader.readAsText(file);
};
