let canvas;
let world;
let keyboard = new Keyboard();
let hasGameStarted = false;
let isGameOver = false;
let touchControlButtons = [];

// Logical base size of the game world
const BASE_W = 720;
const BASE_H = 480;
const WINDOWED_MAX_WIDTH = 880;
const WINDOWED_MIN_WIDTH = 280;
const WINDOWED_MARGIN_NARROW = 12;
const WINDOWED_MARGIN_WIDE = 24;
const TOUCH_CONTROLS_SPACING = 24;

document.addEventListener("DOMContentLoaded", initGameUI);

function initGameUI() {
  let buttons = getButtons();
  bindPrimaryButtons(buttons);
  registerLayoutObservers();
  registerTouchControls();
  updateFullscreenButtonState();
  fitCanvasToScreen();
}

function getButtons() {
  return {
    start: document.getElementById("start-button"),
    restart: document.getElementById("restart-button"),
    fullscreen: document.getElementById("fullscreen-button"),
    exit: document.getElementById("exit-button"),
  };
}

function bindPrimaryButtons(buttons) {
  bindButton(buttons.start, startGame);
  bindButton(buttons.restart, restartGame);
  bindButton(buttons.fullscreen, toggleFullscreen);
  bindButton(buttons.exit, exitToHome);
}

function bindButton(button, handler) {
  button?.addEventListener("click", handler);
}

function setBodyPlayingState(isPlaying) {
  document.body.classList.toggle("is-playing", isPlaying);
}

function registerLayoutObservers() {
  let fullscreenEvents = [
    "fullscreenchange",
    "webkitfullscreenchange",
    "mozfullscreenchange",
    "MSFullscreenChange",
  ];
  fullscreenEvents.forEach((event) =>
    document.addEventListener(event, onLayoutChange)
  );
  window.addEventListener("resize", onLayoutChange);
  window.addEventListener("blur", resetTouchControls);
}

function registerTouchControls() {
  let container = document.querySelector(".touch-controls");
  if (!container) return;
  touchControlButtons = Array.from(
    container.querySelectorAll("[data-key]")
  );
  touchControlButtons.forEach((button) => {
    let key = button.dataset.key;
    if (!key) return;
    let handlePress = (event) => {
      event.preventDefault();
      button.classList.add("is-active");
      keyboard[key] = true;
      if (typeof button.setPointerCapture === "function") {
        try {
          button.setPointerCapture(event.pointerId);
        } catch (err) {
          /* Pointer capture might fail on some browsers */
        }
      }
    };
    let handleRelease = (event) => {
      event.preventDefault();
      button.classList.remove("is-active");
      keyboard[key] = false;
      if (typeof button.releasePointerCapture === "function") {
        try {
          button.releasePointerCapture(event.pointerId);
        } catch (err) {
          /* Ignore release errors */
        }
      }
    };
    button.addEventListener("pointerdown", handlePress);
    button.addEventListener("pointerup", handleRelease);
    button.addEventListener("pointercancel", handleRelease);
    button.addEventListener("pointerleave", handleRelease);
    button.addEventListener("pointerout", handleRelease);
  });
}

function resetTouchControls() {
  touchControlButtons.forEach((button) => {
    let key = button.dataset.key;
    if (!key) return;
    button.classList.remove("is-active");
    keyboard[key] = false;
  });
}

/**
 * Handles any change in layout or fullscreen state.
 * @returns {void}
 */
function onLayoutChange() {
  updateFullscreenButtonState();
  fitCanvasToScreen();
}

/**
 * Initializes the game world and resizes the canvas.
 * @returns {void}
 */
function init() {
  canvas = document.getElementById("canvas");
  if (!canvas) return;

  canvas.width = BASE_W;
  canvas.height = BASE_H;

  world = new World(canvas, keyboard);
  world.setOnGameOver(handleGameOver);

  fitCanvasToScreen();
}

/**
 * Starts the game, hiding the start screen.
 * @returns {void}
 */
function startGame() {
  if (hasGameStarted) return;
  let ui = getGameScreens();
  hideStartScreen(ui.startScreen, ui.startButton);
  showGameContainer(ui.gameContainer);
  setBodyPlayingState(true);
  init();
  hasGameStarted = true;
}

function getGameScreens() {
  return {
    startScreen: document.getElementById("start-screen"),
    gameContainer: document.getElementById("game-container"),
    startButton: document.getElementById("start-button"),
  };
}

function hideStartScreen(startScreen, startButton) {
  startButton?.blur();
  startScreen?.classList.add("is-hidden");
  startScreen?.setAttribute("inert", "");
}

function showGameContainer(gameContainer) {
  gameContainer?.classList.remove("is-hidden");
  gameContainer?.removeAttribute("inert");
}

/**
 * Shows the game over dialog and focuses the restart button.
 * @returns {void}
 */
function handleGameOver(reason = "loss") {
  isGameOver = true;
  resetTouchControls();
  let elements = getGameOverElements();
  if (!elements.screen) return;
  updateGameOverContent(elements, reason);
  revealGameOverScreen(elements);
}

