const express = require("express");
const multer = require("multer");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const fs = require("fs");
const path = require("path");

// говорим fluent-ffmpeg где лежит ffmpeg (локальный!)
ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();

// папка для загрузок
const upload = multer({ dest: "uploads/" });

// убедимся что папка есть
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// тестовый маршрут
app.get("/", (req, res) => {
  res.send("✅ Video render server is running");
});

// основной рендер
app.post("/render", upload.single("video"), (req, res) => {
  if (!req.file) {
    console.log("❌ No file uploaded");
    return res.status(400).send("No file uploaded");
  }

  const input = req.file.path;
  const output = path.join(__dirname, output_${Date.now()}.mp4);

  console.log("🎬 Start render:", input);

  ffmpeg(input)
    .outputOptions([
      "-vf scale=512:512", // пока просто масштаб
      "-t 10"              // первые 10 секунд
    ])
    .on("end", () => {
      console.log("✅ Render done");

      res.download(output, () => {
        // чистим файлы после отправки
        fs.unlinkSync(input);
        fs.unlinkSync(output);
      });
    })
    .on("error", (err) => {
      console.error("🔥 FFmpeg error:", err);

      if (fs.existsSync(input)) fs.unlinkSync(input);
      if (fs.existsSync(output)) fs.unlinkSync(output);

      res.status(500).send("Render error");
    })
    .save(output);
});

// запуск сервера
const PORT = 3000;
app.listen(PORT, () => {
  console.log(🚀 Server started on http://localhost:${PORT});
});