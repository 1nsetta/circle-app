// circleEffect.js
// Stable animated ring (Telegram-like pulse)

function buildCircleFilter(size = 680) {
  const r = Math.floor(size / 2);
  const c = r;

  return (
    // BACKGROUND
    "[0:v]scale=1080:1920[bg];" +

    // VIDEO -> square
    `[1:v]crop=min(in_w\\,in_h):min(in_w\\,in_h),scale=${size}:${size}[vid];` +

    // ROUND VIDEO MASK
    `[vid]format=rgba,geq=` +
      `r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':` +
      `a='if(lte((X-${c})*(X-${c})+(Y-${c})*(Y-${c}),${r}*${r}),255,0)'` +
    `[circle];` +

    // === ANIMATED RING (без rotate!) ===
    `color=white@1.0:s=${size}x${size},format=rgba,` +

    // Пульсирующая толщина
    `geq=a='if(between(` +
      `sqrt((X-${c})*(X-${c})+(Y-${c})*(Y-${c}))` +
      `,${r}-12-6*sin(T*2),${r}+3),255,0)'` +

    // мягкие края
    `,boxblur=3:1` +

    // плавная прозрачность
    `,lut=a='val*(0.5+0.5*sin(T*2))'` +

    `[ring];` +

    // overlay video
    "[bg][circle]overlay=(W-w)/2:(H-h)/2[tmp];" +

    // overlay animated ring
    "[tmp][ring]overlay=(W-w)/2:(H-h)/2"
  );
}

module.exports = { buildCircleFilter };