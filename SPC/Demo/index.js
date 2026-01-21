let img = document.querySelector("#img");

function prev() {
  if (selectedImages.length === 0) return;

  currentIndex =
    (currentIndex - 1 + selectedImages.length) % selectedImages.length;

  document.getElementById("slideImg").src = selectedImages[currentIndex];
}

function nxt() {
  if (selectedImages.length === 0) return;

  currentIndex = (currentIndex + 1) % selectedImages.length;

  document.getElementById("slideImg").src = selectedImages[currentIndex];
}

const imgInput = document.getElementById("selectImage");
const container = document.querySelector(".slide-container");

let selectedImages = [];

imgInput.addEventListener("change", function () {
  container.innerHTML = "";
  selectedImages = [];

  const files = imgInput.files;

  for (let i = 0; i < files.length; i++) {
    const reader = new FileReader();

    reader.onload = function (e) {
      const img = document.createElement("img");
      img.src = e.target.result;
      img.style.width = "150px";
      img.style.margin = "10px";
      img.style.cursor = "pointer";

      img.addEventListener("click", function () {
        if (img.classList.contains("selected")) {
          // img.classList.remove("selected");
          selectedImages = selectedImages.filter((src) => src !== img.src);
        } else {
          // img.classList.add("selected");
          selectedImages.push(img.src);
        }
      });

      container.appendChild(img);
    };

    reader.readAsDataURL(files[i]);
  }
});

let currentIndex = 0;
let interval;

function startSlideshow() {
  if (selectedImages.length === 0) return;

  const slideImg = document.getElementById("slideImg");
  currentIndex = 0;

  clearInterval(interval);

  slideImg.src = selectedImages[currentIndex];

  interval = setInterval(function () {
    currentIndex++;

    if (currentIndex >= selectedImages.length) {
      currentIndex = 0;
    }

    slideImg.src = selectedImages[currentIndex];
  }, 1000);
}

function stopSlideshow() {
  clearInterval(interval);
}
