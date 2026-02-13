// circleEffect.js
// ULTRA-STABLE animated ring (works on Windows ffmpeg builds)

function buildCircleFilter(size = 680) {
  const r = Math.floor(size / 2);

  return (
    // background
    "[0:v]scale=1080:1920[bg];" +

    // square video
    `[1:v]crop=min(in_w\\,in_h):min(in_w\\,in_h),scale=${size}:${size}[vid];` +

    // round mask for video
    `[vid]format=rgba,geq=` +
      `r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':` +
      `a='if(lte((X-${r})*(X-${r})+(Y-${r})*(Y-${r}),${r}*${r}),255,0)'` +
    `[circle];` +

    // ---- create STATIC ring first (без анимации!) ----
    `color=white@1.0:s=${size}x${size},format=rgba,` +
    `geq=a='if(between(hypot(X-${r},Y-${r}),${r}-8,${r}+2),255,0)'` +
    `[ringbase];` +

    // ---- теперь анимируем прозрачность (это безопасно) ----
    `[ringbase]lut=a='val*(0.6+0.4*sin(T*2))'[ring];` +

    // overlay video
    "[bg][circle]overlay=(W-w)/2:(H-h)/2[tmp];" +

    // overlay animated ring
    "[tmp][ring]overlay=(W-w)/2:(H-h)/2"
  );
}

module.exports = { buildCircleFilter };