function getGameOverElements() {
  return {
    screen: document.getElementById("game-over-screen"),
    restartButton: document.getElementById("restart-button"),
    titleImage: document.querySelector(".game-over__title-image"),
    message: document.getElementById("game-over-message"),
  };
}

function updateGameOverContent(elements, reason) {
  if (!elements.titleImage || !elements.message) return;
  let content = getGameOverContent(reason);
  elements.titleImage.src = content.src;
  elements.titleImage.alt = content.alt;
  elements.message.textContent = content.text;
}

function getGameOverContent(reason) {
  if (reason === "win") {
    return {
      src: "./assets/img/You won, you lost/You Won B.png",
      alt: "You Win",
      text: "Pepe defeated the endboss. The fiesta can begin!",
    };
  }
  return {
    src: "./assets/img/You won, you lost/Game Over.png",
    alt: "Game Over",
    text: "Pepe was defeated. Give it another try!",
  };
}

function revealGameOverScreen(elements) {
  elements.screen.classList.remove("is-hidden");
  elements.screen.removeAttribute("inert");
  elements.restartButton?.focus();
}

/**
 * Reloads the page to restart the game.
 * @returns {void}
 */
function restartGame() {
  window.location.reload();
}

/**
 * Returns to the start screen and cleans up the current game instance.
 * @returns {void}
 */
function exitToHome() {
  let ui = getExitElements();
  ui.exitButton?.blur();
  exitFullscreenIfNeeded();
  resetWorldState();
  resetTouchControls();
  setBodyPlayingState(false);
  resetUiState(ui);
  updateFullscreenButtonState();
  fitCanvasToScreen();
}

function getExitElements() {
  return {
    startScreen: document.getElementById("start-screen"),
    gameContainer: document.getElementById("game-container"),
    gameOverScreen: document.getElementById("game-over-screen"),
    exitButton: document.getElementById("exit-button"),
    startButton: document.getElementById("start-button"),
  };
}

function exitFullscreenIfNeeded() {
  if (isFullscreenActive()) exitFullscreen();
}

function resetWorldState() {
  destroyWorld();
  recreateLevel();
  keyboard = new Keyboard();
  hasGameStarted = false;
  isGameOver = false;
}

function destroyWorld() {
  if (!world) return;
  world.destroy();
  world = null;
}

function recreateLevel() {
  if (typeof createLevel1 !== "function") return;
  level1 = createLevel1();
}

function resetUiState(ui) {
  hideGameOverScreen(ui.gameOverScreen);
  showStartScreen(ui.startScreen);
  hideGameContainer(ui.gameContainer);
  ui.startButton?.focus();
}

function hideGameOverScreen(gameOverScreen) {
  gameOverScreen?.classList.add("is-hidden");
  gameOverScreen?.setAttribute("inert", "");
}

function showStartScreen(startScreen) {
  startScreen?.classList.remove("is-hidden");
  startScreen?.removeAttribute("inert");
}

function hideGameContainer(gameContainer) {
  gameContainer?.classList.add("is-hidden");
  gameContainer?.setAttribute("inert", "");
}

/**
 * Fits the canvas to the available viewport while keeping the 3:2 ratio.
 * Applies HiDPI scaling so the rendering stays sharp.
 * @returns {void}
 */
function fitCanvasToScreen() {
  let el = document.getElementById("canvas");
  if (!el) return;
  let dpr = window.devicePixelRatio || 1;
  if (isFullscreenActive()) {
    fitCanvasFullscreen(el, dpr);
  } else {
    fitCanvasWindowed(el, dpr);
  }
}

function fitCanvasFullscreen(el, dpr) {
  let size = getFullscreenCanvasSize();
  setCanvasStyle(el, size.targetW, size.targetH);
  let render = getRenderSize(size, dpr);
  updateCanvasResolution(el, render.width, render.height);
  applyCanvasScale(el, size.targetW / BASE_W, dpr);
}

function getFullscreenCanvasSize() {
  let w = window.innerWidth;
  let h = window.innerHeight;
  let ratio = BASE_W / BASE_H;
  return {
    targetW: Math.min(w, h * ratio),
    targetH: Math.min(h, w / ratio),
  };
}

function setCanvasStyle(el, width, height) {
  el.style.width = `${width}px`;
  el.style.height = `${height}px`;
}

function getRenderSize(size, dpr) {
  return {
    width: Math.round(size.targetW * dpr),
    height: Math.round(size.targetH * dpr),
  };
}

function updateCanvasResolution(el, width, height) {
  if (el.width === width && el.height === height) return;
  el.width = width;
  el.height = height;
}

function applyCanvasScale(el, scale, dpr) {
  let ctx = el.getContext("2d");
  ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
}

function fitCanvasWindowed(el, dpr) {
  let size = getWindowedCanvasSize();
  setCanvasStyle(el, size.targetW, size.targetH);
  let render = getRenderSize(size, dpr);
  updateCanvasResolution(el, render.width, render.height);
  applyCanvasScale(el, size.targetW / BASE_W, dpr);
}

