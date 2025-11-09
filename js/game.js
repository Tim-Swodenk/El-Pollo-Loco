let canvas;
let world;
let keyboard = new Keyboard();
let hasGameStarted = false;
let isGameOver = false;

// Logical base size of the game world
const BASE_W = 720;
const BASE_H = 480;

document.addEventListener("DOMContentLoaded", () => {
  let startButton = document.getElementById("start-button");
  let restartButton = document.getElementById("restart-button");
  let fullscreenButton = document.getElementById("fullscreen-button");
  let exitButton = document.getElementById("exit-button");

  if (startButton) {
    startButton.addEventListener("click", startGame);
  }
  if (restartButton) {
    restartButton.addEventListener("click", restartGame);
  }
  if (fullscreenButton) {
    fullscreenButton.addEventListener("click", toggleFullscreen);
  }
  if (exitButton) {
    exitButton.addEventListener("click", exitToHome);
  }

  // Observe layout changes that may affect the canvas size
  document.addEventListener("fullscreenchange", onLayoutChange);
  document.addEventListener("webkitfullscreenchange", onLayoutChange);
  document.addEventListener("mozfullscreenchange", onLayoutChange);
  document.addEventListener("MSFullscreenChange", onLayoutChange);
  window.addEventListener("resize", onLayoutChange);

  updateFullscreenButtonState();
  fitCanvasToScreen();
});

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

  let startScreen = document.getElementById("start-screen");
  let gameContainer = document.getElementById("game-container");
  let startButton = document.getElementById("start-button");

  startButton?.blur();
  startScreen?.classList.add("is-hidden");
  startScreen?.setAttribute("inert", "");
  gameContainer?.classList.remove("is-hidden");
  gameContainer?.removeAttribute("inert");

  init();
  hasGameStarted = true;
}

/**
 * Shows the game over dialog and focuses the restart button.
 * @returns {void}
 */
function handleGameOver(reason = "loss") {
  isGameOver = true;
  let gameOverScreen = document.getElementById("game-over-screen");
  let restartButton = document.getElementById("restart-button");
  let titleImage = document.querySelector(".game-over__title-image");
  let message = document.getElementById("game-over-message");
  if (!gameOverScreen) return;

  if (titleImage && message) {
    if (reason === "win") {
      titleImage.src = "./assets/img/You won, you lost/You Won B.png";
      titleImage.alt = "You Win";
      message.textContent = "Pepe defeated the endboss. The fiesta can begin!";
    } else {
      titleImage.src = "./assets/img/You won, you lost/Game Over.png";
      titleImage.alt = "Game Over";
      message.textContent = "Pepe was defeated. Give it another try!";
    }
  }

  gameOverScreen.classList.remove("is-hidden");
  gameOverScreen.removeAttribute("inert");
  restartButton?.focus();
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
  let startScreen = document.getElementById("start-screen");
  let gameContainer = document.getElementById("game-container");
  let gameOverScreen = document.getElementById("game-over-screen");
  let exitButton = document.getElementById("exit-button");
  let startButton = document.getElementById("start-button");

  exitButton?.blur();

  if (isFullscreenActive()) {
    exitFullscreen();
  }

  if (world) {
    world.destroy();
    world = null;
  }

  if (typeof createLevel1 === "function") {
    level1 = createLevel1();
  }

  keyboard = new Keyboard();
  hasGameStarted = false;
  isGameOver = false;

  gameOverScreen?.classList.add("is-hidden");
  gameOverScreen?.setAttribute("inert", "");

  startScreen?.classList.remove("is-hidden");
  startScreen?.removeAttribute("inert");
  gameContainer?.classList.add("is-hidden");
  gameContainer?.setAttribute("inert", "");

  startButton?.focus();

  updateFullscreenButtonState();
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
    let w = window.innerWidth;
    let h = window.innerHeight;
    let targetW = Math.min(w, h * (BASE_W / BASE_H));
    let targetH = Math.min(h, w * (BASE_H / BASE_W));

    el.style.width = `${targetW}px`;
    el.style.height = `${targetH}px`;

    let renderW = Math.round(targetW * dpr);
    let renderH = Math.round(targetH * dpr);
    if (el.width !== renderW || el.height !== renderH) {
      el.width = renderW;
      el.height = renderH;
    }

    let scale = targetW / BASE_W;
    let ctx = el.getContext("2d");
    ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
  } else {
    el.style.width = "";
    el.style.height = "";

    let renderW = Math.round(BASE_W * dpr);
    let renderH = Math.round(BASE_H * dpr);
    if (el.width !== renderW || el.height !== renderH) {
      el.width = renderW;
      el.height = renderH;
    }

    let ctx = el.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
}

/**
 * Handles keyboard keydown events.
 * @param {KeyboardEvent} e - The keyboard event.
 * @returns {void}
 */
window.addEventListener("keydown", (e) => {
  if (isGameOver) {
    if (e.code === "Space" || e.code === "Enter") {
      e.preventDefault();
      restartGame();
    } else if (e.code === "Escape") {
      e.preventDefault();
      exitToHome();
    }
    return;
  }
  if (hasGameStarted && e.code === "Escape") {
    e.preventDefault();
    exitToHome();
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
 * Handles keyboard keyup events.
 * @param {KeyboardEvent} e - The keyboard event.
 * @returns {void}
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
