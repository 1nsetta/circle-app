const express = require("express");
const multer = require("multer");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const fs = require("fs");
const path = require("path");

// говорим fluent-ffmpeg где бинарник
ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();
const upload = multer({ dest: "uploads/" });

// создаём папки если нет
const uploadsDir = path.resolve(__dirname, "uploads");
const backgroundsDir = path.resolve(__dirname, "backgrounds");

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(backgroundsDir)) fs.mkdirSync(backgroundsDir);

// проверка сервера
app.get("/", (req, res) => {
  res.send("✅ Render server running");
});

// основной рендер
app.post("/render", upload.single("video"), (req, res) => {
  if (!req.file) {
    console.log("❌ No file uploaded");
    return res.status(400).send("No file uploaded");
  }

  const input = path.resolve(req.file.path);
  const background = path.resolve(backgroundsDir, "bg.mp4");
  const output = path.resolve(__dirname, `output_${Date.now()}.mp4`);

  console.log("🎬 Rendering...");
  console.log("INPUT:", input);
  console.log("BACKGROUND:", background);
  console.log("OUTPUT:", output);

  if (!fs.existsSync(background)) {
    console.log("❌ Background not found!");
    return res.status(500).send("Background file missing");
  }

  ffmpeg()
    .input(background)
    .input(input)
    .complexFilter([
      "[0:v]scale=1080:1920[bg]",
      "[1:v]scale=600:-1[fg]",
      "[bg][fg]overlay=(W-w)/2:(H-h)/2"
    ])
    .outputOptions([
      "-map 1:a?",
      "-c:v libx264",
      "-preset veryfast",
      "-crf 23",
      "-shortest"
    ])
    .on("start", cmd => {
      console.log("FFmpeg started:");
      console.log(cmd);
    })
    .on("end", () => {
      console.log("✅ Render DONE");

      // отправляем файл пользователю
      res.download(output);
    })
    .on("error", err => {
      console.error("❌ FFmpeg error:", err);
      res.status(500).send("Render error");
    })
    .output(output)
    .run();
});

// запуск
app.listen(3000, () => {
  console.log("🚀 Server started on http://localhost:3000");
});