function getWindowedCanvasSize() {
  const ratio = BASE_W / BASE_H;
  const margin = getViewportMargin();
  const availableWidth = Math.max(window.innerWidth - margin * 2, 0);
  const availableHeight = Math.max(
    window.innerHeight - margin * 2 - getTouchControlsOffset(),
    0
  );

  if (availableWidth <= 0 || availableHeight <= 0) {
    return { targetW: BASE_W, targetH: BASE_H };
  }

  const widthLimit = Math.min(availableWidth, WINDOWED_MAX_WIDTH);
  const heightLimitedWidth = availableHeight * ratio;
  const minWidth = Math.min(WINDOWED_MIN_WIDTH, heightLimitedWidth, widthLimit);
  const targetW = Math.max(Math.min(widthLimit, heightLimitedWidth), minWidth);
  const targetH = targetW / ratio;

  if (!Number.isFinite(targetW) || !Number.isFinite(targetH) || targetW <= 0 || targetH <= 0) {
    return { targetW: BASE_W, targetH: BASE_H };
  }

  return { targetW, targetH };
}

function getViewportMargin() {
  return window.innerWidth <= 1024 ? WINDOWED_MARGIN_NARROW : WINDOWED_MARGIN_WIDE;
}

function getTouchControlsOffset() {
  const controls = document.querySelector(".touch-controls");
  if (!isElementVisible(controls)) return 0;
  return controls.getBoundingClientRect().height + TOUCH_CONTROLS_SPACING;
}

function isElementVisible(element) {
  if (!element) return false;
  const styles = window.getComputedStyle(element);
  if (styles.display === "none" || styles.visibility === "hidden" || styles.opacity === "0") {
    return false;
  }
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

/**
 * Handles keyboard keydown events.
 * @param {KeyboardEvent} e - The keyboard event.
 * @returns {void}
 */
window.addEventListener("keydown", onKeyDown);

/**
 * Handles keyboard keyup events.
 * @param {KeyboardEvent} e - The keyboard event.
 * @returns {void}
 */
window.addEventListener("keyup", onKeyUp);

function onKeyDown(e) {
  if (handleGameOverKeys(e)) return;
  if (handleStartStopKeys(e)) return;
  updateMovementState(e, true);
}

function handleGameOverKeys(e) {
  if (!isGameOver) return false;
  if (["Space", "Enter"].includes(e.code)) {
    e.preventDefault();
    restartGame();
    return true;
  }
  if (e.code === "Escape") {
    e.preventDefault();
    exitToHome();
  }
  return true;
}

function handleStartStopKeys(e) {
  if (!hasGameStarted && ["Space", "Enter"].includes(e.code)) {
    e.preventDefault();
    startGame();
    return true;
  }
  if (hasGameStarted && e.code === "Escape") {
    e.preventDefault();
    exitToHome();
    return true;
  }
  return false;
}

function updateMovementState(e, isPressed) {
  let mapping = {
    39: "RIGHT",
    37: "LEFT",
    38: "UP",
    40: "DOWN",
    32: "SPACE",
    68: "D",
  };
  let key = mapping[e.keyCode];
  if (key) keyboard[key] = isPressed;
}

function onKeyUp(e) {
  updateMovementState(e, false);
}

/**
 * Toggles fullscreen mode for the game container.
 * @returns {void}
 */
function toggleFullscreen() {
  let gameContainer = document.getElementById("game-container");
  if (!gameContainer) return;

  if (isFullscreenActive()) {
    exitFullscreen();
  } else {
    requestFullscreen(gameContainer);
  }
}

/**
 * Determines whether any element is currently in fullscreen.
 * @returns {boolean} True when the document is in fullscreen.
 */
function isFullscreenActive() {
  return Boolean(
    document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
  );
}

/**
 * Requests fullscreen mode for the provided element.
 * @param {HTMLElement} element - Element to display in fullscreen.
 * @returns {void}
 */
function requestFullscreen(element) {
  if (element.requestFullscreen) element.requestFullscreen();
  else if (element.webkitRequestFullscreen) element.webkitRequestFullscreen();
  else if (element.mozRequestFullScreen) element.mozRequestFullScreen();
  else if (element.msRequestFullscreen) element.msRequestFullscreen();
}

/**
 * Exits fullscreen mode on the document.
 * @returns {void}
 */
function exitFullscreen() {
  if (document.exitFullscreen) document.exitFullscreen();
  else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
  else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
  else if (document.msExitFullscreen) document.msExitFullscreen();
}

/**
 * Updates the fullscreen button label and pressed state.
 * @returns {void}
 */
function updateFullscreenButtonState() {
  let fullscreenButton = document.getElementById("fullscreen-button");
  if (!fullscreenButton) return;

  let active = isFullscreenActive();
  fullscreenButton.textContent = active ? "Exit fullscreen" : "Fullscreen";
  fullscreenButton.setAttribute("aria-pressed", active ? "true" : "false");
  document.body.classList.toggle("is-fullscreen", active);
}
