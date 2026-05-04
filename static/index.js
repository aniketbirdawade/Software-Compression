const imageInput = document.getElementById("imageInput");
const imageContainer = document.getElementById("imageContainer");
const countText = document.getElementById("countText");
const saveBtn = document.getElementById("saveBtn");
const importJsonBtn = document.getElementById("importJsonBtn");
const jsonInput = document.getElementById("jsonInput");

// selectedImages is array of base64 src strings (duplicated by count)
let selectedImages = [];

/* -------- IMAGE SELECTION -------- */
imageInput.addEventListener("change", function () {
  imageContainer.innerHTML = "";
  selectedImages = [];
  updateCount();

  Array.from(this.files).forEach(file => {
    const reader = new FileReader();

    reader.onload = e => {
      const src = e.target.result;

      const wrapper = document.createElement("div");
      wrapper.className = "imgWrapper";

      const img = document.createElement("img");
      img.src = src;

      const counter = document.createElement("div");
      counter.className = "counter";
      counter.textContent = "0";

      const addBtn = document.createElement("button");
      addBtn.textContent = "+";
      addBtn.className = "addBtn";

      const removeBtn = document.createElement("button");
      removeBtn.textContent = "−";
      removeBtn.className = "removeBtn";

      let count = 0;

      addBtn.onclick = () => {
        count++;
        counter.textContent = count;
        selectedImages.push(src);
        updateCount();
      };

      removeBtn.onclick = () => {
        if (count > 0) {
          count--;
          counter.textContent = count;
          const idx = selectedImages.indexOf(src);
          if (idx !== -1) selectedImages.splice(idx, 1);
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
  countText.textContent = `Images selected for slideshow: ${selectedImages.length}`;
}

/* -------- SAVE & CONTINUE -------- */
saveBtn.onclick = () => {
  if (selectedImages.length === 0) {
    alert("Please add at least one image using the + button.");
    return;
  }

  const filename = prompt("Enter a name for this slideshow:");
  if (!filename || !filename.trim()) return;

  const data = {
    slideSpeed: 2,
    images: selectedImages.map((src, index) => ({ order: index, src }))
  };

  // Save to server
  fetch("/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: filename.trim() + ".json", data })
  })
  .then(res => res.json())
  .then(() => {
    // Also store in localStorage for preview page
    localStorage.setItem("selectedImages", JSON.stringify(selectedImages));
    localStorage.setItem("slideSpeed", "2");
    window.location.href = "/preview";
  })
  .catch(() => {
    alert("Failed to save. Please try again.");
  });
};

/* -------- IMPORT JSON -------- */
importJsonBtn.onclick = () => jsonInput.click();

jsonInput.onchange = function () {
  const file = this.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);

      if (!data.images || !Array.isArray(data.images)) {
        alert("Invalid slideshow JSON file.");
        return;
      }

      const images = data.images
        .sort((a, b) => a.order - b.order)
        .map(img => img.src);

      localStorage.setItem("selectedImages", JSON.stringify(images));
      localStorage.setItem("slideSpeed", data.slideSpeed || 2);

      window.location.href = "/preview";
    } catch {
      alert("Failed to read JSON file.");
    }
  };
  reader.readAsText(file);
};