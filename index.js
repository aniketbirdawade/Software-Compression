// Get references to HTML elements
const imageInput = document.getElementById("imageInput");
const imageContainer = document.getElementById("imageContainer");
const countText = document.getElementById("countText");
const saveBtn = document.getElementById("saveBtn");

// Array to store selected image data (Base64)
let selectedImages = [];

// Trigger when user selects images using file input
imageInput.addEventListener("change", function () {
  // Clear previously shown images
  imageContainer.innerHTML = "";

  // Reset selected images list
  selectedImages = [];

  // Update selected image count
  updateCount();

  // Convert FileList to array
  const files = Array.from(this.files);

  // Loop through each selected file
  files.forEach((file) => {
    const reader = new FileReader();

    // When file is successfully read
    reader.onload = function (e) {
      // Create image element
      const img = document.createElement("img");

      // Set image source as Base64 data
      img.src = e.target.result;

      // Toggle select / unselect on image click
      img.onclick = function () {
        // If already selected → unselect
        if (img.classList.contains("selected")) {
          img.classList.remove("selected");

          // Remove image from selectedImages array
          selectedImages = selectedImages.filter(
            (src) => src !== img.src
          );
        } 
        // If not selected → select
        else {
          img.classList.add("selected");

          // Add image to selectedImages array
          selectedImages.push(img.src);
        }

        // Update count text
        updateCount();
      };

      // Add image to the page
      imageContainer.appendChild(img);
    };

    // Read file as Base64 (needed for preview & slideshow)
    reader.readAsDataURL(file);
  });
});

// Update selected images count text
function updateCount() {
  countText.textContent = 
    `Images selected for slideshow: ${selectedImages.length}`;
}

// Save Images button click
saveBtn.onclick = function () {
  // Prevent proceeding if no images are selected
  if (selectedImages.length === 0) {
    alert("No images selected");
    return;
  }

  // Store selected images in localStorage
  localStorage.setItem(
    "selectedImages",
    JSON.stringify(selectedImages)
  );

  // Open preview page in a new tab
  window.open("preview.html", "_blank");
};