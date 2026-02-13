const express = require("express");
const multer = require("multer");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const fs = require("fs");
const path = require("path");
const { buildCircleFilter } = require("./circleEffect");

ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();
const upload = multer({ dest: "uploads/" });

const uploadsDir = path.resolve(__dirname, "uploads");
const backgroundsDir = path.resolve(__dirname, "backgrounds");

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(backgroundsDir)) fs.mkdirSync(backgroundsDir);

// Проверка сервера
app.get("/", (req, res) => {
  res.send("✅ Circle Render Server Running");
});

// Основной рендер
app.post("/render", upload.single("video"), (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded");

  const input = path.resolve(req.file.path);
  const background = path.resolve(backgroundsDir, "bg.mp4");
  const output = path.resolve(__dirname, `output_${Date.now()}.mp4`);

  console.log("🎬 START RENDER");
  console.log("INPUT:", input);
  console.log("BG:", background);
  console.log("OUTPUT:", output);

  if (!fs.existsSync(background)) {
    return res.status(500).send("Background bg.mp4 not found");
  }

  // ВАЖНО: фильтр одной строкой!
  const filter =
    "[0:v]scale=1080:1920[bg];" +
    "[1:v]crop=min(in_w\\,in_h):min(in_w\\,in_h),scale=600:600[vid];" +
    "[vid]format=rgba," +
    "geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':" +
    "a='if(lte((X-300)*(X-300)+(Y-300)*(Y-300),300*300),255,0)'[circle];" +
    "[bg][circle]overlay=(W-w)/2:(H-h)/2";

  ffmpeg()
    .input(background)
    .input(input)
    .complexFilter(filter)
    .outputOptions([
      "-map 1:a?",        // берём звук из оригинала если есть
      "-c:v libx264",
      "-preset veryfast",
      "-crf 23",
      "-pix_fmt yuv420p",
      "-shortest"
    ])
    .on("start", cmd => console.log("FFmpeg:", cmd))
    .on("end", () => {
      console.log("✅ RENDER DONE");
      res.download(output);
    })
    .on("error", err => {
      console.error("❌ ERROR:", err.message);
      res.status(500).send("Render error");
    })
    .output(output)
    .run();
});

// Запуск сервера
app.listen(3000, () => {
  console.log("🚀 Server started on http://localhost:3000");
});