// circleEffect.js
// Генерирует filter_complex для:
// - круглого видео
// - анимированного кольца (пульс как в Telegram)

function buildCircleFilter(size = 680) {
  const r = Math.floor(size / 2);      // радиус круга
  const center = r;

  return (
    // фон
    "[0:v]scale=1080:1920[bg];" +

    // квадратное видео
    `[1:v]crop=min(in_w\\,in_h):min(in_w\\,in_h),scale=${size}:${size}[vid];` +

    // маска круга
    `[vid]format=rgba,geq=` +
      `r='r(X,Y)':` +
      `g='g(X,Y)':` +
      `b='b(X,Y)':` +
      `a='if(lte((X-${center})*(X-${center})+(Y-${center})*(Y-${center}),${r}*${r}),255,0)'` +
    `[circle];` +

    // создаём анимированное кольцо (пульс)
    `color=white@0.0:s=${size}x${size},format=rgba,geq=` +
      `r='255':` +
      `g='255':` +
      `b='255':` +
      // толщина кольца "дышит" через sin(T*2)
      `a='if(between(sqrt((X-${center})*(X-${center})+(Y-${center})*(Y-${center}))` +
      `,${r}-8-4*sin(T*2),${r}+2),180,0)'` +
    `[ring];` +

    // кладём видео
    "[bg][circle]overlay=(W-w)/2:(H-h)/2[tmp];" +

    // кладём анимированное кольцо сверху
    "[tmp][ring]overlay=(W-w)/2:(H-h)/2"
  );
}

module.exports = { buildCircleFilter };