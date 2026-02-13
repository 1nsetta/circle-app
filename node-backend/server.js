const express = require("express");
const multer = require("multer");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const fs = require("fs");
const path = require("path");

// используем локальный ffmpeg
ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();
const upload = multer({ dest: "uploads/" });

// создаём папки если их нет
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");
if (!fs.existsSync("backgrounds")) fs.mkdirSync("backgrounds");

// проверка сервера
app.get("/", (req, res) => {
  res.send("✅ Render server working");
});

// основной рендер
app.post("/render", upload.single("video"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded");
  }

  const input = req.file.path;
  const background = path.join(__dirname, "backgrounds", "bg.mp4");
  const output = path.join(__dirname, `output_${Date.now()}.mp4`);

  console.log("🎬 Rendering...");
  console.log("Input:", input);
  console.log("Background:", background);

  ffmpeg()
    .input(background)
    .input(input)
    .complexFilter([
      // делаем фон вертикальным
      "[0:v]scale=1080:1920[bg]",

      // масштабируем пользовательское видео
      "[1:v]scale=600:-1[fg]",

      // кладём видео в центр
      "[bg][fg]overlay=(W-w)/2:(H-h)/2"
    ])
    .outputOptions([
      "-map 1:a?",
      "-c:v libx264",
      "-preset veryfast",
      "-crf 23",
      "-shortest"
    ])
    .on("end", () => {
      console.log("✅ Done");

      res.download(output, () => {
        if (fs.existsSync(input)) fs.unlinkSync(input);
        if (fs.existsSync(output)) fs.unlinkSync(output);
      });
    })
    .on("error", (err) => {
      console.error("❌ FFmpeg error:", err);
      res.status(500).send("Render error");
    })
    .save(output);
});

// запуск
app.listen(3000, () => {
  console.log("🚀 Server started on http://localhost:3000");
});