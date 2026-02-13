let selectedBg = "bg.mp4";

function selectBackground(name) {
  selectedBg = name;

  document.querySelectorAll(".bg-card").forEach(c => c.style.outline = "none");
  event.currentTarget.style.outline = "3px solid #00c6ff";
}

async function renderVideo() {
  const file = document.getElementById("videoInput").files[0];
  if (!file) {
    alert("Выбери видео");
    return;
  }

  document.getElementById("status").classList.remove("hidden");
  document.getElementById("result").classList.add("hidden");

  const formData = new FormData();
  formData.append("video", file);
  formData.append("background", selectedBg);

  try {
    const response = await fetch("http://localhost:3000/render", {
      method: "POST",
      body: formData
    });

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    document.getElementById("resultVideo").src = url;
    document.getElementById("downloadLink").href = url;
    document.getElementById("downloadLink").download = "circle.mp4";

    document.getElementById("status").classList.add("hidden");
    document.getElementById("result").classList.remove("hidden");

  } catch (e) {
    document.getElementById("status").classList.add("hidden");
    alert("Ошибка генерации");
  }
}