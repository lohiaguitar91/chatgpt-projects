const canvas = document.getElementById("scene");
const ctx = canvas.getContext("2d");

let width = 0;
let height = 0;
let deviceScale = 1;

const lavaRing = [];
const embers = [];

function resize() {
  deviceScale = Math.min(window.devicePixelRatio || 1.5, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width * deviceScale;
  canvas.height = height * deviceScale;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.scale(deviceScale, deviceScale);
}

function init() {
  resize();

  for (let i = 0; i < 240; i++) {
    lavaRing.push({
      baseAngle: Math.random() * Math.PI * 2,
      radiusFactor: 0.8 + Math.random() * 0.3,
      speed: 0.08 + Math.random() * 0.06,
      wobble: Math.random() * Math.PI * 2,
      wobbleScale: 8 + Math.random() * 16,
      size: 2 + Math.random() * 3,
    });
  }

  for (let i = 0; i < 60; i++) {
    embers.push({
      x: Math.random() * width,
      y: Math.random() * height,
      drift: (Math.random() * 0.4 + 0.2) * (Math.random() > 0.5 ? 1 : -1),
      speed: Math.random() * 0.4 + 0.2,
      radius: Math.random() * 1.6 + 0.6,
      tint: `hsla(${260 + Math.random() * 40}, 70%, ${50 + Math.random() * 15}%, 0.8)`,
    });
  }
}

function drawBackground(glowTime) {
  const gradient = ctx.createRadialGradient(
    width * 0.5,
    height * 0.6,
    Math.min(width, height) * 0.1,
    width * 0.5,
    height * 0.6,
    Math.max(width, height) * 0.8
  );
  gradient.addColorStop(0, "rgba(58, 34, 90, 0.7)");
  gradient.addColorStop(0.4, "rgba(26, 14, 38, 0.9)");
  gradient.addColorStop(1, "rgba(7, 3, 14, 1)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Glow veins on the cavern walls
  ctx.globalCompositeOperation = "screen";
  ctx.shadowBlur = 60;
  ctx.shadowColor = "rgba(94, 72, 133, 0.35)";
  ctx.strokeStyle = "rgba(122, 96, 168, 0.15)";
  ctx.lineWidth = 6;
  ctx.beginPath();
  const mid = width * 0.35;
  ctx.moveTo(mid, height);
  for (let y = height; y > -100; y -= 60) {
    const x = mid + Math.sin(y * 0.012 + glowTime * 1.5) * 50;
    ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.globalCompositeOperation = "source-over";
}

function drawEmbers(time) {
  ctx.globalCompositeOperation = "screen";
  embers.forEach((ember) => {
    ember.y -= ember.speed * 0.5;
    ember.x += Math.sin(time * 0.4 + ember.y * 0.01) * ember.drift * 0.3;
    if (ember.y < -10) {
      ember.y = height + 10;
      ember.x = Math.random() * width;
    }

    ctx.beginPath();
    ctx.fillStyle = ember.tint;
    ctx.shadowBlur = 16;
    ctx.shadowColor = ember.tint;
    ctx.arc(ember.x, ember.y, ember.radius, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.shadowBlur = 0;
  ctx.globalCompositeOperation = "source-over";
}

function drawLava(time) {
  const baseRadius = Math.min(width, height) * 0.32;
  const centerX = width / 2;
  const centerY = height / 2;

  // swirling ribbon
  const ribbonPoints = 180;
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.beginPath();
  for (let i = 0; i <= ribbonPoints; i++) {
    const t = i / ribbonPoints;
    const angle = time * 0.3 + t * Math.PI * 2;
    const r = baseRadius + Math.sin(time * 1.1 + t * 12) * 18;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * (r * 0.82);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();

  const ribbonGrad = ctx.createLinearGradient(-baseRadius, 0, baseRadius, 0);
  ribbonGrad.addColorStop(0, "rgba(255, 134, 84, 0.65)");
  ribbonGrad.addColorStop(0.5, "rgba(255, 222, 170, 0.85)");
  ribbonGrad.addColorStop(1, "rgba(255, 134, 84, 0.65)");

  ctx.strokeStyle = ribbonGrad;
  ctx.lineWidth = 30;
  ctx.shadowBlur = 45;
  ctx.shadowColor = "rgba(255, 148, 94, 0.6)";
  ctx.globalCompositeOperation = "screen";
  ctx.stroke();
  ctx.restore();

  // drifting molten sparks
  ctx.globalCompositeOperation = "lighter";
  lavaRing.forEach((node) => {
    const angle = node.baseAngle + time * node.speed;
    const wobble = Math.sin(time * 1.6 + node.wobble) * node.wobbleScale;
    const radius = baseRadius * node.radiusFactor + wobble;

    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * (radius * 0.82);

    const g = ctx.createRadialGradient(x, y, 0, x, y, node.size * 6);
    g.addColorStop(0, "rgba(255, 195, 128, 0.95)");
    g.addColorStop(0.5, "rgba(255, 138, 92, 0.7)");
    g.addColorStop(1, "rgba(120, 60, 44, 0)");

    ctx.fillStyle = g;
    ctx.shadowBlur = 20;
    ctx.shadowColor = "rgba(255, 158, 110, 0.6)";
    ctx.beginPath();
    ctx.arc(x, y, node.size * 1.2, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.shadowBlur = 0;
  ctx.globalCompositeOperation = "source-over";
}

function tick(timestamp) {
  const time = timestamp * 0.001;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(deviceScale, deviceScale);

  ctx.fillStyle = "rgba(12, 6, 20, 0.2)";
  ctx.fillRect(0, 0, width, height);

  drawBackground(time);
  drawEmbers(time);
  drawLava(time);

  requestAnimationFrame(tick);
}

window.addEventListener("resize", resize);
init();
requestAnimationFrame(tick);

