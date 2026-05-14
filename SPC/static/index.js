const imageInput =
document.getElementById("imageInput");

const imageContainer =
document.getElementById("imageContainer");

const countText =
document.getElementById("countText");

const saveBtn =
document.getElementById("saveBtn");

const importJsonBtn =
document.getElementById("importJsonBtn");

const jsonInput =
document.getElementById("jsonInput");

const categorySelect =
document.getElementById("categorySelect");

const createCategoryBtn =
document.getElementById("createCategoryBtn");

const newCategoryInput =
document.getElementById("newCategoryInput");

const galleryUploadInput =
document.getElementById("galleryUploadInput");

const uploadGalleryBtn =
document.getElementById("uploadGalleryBtn");

let selectedImages = [];

let galleryData = {};

/* ---------- UPDATE COUNT ---------- */

function updateCount() {

  countText.textContent =
  `Images selected for slideshow: ${selectedImages.length}`;

}

/* ---------- CREATE IMAGE CARD ---------- */

function createImageCard(src) {

  const wrapper =
  document.createElement("div");

  wrapper.className = "imgWrapper";

  const img =
  document.createElement("img");

  img.src = src;

  const counter =
  document.createElement("div");

  counter.className = "counter";
  counter.textContent = "0";

  const addBtn =
  document.createElement("button");

  addBtn.textContent = "+";
  addBtn.className = "addBtn";

  const removeBtn =
  document.createElement("button");

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

      const idx =
      selectedImages.indexOf(src);

      if (idx !== -1) {

        selectedImages.splice(idx, 1);

      }

      updateCount();

    }

  };

  wrapper.appendChild(img);
  wrapper.appendChild(counter);
  wrapper.appendChild(addBtn);
  wrapper.appendChild(removeBtn);

  imageContainer.appendChild(wrapper);

}

/* ---------- NORMAL IMAGE SELECT ---------- */

imageInput.addEventListener("change", function () {

  imageContainer.innerHTML = "";

  selectedImages = [];

  updateCount();

  Array.from(this.files).forEach(file => {

    const reader = new FileReader();

    reader.onload = e => {

      createImageCard(e.target.result);

    };

    reader.readAsDataURL(file);

  });

});

/* ---------- CREATE CATEGORY ---------- */

createCategoryBtn.onclick = () => {

  const category =
  newCategoryInput.value.trim();

  if (!category) {

    alert("Enter category name");

    return;

  }

  fetch("/create-category", {

    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify({
      category: category
    })

  })

  .then(res => res.json())

  .then(data => {

    if (data.ok) {

      alert("Category created");

      location.reload();

    } else {

      alert(data.error || "Failed");

    }

  });

};

/* ---------- LOAD GALLERY ---------- */

fetch("/get-gallery")

.then(res => res.json())

.then(data => {

  galleryData = data;

  Object.keys(data).forEach(category => {

    const option =
    document.createElement("option");

    option.value = category;

    option.textContent = category;

    categorySelect.appendChild(option);

  });

});

/* ---------- CATEGORY CHANGE ---------- */

categorySelect.onchange = () => {

  const category =
  categorySelect.value;

  imageContainer.innerHTML = "";

  if (!galleryData[category]) return;

  galleryData[category].forEach(src => {

    createImageCard(src);

  });

};

/* ---------- UPLOAD TO CATEGORY ---------- */

uploadGalleryBtn.onclick = async () => {

  const category =
  categorySelect.value;

  if (!category) {

    alert("Select category first");

    return;

  }

  const files =
  galleryUploadInput.files;

  if (files.length === 0) {

    alert("Choose images");

    return;

  }

  const formData =
  new FormData();

  formData.append(
    "category",
    category
  );

  for (let file of files) {

    formData.append(
      "images",
      file
    );

  }

  const res = await fetch(
    "/upload-category-images",
    {
      method: "POST",
      body: formData
    }
  );

  const data = await res.json();

  if (data.ok) {

    alert("Images uploaded");

    location.reload();

  } else {

    alert(data.error || "Upload failed");

  }

};

/* ---------- SAVE & CONTINUE ---------- */

saveBtn.onclick = () => {

  if (selectedImages.length === 0) {

    alert("Please add images");

    return;

  }

  const filename =
  prompt("Enter slideshow name");

  if (!filename) return;

  const data = {

    slideSpeed: 2,

    images:
    selectedImages.map(
      (src, index) => ({
        order: index,
        src: src
      })
    )

  };

  fetch("/save", {

    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify({

      filename:
      filename + ".json",

      data: data

    })

  })

  .then(res => res.json())

  .then(() => {

    localStorage.setItem(
      "selectedImages",
      JSON.stringify(selectedImages)
    );

    localStorage.setItem(
      "slideSpeed",
      "2"
    );

    window.location.href =
    "/preview";

  })

  .catch(() => {

    alert("Save failed");

  });

};

/* ---------- IMPORT JSON ---------- */

importJsonBtn.onclick = () => {

  jsonInput.click();

};

jsonInput.onchange = function () {

  const file =
  this.files[0];

  if (!file) return;

  const reader =
  new FileReader();

  reader.onload = e => {

    try {

      const data =
      JSON.parse(e.target.result);

      if (
        !data.images ||
        !Array.isArray(data.images)
      ) {

        alert("Invalid JSON");

        return;

      }

      const images =
      data.images

      .sort(
        (a, b) =>
        a.order - b.order
      )

      .map(img => img.src);

      localStorage.setItem(
        "selectedImages",
        JSON.stringify(images)
      );

      localStorage.setItem(
        "slideSpeed",
        data.slideSpeed || 2
      );

      window.location.href =
      "/preview";

    } catch {

      alert("Invalid JSON file");

    }

  };

  reader.readAsText(file);

};