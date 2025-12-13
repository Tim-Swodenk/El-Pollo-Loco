let canvas;
let world;
let keyboard = new Keyboard();
let hasGameStarted = false;
let isGameOver = false;
let touchControlButtons = [];
let backgroundMusic;
let muteButton;
let isMuted = false;

const MUSIC_SRC = "audio/background-music.wav";

// Logical base size of the game world
const BASE_W = 720;
const BASE_H = 480;

document.addEventListener("DOMContentLoaded", initGameUI);

/**
 * Initializes the UI wiring once the DOM is ready.
 * @returns {void}
 */
function initGameUI() {
  let buttons = getButtons();
  bindPrimaryButtons(buttons);
  initializeAudio(buttons.mute);
  registerLayoutObservers();
  registerTouchControls();
  updateFullscreenButtonState();
  fitCanvasToScreen();
}

/**
 * Collects primary control buttons from the DOM.
 * @returns {{start: HTMLElement|null, restart: HTMLElement|null, fullscreen: HTMLElement|null, exit: HTMLElement|null}}
 */
function getButtons() {
  return {
    start: document.getElementById("start-button"),
    restart: document.getElementById("restart-button"),
    fullscreen: document.getElementById("fullscreen-button"),
    exit: document.getElementById("exit-button"),
    mute: document.getElementById("mute-button"),
  };
}

/**
 * Binds click handlers to the primary buttons.
 * @param {Object} buttons - Button references.
 * @returns {void}
 */
function bindPrimaryButtons(buttons) {
  bindButton(buttons.start, startGame);
  bindButton(buttons.restart, restartGame);
  bindButton(buttons.fullscreen, toggleFullscreen);
  bindButton(buttons.exit, exitToHome);
  bindButton(buttons.mute, toggleMute);
}

function initializeAudio(button) {
  backgroundMusic = new Audio(MUSIC_SRC);
  backgroundMusic.loop = true;
  backgroundMusic.volume = 0.35;
  muteButton = button;
  updateMuteButtonState();
}

/**
 * Safely attaches a click handler when the button exists.
 * @param {HTMLElement|null} button - Target button.
 * @param {Function} handler - Handler to register.
 * @returns {void}
 */
function bindButton(button, handler) {
  button?.addEventListener("click", handler);
}

/**
 * Registers listeners that react to layout-affecting events.
 * @returns {void}
 */
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

/**
 * Sets up touch control buttons and their pointer handlers.
 * @returns {void}
 */
function registerTouchControls() {
  let container = document.querySelector(".touch-controls");
  if (!container) return;
  touchControlButtons = Array.from(container.querySelectorAll("[data-key]"));
  touchControlButtons.forEach((button) => {
    let key = button.dataset.key;
    if (!key) return;
    let handlePress = (event) => {
      event.preventDefault();
      setTouchButtonState(button, key, true);
      togglePointerCapture(button, event, true);
    };
    let handleRelease = (event) => {
      event.preventDefault();
      setTouchButtonState(button, key, false);
      togglePointerCapture(button, event, false);
    };
    button.addEventListener("pointerdown", handlePress);
    button.addEventListener("pointerup", handleRelease);
    button.addEventListener("pointercancel", handleRelease);
    button.addEventListener("pointerleave", handleRelease);
    button.addEventListener("pointerout", handleRelease);
  });
}

/**
 * Toggles the visual and logical state of a touch control button.
 * @param {HTMLElement} button - Button to update.
 * @param {string} key - Keyboard mapping key.
 * @param {boolean} isActive - Whether the button is pressed.
 * @returns {void}
 */
function setTouchButtonState(button, key, isActive) {
  if (!key) return;
  button.classList.toggle("is-active", isActive);
  keyboard[key] = isActive;
}

/**
 * Safely toggles pointer capture on a button to keep drag interactions stable.
 * @param {HTMLElement} button - Target button.
 * @param {PointerEvent} event - Pointer event used for capture.
 * @param {boolean} shouldCapture - True to capture, false to release.
 * @returns {void}
 */
