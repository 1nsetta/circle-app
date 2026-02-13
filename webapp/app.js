let selectedBg = null;

window.selectBg = function(bg) {
    selectedBg = bg;
    document.getElementById("status").innerText = "Выбран фон: " + bg;
}

window.addEventListener("DOMContentLoaded", () => {

    const renderBtn = document.getElementById("renderBtn");

    renderBtn.addEventListener("click", async () => {

        const fileInput = document.getElementById("videoInput");
        const file = fileInput.files[0];

        if (!file) {
            alert("Загрузи видео");
            return;
        }

        if (!selectedBg) {
            alert("Выбери фон");
            return;
        }

        const formData = new FormData();
        formData.append("video", file);
        formData.append("background", selectedBg);

        document.getElementById("status").innerText = "Рендерим...";

        const response = await fetch("http://127.0.0.1:8080/render", {
            method: "POST",
            body: formData
        });

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "result.mp4";
        a.click();

        document.getElementById("status").innerText = "Готово!";
    });
});