let canvas;
let world;
let keyboard = new Keyboard();
let hasGameStarted = false;
let isGameOver = false;

// Basisgröße der Spielwelt (logische Welt)
const BASE_W = 720;
const BASE_H = 480;

document.addEventListener("DOMContentLoaded", () => {
  const startButton = document.getElementById("start-button");
  const restartButton = document.getElementById("restart-button");
  const fullscreenButton = document.getElementById("fullscreen-button");

  if (startButton) startButton.addEventListener("click", startGame);
  if (restartButton) restartButton.addEventListener("click", restartGame);

  if (fullscreenButton) {
    fullscreenButton.addEventListener("click", toggleFullscreen);
  }

  // Layout/Fullscreen-Änderungen beobachten
  document.addEventListener("fullscreenchange", onLayoutChange);
  document.addEventListener("webkitfullscreenchange", onLayoutChange);
  document.addEventListener("mozfullscreenchange", onLayoutChange);
  document.addEventListener("MSFullscreenChange", onLayoutChange);
  window.addEventListener("resize", onLayoutChange);

  // Initialer UI-/Layout-Status
  updateFullscreenButtonState();
  fitCanvasToScreen();
});

/**
 * Layout neu berechnen, wenn sich Größe/Fullscreen ändert
 */
function onLayoutChange() {
  updateFullscreenButtonState();
  fitCanvasToScreen();
}

/**
 * Initialisiert die Spielwelt und passt Canvas an.
 */
function init() {
  canvas = document.getElementById("canvas");
  if (!canvas) return;

  // Logische Weltgröße setzen
  canvas.width = BASE_W;
  canvas.height = BASE_H;

  world = new World(canvas, keyboard);
  world.setOnGameOver(handleGameOver);

  // Canvas an verfügbaren Platz anpassen
  fitCanvasToScreen();
}

/**
 * Startet das Spiel (nur einmal).
 */
function startGame() {
  if (hasGameStarted) return;

  const startScreen = document.getElementById("start-screen");
  const gameContainer = document.getElementById("game-container");
  const startButton = document.getElementById("start-button");

  startButton?.blur();
  startScreen?.classList.add("is-hidden");
  startScreen?.setAttribute("inert", "");
  gameContainer?.classList.remove("is-hidden");
  gameContainer?.removeAttribute("inert");

  init();
  hasGameStarted = true;
}

/**
 * Zeigt den Game-Over-Screen und fokussiert Restart.
 */
function handleGameOver() {
  isGameOver = true;
  const gameOverScreen = document.getElementById("game-over-screen");
  const restartButton = document.getElementById("restart-button");
  if (!gameOverScreen) return;

  gameOverScreen.classList.remove("is-hidden");
  gameOverScreen.removeAttribute("inert");
  restartButton?.focus();
}

/**
 * Startet das Spiel neu (Seite neu laden).
 */
function restartGame() {
  window.location.reload();
}

/**
 * Setzt die Canvasgröße auf den verfügbaren Platz (3:2) und skaliert
 * die Zeichenmatrix so, dass die Welt-Koordinaten (720x480) weiterpassen.
 * HiDPI (devicePixelRatio) wird berücksichtigt -> scharfes Bild.
 */
function fitCanvasToScreen() {
  const el = document.getElementById("canvas");
  if (!el) return;

  const dpr = window.devicePixelRatio || 1;

  if (isFullscreenActive()) {
    // VOLLBILD: skaliert auf verfügbaren Platz (3:2) + HiDPI
    const w = window.innerWidth;
    const h = window.innerHeight;
    const targetW = Math.min(w, h * (BASE_W / BASE_H)); // 1.5
    const targetH = Math.min(h, w * (BASE_H / BASE_W)); // 2/3

    el.style.width = `${targetW}px`;
    el.style.height = `${targetH}px`;

    const renderW = Math.round(targetW * dpr);
    const renderH = Math.round(targetH * dpr);
    if (el.width !== renderW || el.height !== renderH) {
      el.width = renderW;
      el.height = renderH;
    }

    const scale = targetW / BASE_W;
    const ctx = el.getContext("2d");
    ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
  } else {
    // NORMALMODUS: feste Weltgröße 720×480, zentriert im Layout
    el.style.width = "";
    el.style.height = "";

    const renderW = Math.round(BASE_W * dpr);
    const renderH = Math.round(BASE_H * dpr);
    if (el.width !== renderW || el.height !== renderH) {
      el.width = renderW;
      el.height = renderH;
    }

    const ctx = el.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
}

/**
 * Keyboard down
 */
window.addEventListener("keydown", (e) => {
  if (isGameOver) {
    if (e.code === "Space" || e.code === "Enter") {
      e.preventDefault();
      restartGame();
    }
    return;
  }
  if (!hasGameStarted && (e.code === "Space" || e.code === "Enter")) {
    e.preventDefault();
    startGame();
    return;
  }
  if (e.keyCode == 39) keyboard.RIGHT = true;
  if (e.keyCode == 37) keyboard.LEFT = true;
  if (e.keyCode == 38) keyboard.UP = true;
  if (e.keyCode == 40) keyboard.DOWN = true;
  if (e.keyCode == 32) keyboard.SPACE = true;
  if (e.keyCode == 68) keyboard.D = true;
});

/**
 * Keyboard up
 */
window.addEventListener("keyup", (e) => {
  if (e.keyCode == 39) keyboard.RIGHT = false;
  if (e.keyCode == 37) keyboard.LEFT = false;
  if (e.keyCode == 38) keyboard.UP = false;
  if (e.keyCode == 40) keyboard.DOWN = false;
  if (e.keyCode == 32) keyboard.SPACE = false;
  if (e.keyCode == 68) keyboard.D = false;
});

/**
 * Fullscreen toggeln
 */
function toggleFullscreen() {
  const gameContainer = document.getElementById("game-container");
  if (!gameContainer) return;

  if (isFullscreenActive()) {
    exitFullscreen();
  } else {
    requestFullscreen(gameContainer);
  }
}

function isFullscreenActive() {
  return Boolean(
    document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
  );
}

function requestFullscreen(element) {
  if (element.requestFullscreen) element.requestFullscreen();
  else if (element.webkitRequestFullscreen) element.webkitRequestFullscreen();
  else if (element.mozRequestFullScreen) element.mozRequestFullScreen();
  else if (element.msRequestFullscreen) element.msRequestFullscreen();
}

function exitFullscreen() {
  if (document.exitFullscreen) document.exitFullscreen();
  else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
  else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
  else if (document.msExitFullscreen) document.msExitFullscreen();
}

function updateFullscreenButtonState() {
  const fullscreenButton = document.getElementById("fullscreen-button");
  if (!fullscreenButton) return;

  const active = isFullscreenActive();
  fullscreenButton.textContent = active ? "Vollbild verlassen" : "Vollbild";
  fullscreenButton.setAttribute("aria-pressed", active ? "true" : "false");
  document.body.classList.toggle("is-fullscreen", active);
}