function togglePointerCapture(button, event, shouldCapture) {
  let method = shouldCapture ? "setPointerCapture" : "releasePointerCapture";
  if (typeof button[method] !== "function") return;
  try {
    button[method](event.pointerId);
  } catch (err) {
    /* Capture might fail on unsupported browsers */
  }
}

function startBackgroundMusic() {
  if (!backgroundMusic) return;
  backgroundMusic.muted = isMuted;
  if (backgroundMusic.paused) {
    backgroundMusic.currentTime = 0;
    backgroundMusic.play().catch(() => {});
  }
}

function stopBackgroundMusic() {
  if (!backgroundMusic) return;
  backgroundMusic.pause();
  backgroundMusic.currentTime = 0;
}

function toggleMute() {
  isMuted = !isMuted;
  applyMuteState();
}

function applyMuteState() {
  if (backgroundMusic) {
    backgroundMusic.muted = isMuted;
  }
  updateMuteButtonState();
}

function updateMuteButtonState() {
  if (!muteButton) return;
  muteButton.classList.toggle("is-muted", isMuted);
  muteButton.setAttribute("aria-pressed", isMuted ? "true" : "false");
  muteButton.setAttribute("aria-label", isMuted ? "Sound off" : "Sound on");
}

/**
 * Resets all touch controls to their inactive state.
 * @returns {void}
 */
