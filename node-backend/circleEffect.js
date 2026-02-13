// circleEffect.js
// STABLE VERSION — без анимации, только круг + обводка

function buildCircleFilter(size = 680) {
  const r = Math.floor(size / 2);

  return (
    // фон
    "[0:v]scale=1080:1920[bg];" +

    // видео делаем квадратным
    `[1:v]crop=min(in_w\\,in_h):min(in_w\\,in_h),scale=${size}:${size}[vid];` +

    // вырезаем круг
    `[vid]format=rgba,geq=` +
      `r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':` +
      `a='if(lte((X-${r})*(X-${r})+(Y-${r})*(Y-${r}),${r}*${r}),255,0)'` +
    `[circle];` +

    // создаём простую белую обводку
    `color=white@1.0:s=${size}x${size},format=rgba,geq=` +
      `a='if(between((X-${r})*(X-${r})+(Y-${r})*(Y-${r}),(${r}-6)*(${r}-6),(${r}+2)*(${r}+2)),255,0)'` +
    `[ring];` +

    // кладём видео
    "[bg][circle]overlay=(W-w)/2:(H-h)/2[tmp];" +

    // кладём обводку сверху
    "[tmp][ring]overlay=(W-w)/2:(H-h)/2"
  );
}

module.exports = { buildCircleFilter };