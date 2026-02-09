const imgInput = document.getElementById("selectImage");
const container = document.querySelector(".slide-container")

imgInput.addEventListener("change", function(){
  container.innerHTML = "";

  const files = imgInput.files;

  for(let i=0; i<files.length; i++){
    const reader = new FileReader();

    reader.onload = function(e){
      const slidediv = document.createElement("div")
      slidediv.className = "slide";

      const img = document.createElement("img");
      img.src = e.target.result;

      slidediv.appendChild(img);
      container.appendChild(slidediv);
    };
    reader.readAsDataURL(files[i]);
  }
});

let currentIndex=0;
let interval;

document.getElementById("start").addEventListener("click", function(){
  const slide = document.querySelectorAll(".slide")

  if(slide.length === 0)
    return;

  slide.forEach(slide => slide.style.display = "none");

  interval = setInterval(function(){
    slide.forEach(slide => slide.style.display = "none");
    slide[currentIndex].style.display = "block";

    currentIndex++;
    if(currentIndex >= slide.length){
      currentIndex = 0;
    }
  }, 1000)
});