// ===== АДРЕС ТВОЕГО СЕРВЕРА =====
// ОБЯЗАТЕЛЬНО укажи свой IP (тот что 192.168.0.8)
const SERVER = "http://192.168.0.8:3000";


// ===== ЭЛЕМЕНТЫ UI =====
const form = document.getElementById("uploadForm");
const fileInput = document.getElementById("videoInput");
const statusBlock = document.getElementById("status");
const bgContainer = document.getElementById("bgCarousel");


// ===== СПИСОК ФОНОВ =====
const backgrounds = [
  "bg.mp4",
  "gameplay.mp4",
  "podcast.mp4"
];

let selectedBg = backgrounds[0];


// ===== СОЗДАЁМ КАРУСЕЛЬ ФОНОВ =====
backgrounds.forEach((bg, index) => {
  const video = document.createElement("video");

  video.src = `${SERVER}/backgrounds/${bg}`;
  video.autoplay = true;
  video.loop = true;
  video.muted = true;
  video.playsInline = true;

  video.className = "bg-preview";
  if (index === 0) video.classList.add("active");

  video.onclick = () => selectBackground(video, bg);

  bgContainer.appendChild(video);
});

function selectBackground(videoEl, bgName) {
  document.querySelectorAll(".bg-preview").forEach(v => v.classList.remove("active"));
  videoEl.classList.add("active");
  selectedBg = bgName;
}


// ===== ОБРАБОТКА ОТПРАВКИ ФОРМЫ =====
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const file = fileInput.files[0];
  if (!file) {
    showStatus("❌ Выберите видео");
    return;
  }

  showStatus("⏳ Генерируем видео... Это займёт несколько секунд");

  const formData = new FormData();
  formData.append("video", file);
  formData.append("background", selectedBg);

  try {
    const response = await fetch(`${SERVER}/render`, {
      method: "POST",
      body: formData
    });

    if (!response.ok) throw new Error("Render failed");

    const blob = await response.blob();

    // ===== СКАЧИВАЕМ ФАЙЛ =====
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "circle-video.mp4";
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);

    showStatus("✅ Видео готово!");

  } catch (err) {
    console.error(err);
    showStatus("❌ Ошибка генерации");
  }
});


// ===== UI СТАТУС =====
function showStatus(text) {
  statusBlock.innerText = text;
  statusBlock.style.opacity = 1;
}