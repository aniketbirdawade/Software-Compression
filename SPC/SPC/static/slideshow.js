const slideshowContainer = document.getElementById("slideshowContainer");

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");

const speedInput = document.getElementById("speedInput");
const applySpeedBtn = document.getElementById("applySpeedBtn");

const fullscreenBtn = document.getElementById("fullscreenBtn");

const saveJsonBtn = document.getElementById("saveJsonBtn");

const selectedImages =
JSON.parse(localStorage.getItem("selectedImages") || "[]");

let slideSpeed =
Number(localStorage.getItem("slideSpeed")) || 2;

speedInput.value = slideSpeed;

let currentIndex = 0;
let intervalId = null;


/* ---------- RESTORE BUTTON POSITIONS ---------- */

const savedPositions =
JSON.parse(localStorage.getItem("buttonPositions") || "{}");

document.querySelectorAll(".buttons button").forEach(btn => {

const pos = savedPositions[btn.id];

if (pos) {
btn.style.position = "absolute";
btn.style.left = pos.left;
btn.style.top = pos.top;
}

});


/* ---------- SHOW IMAGE ---------- */

function showImage(){

if(selectedImages.length === 0){
slideshowContainer.innerHTML = "<p>No images</p>";
return;
}

slideshowContainer.innerHTML =
`<img src="${selectedImages[currentIndex]}">`;

}


/* ---------- NAVIGATION ---------- */

prevBtn.onclick = () => {

currentIndex =
(currentIndex - 1 + selectedImages.length) %
selectedImages.length;

showImage();

};

nextBtn.onclick = () => {

currentIndex =
(currentIndex + 1) %
selectedImages.length;

showImage();

};


/* ---------- START / STOP ---------- */

startBtn.onclick = () => {

if(!intervalId){

intervalId =
setInterval(nextBtn.onclick, slideSpeed * 1000);

}

};

stopBtn.onclick = () => {

clearInterval(intervalId);
intervalId = null;

};


/* ---------- APPLY SPEED ---------- */

applySpeedBtn.onclick = () => {

const value = Number(speedInput.value);

if(value <= 0){
alert("Enter valid speed");
return;
}

slideSpeed = value;

localStorage.setItem("slideSpeed", slideSpeed);

if(intervalId){

clearInterval(intervalId);

intervalId =
setInterval(nextBtn.onclick, slideSpeed * 1000);

}

};


/* ---------- FULLSCREEN ---------- */

fullscreenBtn.onclick = () => {

if(!document.fullscreenElement){

document.documentElement.requestFullscreen();

}else{

document.exitFullscreen();

}

};


/* ---------- SAVE JSON ---------- */

saveJsonBtn.onclick = () => {

if(selectedImages.length === 0){
alert("No images to save");
return;
}

const data = {

slideSpeed: slideSpeed,

images: selectedImages.map((src,index)=>({
order:index,
src:src
}))

};

const blob =
new Blob(
[JSON.stringify(data,null,2)],
{type:"application/json"}
);

const a = document.createElement("a");

a.href = URL.createObjectURL(blob);
a.download = "slideshow-data.json";

a.click();

};


/* ---------- INIT ---------- */

showImage();