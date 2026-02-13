const express = require("express");
const multer = require("multer");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const fs = require("fs");
const path = require("path");

ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();
const upload = multer({ dest: "uploads/" });

const uploadsDir = path.resolve(__dirname, "uploads");
const backgroundsDir = path.resolve(__dirname, "backgrounds");

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(backgroundsDir)) fs.mkdirSync(backgroundsDir);

app.get("/", (req, res) => {
  res.send("✅ Circle Render Server Running");
});

app.post("/render", upload.single("video"), (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded");

  const input = path.resolve(req.file.path);
  const background = path.resolve(backgroundsDir, "bg.mp4");
  const output = path.resolve(__dirname, `output_${Date.now()}.mp4`);

  console.log("🎬 START RENDER");

  ffmpeg()
    .input(background)
    .input(input)
    .complexFilter(
      "[0:v]scale=1080:1920[bg];" +

      // делаем квадратное видео
      "[1:v]crop=min(in_w\\,in_h):min(in_w\\,in_h),scale=680:680[vid];" +

      // ВЫРЕЗАЕМ КРУГ (тот самый рабочий способ)
      "[vid]format=rgba,geq=" +
      "r='r(X,Y)':" +
      "g='g(X,Y)':" +
      "b='b(X,Y)':" +
      "a='if(lte((X-340)*(X-340)+(Y-340)*(Y-340),340*340),255,0)'[circle];" +

      // накладываем по центру
      "[bg][circle]overlay=(W-w)/2:(H-h)/2"
    )
    .outputOptions([
      "-map 1:a?",
      "-c:v libx264",
      "-preset veryfast",
      "-crf 23",
      "-pix_fmt yuv420p",
      "-shortest"
    ])
    .on("end", () => {
      console.log("✅ DONE");
      res.download(output);
    })
    .on("error", err => {
      console.error("❌ ERROR:", err.message);
      res.status(500).send("Render error");
    })
    .save(output);
});

app.listen(3000, () => {
  console.log("🚀 Server started on http://localhost:3000");
});