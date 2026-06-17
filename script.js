const alertScreen = document.getElementById("alertScreen");
const countdownValue = document.getElementById("countdownValue");
const flashOverlay = document.getElementById("flashOverlay");

const inviteCard = document.getElementById("inviteCard");
const celebrationScreen = document.getElementById("celebrationScreen");
const yesButton = document.getElementById("yesButton");
const noButton = document.getElementById("noButton");

const canvas = document.getElementById("celebrationCanvas");
const ctx = canvas.getContext("2d");
const particles = [];

let countdownNumber = 5;
let confettiAnimationId = 0;
let confettiActiveUntil = 0;

// Media fallback
// Alterna placeholder de imagem/GIF conforme o arquivo exista ou nao.
function setupMediaFallback(imageId, placeholderId) {
  const image = document.getElementById(imageId);
  const placeholder = document.getElementById(placeholderId);

  image.addEventListener("load", () => {
    image.style.display = "block";
    placeholder.classList.add("hidden");
  });

  image.addEventListener("error", () => {
    image.style.display = "none";
    placeholder.classList.remove("hidden");
  });

  if (image.complete) {
    if (image.naturalWidth > 0) {
      placeholder.classList.add("hidden");
    } else {
      image.style.display = "none";
      placeholder.classList.remove("hidden");
    }
  }
}

// Intro alert
// Exibe o alerta inicial por 5 segundos com contador regressivo visivel.
function startCountdown() {
  countdownValue.textContent = countdownNumber;

  const countdownInterval = window.setInterval(() => {
    countdownNumber -= 1;

    if (countdownNumber > 0) {
      countdownValue.textContent = countdownNumber;
      return;
    }

    window.clearInterval(countdownInterval);
  }, 1000);

  window.setTimeout(() => {
    alertScreen.classList.add("hidden");
  }, 5000);
}

// No button behavior
function triggerDangerFlash() {
  flashOverlay.classList.remove("active");
  void flashOverlay.offsetWidth;
  flashOverlay.classList.add("active");
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function positionNoButtonRandomly() {
  const buttonRect = noButton.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const margin = 12;

  const maxX = Math.max(margin, viewportWidth - buttonRect.width - margin);
  const maxY = Math.max(margin, viewportHeight - buttonRect.height - margin);

  const randomX = Math.random() * (maxX - margin) + margin;
  const randomY = Math.random() * (maxY - margin) + margin;

  noButton.classList.add("is-running");
  noButton.style.left = `${clamp(randomX, margin, maxX)}px`;
  noButton.style.top = `${clamp(randomY, margin, maxY)}px`;
}

function evadeNoButton(event) {
  if (event) {
    event.preventDefault();
  }

  triggerDangerFlash();
  positionNoButtonRandomly();
}

// Celebration canvas
function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * ratio;
  canvas.height = window.innerHeight * ratio;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function createBurst(x, y) {
  const colors = ["#9d7cff", "#52a4ff", "#ff7ccf", "#ffffff", "#a9e5ff"];

  for (let index = 0; index < 80; index += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 6 + 2;

    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1.5,
      gravity: 0.08 + Math.random() * 0.04,
      life: 70 + Math.random() * 30,
      size: 3 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * Math.PI,
      rotationSpeed: (Math.random() - 0.5) * 0.25
    });
  }
}

function renderConfetti() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  for (let index = particles.length - 1; index >= 0; index -= 1) {
    const particle = particles[index];

    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vy += particle.gravity;
    particle.life -= 1;
    particle.rotation += particle.rotationSpeed;

    if (particle.life <= 0) {
      particles.splice(index, 1);
      continue;
    }

    ctx.save();
    ctx.translate(particle.x, particle.y);
    ctx.rotate(particle.rotation);
    ctx.fillStyle = particle.color;
    ctx.globalAlpha = Math.max(particle.life / 100, 0);
    ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size * 1.8);
    ctx.restore();
  }

  if (Date.now() < confettiActiveUntil) {
    if (Math.random() > 0.86) {
      createBurst(Math.random() * window.innerWidth, Math.random() * (window.innerHeight * 0.55));
    }
  }

  if (particles.length > 0 || Date.now() < confettiActiveUntil) {
    confettiAnimationId = window.requestAnimationFrame(renderConfetti);
    return;
  }

  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  window.cancelAnimationFrame(confettiAnimationId);
  confettiAnimationId = 0;
}

function launchCelebration() {
  inviteCard.classList.add("hidden");
  celebrationScreen.classList.remove("hidden");

  confettiActiveUntil = Date.now() + 4500;
  createBurst(window.innerWidth * 0.25, window.innerHeight * 0.22);
  createBurst(window.innerWidth * 0.5, window.innerHeight * 0.16);
  createBurst(window.innerWidth * 0.75, window.innerHeight * 0.22);

  if (!confettiAnimationId) {
    renderConfetti();
  }
}

setupMediaFallback("inviteImage", "imagePlaceholder");
setupMediaFallback("happyGif", "gifPlaceholder");
startCountdown();
resizeCanvas();

noButton.addEventListener("mouseenter", evadeNoButton);
noButton.addEventListener("click", evadeNoButton);
noButton.addEventListener("touchstart", evadeNoButton, { passive: false });
yesButton.addEventListener("click", launchCelebration);

window.addEventListener("resize", () => {
  resizeCanvas();

  if (noButton.classList.contains("is-running")) {
    positionNoButtonRandomly();
  }
});
