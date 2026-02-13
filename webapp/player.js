export function createCirclePlayer(videoUrl) {
  const wrapper = document.createElement("div");
  wrapper.className = "circle-wrapper";

  const glow = document.createElement("div");
  glow.className = "circle-glow";

  const video = document.createElement("video");
  video.className = "circle-video";
  video.src = videoUrl;
  video.autoplay = true;
  video.loop = true;
  video.muted = false;
  video.playsInline = true;

  wrapper.appendChild(glow);
  wrapper.appendChild(video);

  return wrapper;
}