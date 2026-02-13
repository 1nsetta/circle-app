// circleEffect.js
// Telegram-like animated ring

function buildCircleFilter(size = 680) {
  const r = Math.floor(size / 2);
  const c = r;

  return (
    // BACKGROUND
    "[0:v]scale=1080:1920[bg];" +

    // VIDEO -> square
    `[1:v]crop=min(in_w\\,in_h):min(in_w\\,in_h),scale=${size}:${size}[vid];` +

    // MAKE ROUND VIDEO
    `[vid]format=rgba,geq=` +
      `r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':` +
      `a='if(lte((X-${c})*(X-${c})+(Y-${c})*(Y-${c}),${r}*${r}),255,0)'` +
    `[circle];` +

    // === CREATE ANIMATED RING TEXTURE ===
    // генерируем белый слой
    `color=white@1.0:s=${size}x${size},format=rgba` +

    // делаем из него "кольцо"
    `,geq=a='if(between(sqrt((X-${c})*(X-${c})+(Y-${c})*(Y-${c}))` +
    `,${r}-10,${r}+4),255,0)'` +

    // мягкие края
    `,boxblur=2:1` +

    // пульс прозрачности
    `,lut=a='val*(0.6+0.4*sin(T*3))'` +

    // ВАЖНО: вращение — вот чего не хватало
    `,rotate=0.6*T:c=none:ow=rotw(0.6*T):oh=roth(0.6*T)` +

    `[ring];` +

    // OVERLAY VIDEO
    "[bg][circle]overlay=(W-w)/2:(H-h)/2[tmp];" +

    // OVERLAY ANIMATED RING
    "[tmp][ring]overlay=(W-w)/2:(H-h)/2"
  );
}

module.exports = { buildCircleFilter };