function resetTouchControls() {
  touchControlButtons.forEach((button) => {
    let key = button.dataset.key;
    setTouchButtonState(button, key, false);
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
  init();
  startBackgroundMusic();
  hasGameStarted = true;
}

/**
 * Retrieves the main UI containers used for game transitions.
 * @returns {{startScreen: HTMLElement|null, gameContainer: HTMLElement|null, startButton: HTMLElement|null}}
 */
function getGameScreens() {
  return {
    startScreen: document.getElementById("start-screen"),
    gameContainer: document.getElementById("game-container"),
    startButton: document.getElementById("start-button"),
  };
}

/**
 * Hides the start screen and removes focus from the start button.
 * @param {HTMLElement|null} startScreen - Screen to hide.
 * @param {HTMLElement|null} startButton - Button to blur.
 * @returns {void}
 */
function hideStartScreen(startScreen, startButton) {
  startButton?.blur();
  startScreen?.classList.add("is-hidden");
  startScreen?.setAttribute("inert", "");
}

/**
 * Reveals the game container so the canvas becomes visible.
 * @param {HTMLElement|null} gameContainer - Container to show.
 * @returns {void}
 */
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

/**
 * Collects DOM references used to present the game over overlay.
 * @returns {{screen: HTMLElement|null, restartButton: HTMLElement|null, titleImage: HTMLImageElement|null, message: HTMLElement|null}}
 */
function getGameOverElements() {
  return {
    screen: document.getElementById("game-over-screen"),
    restartButton: document.getElementById("restart-button"),
    titleImage: document.querySelector(".game-over__title-image"),
    message: document.getElementById("game-over-message"),
  };
}

/**
 * Updates the game over overlay with the appropriate imagery and text.
 * @param {Object} elements - Game over element references.
 * @param {string} reason - Outcome reason (win or loss).
 * @returns {void}
 */
function updateGameOverContent(elements, reason) {
  if (!elements.titleImage || !elements.message) return;
  let content = getGameOverContent(reason);
  elements.titleImage.src = content.src;
  elements.titleImage.alt = content.alt;
  elements.message.textContent = content.text;
}

/**
 * Provides image and text content based on the game over reason.
 * @param {string} reason - Either "win" or "loss".
 * @returns {{src: string, alt: string, text: string}} Content describing the outcome.
 */
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

/**
 * Reveals the game over screen and moves focus to the restart button.
 * @param {Object} elements - Game over element references.
 * @returns {void}
 */
function revealGameOverScreen(elements) {
  elements.screen.classList.remove("is-hidden");
  elements.screen.removeAttribute("inert");
  elements.restartButton?.focus();
}

/**
 * Resets the game state without reloading the page.
 * @returns {void}
 */
function restartGame() {
  if (!hasGameStarted) return;

  let elements = getGameOverElements();
  elements.restartButton?.blur();

  resetWorldForRestart();
  hideGameOverScreen(elements.screen);
  showGameContainer(document.getElementById("game-container"));

  isGameOver = false;
  hasGameStarted = true;
  init();
  startBackgroundMusic();
}

/**
 * Returns to the start screen and cleans up the current game instance.
 * @returns {void}
 */
function exitToHome() {
  let ui = getExitElements();
  ui.exitButton?.blur();
  exitFullscreenIfNeeded();
  stopBackgroundMusic();
  resetWorldState();
  resetTouchControls();
  resetUiState(ui);
  updateFullscreenButtonState();
}

/**
 * Collects UI elements required to exit the game view.
 * @returns {{startScreen: HTMLElement|null, gameContainer: HTMLElement|null, gameOverScreen: HTMLElement|null, exitButton: HTMLElement|null, startButton: HTMLElement|null}}
 */
function getExitElements() {
  return {
    startScreen: document.getElementById("start-screen"),
    gameContainer: document.getElementById("game-container"),
    gameOverScreen: document.getElementById("game-over-screen"),
    exitButton: document.getElementById("exit-button"),
    startButton: document.getElementById("start-button"),
  };
}

/**
 * Exits fullscreen mode when it is active.
 * @returns {void}
 */
function exitFullscreenIfNeeded() {
  if (isFullscreenActive()) exitFullscreen();
}

/**
 * Resets the world state so a new game can start cleanly.
 * @returns {void}
 */
function resetWorldState() {
  resetWorldForRestart();
  hasGameStarted = false;
  isGameOver = false;
  stopBackgroundMusic();
}

function resetWorldForRestart() {
  destroyWorld();
  recreateLevel();
  keyboard = new Keyboard();
  resetTouchControls();
}

/**
 * Destroys the current world instance if it exists.
 * @returns {void}
 */
function destroyWorld() {
  if (!world) return;
  world.destroy();
  world = null;
}

/**
 * Recreates the default level when the factory is available.
 * @returns {void}
 */
function recreateLevel() {
  if (typeof createLevel1 !== "function") return;
  level1 = createLevel1();
}

/**
 * Restores UI to the initial state after leaving the game.
 * @param {Object} ui - References to UI elements.
 * @returns {void}
 */
function resetUiState(ui) {
  hideGameOverScreen(ui.gameOverScreen);
  showStartScreen(ui.startScreen);
  hideGameContainer(ui.gameContainer);
  ui.startButton?.focus();
}

/**
 * Hides the game over overlay.
 * @param {HTMLElement|null} gameOverScreen - Screen to hide.
 * @returns {void}
 */
function hideGameOverScreen(gameOverScreen) {
  gameOverScreen?.classList.add("is-hidden");
  gameOverScreen?.setAttribute("inert", "");
}

/**
 * Shows the start screen again.
 * @param {HTMLElement|null} startScreen - Screen to show.
 * @returns {void}
 */
function showStartScreen(startScreen) {
  startScreen?.classList.remove("is-hidden");
  startScreen?.removeAttribute("inert");
}

/**
 * Hides the game container so gameplay stops being visible.
 * @param {HTMLElement|null} gameContainer - Container to hide.
 * @returns {void}
 */
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

/**
 * Scales the canvas when fullscreen is active.
 * @param {HTMLCanvasElement} el - Canvas element.
 * @param {number} dpr - Device pixel ratio.
 * @returns {void}
 */
function fitCanvasFullscreen(el, dpr) {
  let size = getFullscreenCanvasSize();
  setCanvasStyle(el, size.targetW, size.targetH);
  let render = getRenderSize(size, dpr);
  updateCanvasResolution(el, render.width, render.height);
  applyCanvasScale(el, size.targetW / BASE_W, dpr);
}

/**
 * Calculates the best possible fullscreen canvas size within the viewport.
 * @returns {{targetW: number, targetH: number}} Width and height preserving aspect ratio.
 */
function getFullscreenCanvasSize() {
  let w = window.innerWidth;
  let h = window.innerHeight;
  let ratio = BASE_W / BASE_H;
  return {
    targetW: Math.min(w, h * ratio),
    targetH: Math.min(h, w / ratio),
  };
}

/**
 * Applies inline sizing styles to the canvas element.
 * @param {HTMLCanvasElement} el - Canvas element.
 * @param {number} width - Target CSS width.
 * @param {number} height - Target CSS height.
 * @returns {void}
 */
function setCanvasStyle(el, width, height) {
  el.style.width = `${width}px`;
  el.style.height = `${height}px`;
}

/**
 * Calculates the render size in physical pixels based on device pixel ratio.
 * @param {{targetW: number, targetH: number}} size - CSS pixel size.
 * @param {number} dpr - Device pixel ratio.
 * @returns {{width: number, height: number}} Calculated render size.
 */
function getRenderSize(size, dpr) {
  return {
    width: Math.round(size.targetW * dpr),
    height: Math.round(size.targetH * dpr),
  };
}

/**
 * Updates the canvas resolution if the dimensions changed.
 * @param {HTMLCanvasElement} el - Canvas element.
 * @param {number} width - Desired width.
 * @param {number} height - Desired height.
 * @returns {void}
 */
function updateCanvasResolution(el, width, height) {
  if (el.width === width && el.height === height) return;
  el.width = width;
  el.height = height;
}

/**
 * Applies a transform to keep canvas rendering sharp with scaling.
 * @param {HTMLCanvasElement} el - Canvas element.
 * @param {number} scale - Scale factor relative to base size.
 * @param {number} dpr - Device pixel ratio.
 * @returns {void}
 */
function applyCanvasScale(el, scale, dpr) {
  let ctx = el.getContext("2d");
  ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
}

/**
 * Applies canvas sizing when not in fullscreen mode.
 * @param {HTMLCanvasElement} el - Canvas element.
 * @param {number} dpr - Device pixel ratio.
 * @returns {void}
 */
function fitCanvasWindowed(el, dpr) {
  clearCanvasStyle(el);
  let render = getRenderSize({ targetW: BASE_W, targetH: BASE_H }, dpr);
  updateCanvasResolution(el, render.width, render.height);
  applyCanvasScale(el, 1, dpr);
}

/**
 * Removes inline sizing styles from the canvas element.
 * @param {HTMLCanvasElement} el - Canvas element.
 * @returns {void}
 */
function clearCanvasStyle(el) {
  el.style.width = "";
  el.style.height = "";
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

/**
 * Responds to keydown events to manage game flow and movement.
 * @param {KeyboardEvent} e - The keyboard event.
 * @returns {void}
 */
function onKeyDown(e) {
  if (handleGameOverKeys(e)) return;
  if (handleStartStopKeys(e)) return;
  updateMovementState(e, true);
}

/**
 * Handles keyboard interactions when the game is over.
 * @param {KeyboardEvent} e - The keyboard event.
 * @returns {boolean} True if the event was consumed.
 */
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

/**
 * Handles start and escape keys during normal play.
 * @param {KeyboardEvent} e - The keyboard event.
 * @returns {boolean} True if the event was consumed.
 */
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

/**
 * Updates movement flags on the keyboard helper based on key state.
 * @param {KeyboardEvent} e - The keyboard event.
 * @param {boolean} isPressed - Whether the key is pressed.
 * @returns {void}
 */
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

/**
 * Clears movement flags when keys are released.
 * @param {KeyboardEvent} e - The keyboard event.
 * @returns {void}
 */
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
