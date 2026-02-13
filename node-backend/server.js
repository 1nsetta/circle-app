const express = require("express");
const multer = require("multer");
const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();
const PORT = 3000;

// ✅ Разрешаем запросы с Live Server / браузера
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"]
}));

// 👉 Папки
const uploadsDir = path.join(__dirname, "uploads");
const outputDir = path.join(__dirname, "outputs");
const bgDir = path.join(__dirname, "backgrounds");

// создаём если нет
[uploadsDir, outputDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
});

// отдаём готовые видео
app.use("/outputs", express.static(outputDir));

// 👉 настройка загрузки файлов
const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    const unique = Date.now() + path.extname(file.originalname);
    cb(null, unique);
  }
});

const upload = multer({ storage });

// =====================================================
// 🎬 РЕНДЕР ВИДЕО-КРУЖКА
// =====================================================
app.post("/render", upload.single("video"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Файл не получен" });
    }

    const inputVideo = req.file.path;
    const backgroundVideo = path.join(bgDir, "bg.mp4"); // фон
    const outputName = `output_${Date.now()}.mp4`;
    const outputPath = path.join(outputDir, outputName);

    console.log("START RENDER");
    console.log("INPUT:", inputVideo);
    console.log("BG:", backgroundVideo);
    console.log("OUTPUT:", outputPath);

    // 🎯 Размер кружка
    const circleSize = 680;
    const radius = circleSize / 2;

    ffmpeg()
      .input(backgroundVideo)
      .input(inputVideo)
      .complexFilter([
        // фон → вертикальный 1080x1920
        `[0:v]scale=1080:1920[bg]`,

        // видео → квадрат + размер кружка
        `[1:v]crop='min(in_w,in_h)':'min(in_w,in_h)',scale=${circleSize}:${circleSize}[vid]`,

        // делаем альфа-маску круга
        `[vid]format=rgba,geq=
        r='r(X,Y)':
        g='g(X,Y)':
        b='b(X,Y)':
        a='if(lte((X-${radius})*(X-${radius})+(Y-${radius})*(Y-${radius}),${radius}*${radius}),255,0)'
        [circle]`,

        // накладываем по центру
        `[bg][circle]overlay=(W-w)/2:(H-h)/2`
      ])
      .outputOptions([
        "-map 1:a?",          // если есть звук — оставить
        "-c:v libx264",
        "-preset veryfast",
        "-crf 23",
        "-pix_fmt yuv420p",
        "-shortest"
      ])
      .on("end", () => {
        console.log("✅ DONE");

        res.json({
          success: true,
          url: `http://localhost:${PORT}/outputs/${outputName}`
        });

        // можно удалить исходник
        fs.unlink(inputVideo, () => {});
      })
      .on("error", (err) => {
        console.error("❌ ERROR:", err.message);
        res.status(500).json({ error: "FFmpeg error" });
      })
      .save(outputPath);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// =====================================================

app.listen(PORT, () => {
  console.log(`🚀 Server started on http://localhost:${PORT}`);
});