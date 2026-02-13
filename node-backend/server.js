const express = require("express");
const multer = require("multer");
const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(cors());
app.use("/backgrounds", express.static(path.join(__dirname, "backgrounds")));

const upload = multer({ dest: "uploads/" });

app.post("/render", upload.fields([
  { name: "video", maxCount: 1 },
  { name: "background", maxCount: 1 }
]), (req, res) => {

  const videoPath = req.files.video[0].path;

  let bgPath;
  if (req.files.background) {
    bgPath = req.files.background[0].path;
  } else {
    bgPath = path.join(__dirname, "backgrounds", req.body.bgName || "bg.mp4");
  }

  const output = `output_${Date.now()}.mp4`;

  ffmpeg()
    .input(bgPath)
    .input(videoPath)
    .complexFilter(
      "[0:v]scale=1080:1920[bg];" +
      "[1:v]crop=min(in_w\\,in_h):min(in_w\\,in_h),scale=700:700[vid];" +
      "[vid]format=rgba,geq=" +
      "r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':" +
      "a='if(lte((X-350)*(X-350)+(Y-350)*(Y-350),350*350),255,0)'[circle];" +
      "[bg][circle]overlay=(W-w)/2:(H-h)/2"
    )
    .outputOptions(["-map 1:a?", "-shortest"])
    .save(output)
    .on("end", () => res.sendFile(path.resolve(output)));
});

app.listen(3000, "0.0.0.0", () => console.log("Server running on network"));