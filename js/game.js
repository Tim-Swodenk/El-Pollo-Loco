let canvas;
let world;
let keyboard = new Keyboard();
let hasGameStarted = false;
let isGameOver = false;

document.addEventListener("DOMContentLoaded", () => {
  const startButton = document.getElementById("start-button");
  const restartButton = document.getElementById("restart-button");
  if (startButton) {
    startButton.addEventListener("click", startGame);
  }
  if (restartButton) {
    restartButton.addEventListener("click", restartGame);
  }
});

/**
 * Initializes the game world and canvas.
 * @returns {void}
 */
function init() {
  canvas = document.getElementById("canvas");
  world = new World(canvas, keyboard);
  world.setOnGameOver(handleGameOver);
}

/**
 * Hides the start screen and initializes the game once.
 * @returns {void}
 */
function startGame() {
  if (hasGameStarted) {
    return;
  }

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
 * Displays the game over screen and focuses the restart action.
 * @returns {void}
 */
function handleGameOver() {
  isGameOver = true;
  const gameOverScreen = document.getElementById("game-over-screen");
  const restartButton = document.getElementById("restart-button");
  if (!gameOverScreen) {
    return;
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
 * Updates keyboard state on key press.
 * @param {KeyboardEvent} e - Keydown event.
 * @returns {void}
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

  if (e.keyCode == 39) {
    keyboard.RIGHT = true;
  }

  if (e.keyCode == 37) {
    keyboard.LEFT = true;
  }

  if (e.keyCode == 38) {
    keyboard.UP = true;
  }

  if (e.keyCode == 40) {
    keyboard.DOWN = true;
  }

  if (e.keyCode == 32) {
    keyboard.SPACE = true;
  }
  if (e.keyCode == 68) {
    keyboard.D = true;
  }
});

/**
 * Resets keyboard state on key release.
 * @param {KeyboardEvent} e - Keyup event.
 * @returns {void}
 */
window.addEventListener("keyup", (e) => {
  if (isGameOver) {
    return;
  }
  if (e.keyCode == 39) {
    keyboard.RIGHT = false;
  }

  if (e.keyCode == 37) {
    keyboard.LEFT = false;
  }

  if (e.keyCode == 38) {
    keyboard.UP = false;
  }

  if (e.keyCode == 40) {
    keyboard.DOWN = false;
  }

  if (e.keyCode == 32) {
    keyboard.SPACE = false;
  }

  if (e.keyCode == 68) {
    keyboard.D = false;
  }
});
