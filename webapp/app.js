let selectedBg = "bg.mp4";

const slides = document.querySelectorAll(".slide");
const carousel = document.getElementById("bgCarousel");

/* Определяем активный слайд при свайпе */

carousel.addEventListener("scroll", () => {
  let closest = null;
  let closestOffset = Infinity;

  slides.forEach(slide => {
    const rect = slide.getBoundingClientRect();
    const offset = Math.abs(rect.left + rect.width/2 - window.innerWidth/2);

    if (offset < closestOffset) {
      closestOffset = offset;
      closest = slide;
    }
  });

  slides.forEach(s => s.classList.remove("active"));
  if (closest) {
    closest.classList.add("active");
    selectedBg = closest.dataset.bg;
  }
});

/* РЕНДЕР */

document.getElementById("renderBtn").onclick = async () => {
  const file = document.getElementById("videoInput").files[0];
  if (!file) return alert("Выбери видео");

  document.getElementById("status").classList.remove("hidden");

  const formData = new FormData();
  formData.append("video", file);
  formData.append("bgName", selectedBg);

  const response = await fetch("http://localhost:3000/render", {
    method: "POST",
    body: formData
  });

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);

  const video = document.getElementById("resultVideo");
  video.src = url;
  video.classList.remove("hidden");

  document.getElementById("status").classList.add("hidden");
};