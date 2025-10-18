let canvas;
let world;
let keyboard = new Keyboard();
let hasGameStarted = false;

// Basisgröße der Spielwelt (dein aktuelles Canvas-Design)
const BASE_W = 720;
const BASE_H = 480;

document.addEventListener("DOMContentLoaded", () => {
  const startButton = document.getElementById("start-button");
  const fullscreenButton = document.getElementById("fullscreen-button");

  if (startButton) startButton.addEventListener("click", startGame);
  if (fullscreenButton) {
    fullscreenButton.addEventListener("click", toggleFullscreen);
    updateFullscreenButtonState();
  }
});

document.addEventListener("fullscreenchange", onLayoutChange);
document.addEventListener("webkitfullscreenchange", onLayoutChange);
document.addEventListener("mozfullscreenchange", onLayoutChange);
document.addEventListener("MSFullscreenChange", onLayoutChange);
window.addEventListener("resize", onLayoutChange);

function onLayoutChange() {
  updateFullscreenButtonState();
  fitCanvasToScreen();
}

/**
 * Initialisiert die Spielwelt und passt Canvas an.
 */
function init() {
  canvas = document.getElementById("canvas");
  // Stelle sicher, dass das Canvas die Basisgröße hat (logische Welt)
  canvas.width = BASE_W;
  canvas.height = BASE_H;

  world = new World(canvas, keyboard);
  // Nach dem Erzeugen der World einmal layouten
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
 * Setzt die Canvasgröße auf den verfügbaren Platz (3:2) und skaliert
 * die Zeichenmatrix so, dass die Welt-Koordinaten (720x480) weiterpassen.
 * Zudem wird HiDPI (devicePixelRatio) berücksichtigt -> scharfes Bild.
 */
function fitCanvasToScreen() {
  const el = document.getElementById("canvas");
  if (!el) return;

  const dpr = window.devicePixelRatio || 1;

  if (isFullscreenActive()) {
    // ----- VOLLBILD: skaliert auf verfügbaren Platz (3:2) + HiDPI -----
    const w = window.innerWidth;
    const h = window.innerHeight;
    const targetW = Math.min(w, h * (BASE_W / BASE_H)); // 1.5
    const targetH = Math.min(h, w * (BASE_H / BASE_W)); // 2/3

    // sichtbare Größe im Vollbild durch JS vorgeben
    el.style.width = `${targetW}px`;
    el.style.height = `${targetH}px`;

    // interner Render-Buffer in echten Pixeln
    const renderW = Math.round(targetW * dpr);
    const renderH = Math.round(targetH * dpr);
    if (el.width !== renderW || el.height !== renderH) {
      el.width = renderW;
      el.height = renderH;
    }

    // Welt 720×480 -> skaliert; plus dpr für Schärfe
    const scale = targetW / BASE_W;
    const ctx = el.getContext("2d");
    ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
  } else {
    // ----- NORMALMODUS: feste Weltgröße 720×480, zentriert im Layout -----
    // CSS-Größen zurück dem CSS überlassen (breite max 720px, height auto)
    el.style.width = "";
    el.style.height = "";

    // interner Buffer in HiDPI, aber *ohne* Layout-Skalierung
    const renderW = Math.round(BASE_W * dpr);
    const renderH = Math.round(BASE_H * dpr);
    if (el.width !== renderW || el.height !== renderH) {
      el.width = renderW;
      el.height = renderH;
    }

    // nur dpr anwenden -> Weltkoordinaten bleiben 1:1 (720×480)
    const ctx = el.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
}

/**
 * Keyboard down
 */
window.addEventListener("keydown", (e) => {
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
  return (
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

  const active = Boolean(isFullscreenActive());
  fullscreenButton.textContent = active ? "Vollbild verlassen" : "Vollbild";
  fullscreenButton.setAttribute("aria-pressed", active ? "true" : "false");
  document.body.classList.toggle("is-fullscreen", active);
}
