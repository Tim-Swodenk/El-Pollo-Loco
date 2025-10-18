let canvas;
let world;
let keyboard = new Keyboard();
let hasGameStarted = false;

document.addEventListener("DOMContentLoaded", () => {
  const startButton = document.getElementById("start-button");
  const fullscreenButton = document.getElementById("fullscreen-button");

  if (startButton) {
    startButton.addEventListener("click", startGame);
  }

  if (fullscreenButton) {
    fullscreenButton.addEventListener("click", toggleFullscreen);
    updateFullscreenButtonState();
  }
});

document.addEventListener("fullscreenchange", updateFullscreenButtonState);
document.addEventListener(
  "webkitfullscreenchange",
  updateFullscreenButtonState
);
document.addEventListener("mozfullscreenchange", updateFullscreenButtonState);
document.addEventListener("MSFullscreenChange", updateFullscreenButtonState);

/**
 * Initializes the game world and canvas.
 * @returns {void}
 */
function init() {
  canvas = document.getElementById("canvas");
  world = new World(canvas, keyboard);
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
 * Updates keyboard state on key press.
 * @param {KeyboardEvent} e - Keydown event.
 * @returns {void}
 */
window.addEventListener("keydown", (e) => {
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

/**
 * Toggles fullscreen mode for the game container.
 * @returns {void}
 */
function toggleFullscreen() {
  const gameContainer = document.getElementById("game-container");

  if (!gameContainer) {
    return;
  }

  if (isFullscreenActive()) {
    exitFullscreen();
  } else {
    requestFullscreen(gameContainer);
  }
}

/**
 * Checks if fullscreen is currently active.
 * @returns {boolean}
 */
function isFullscreenActive() {
  return (
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement
  );
}

/**
 * Requests fullscreen mode for a given element.
 * @param {HTMLElement} element - Element to display in fullscreen.
 * @returns {void}
 */
function requestFullscreen(element) {
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen();
  }
}

/**
 * Exits fullscreen mode if active.
 * @returns {void}
 */
function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
}

/**
 * Updates the fullscreen button label and state.
 * @returns {void}
 */
function updateFullscreenButtonState() {
  const fullscreenButton = document.getElementById("fullscreen-button");

  if (!fullscreenButton) {
    return;
  }

  const active = Boolean(isFullscreenActive());
  fullscreenButton.textContent = active ? "Vollbild verlassen" : "Vollbild";
  fullscreenButton.setAttribute("aria-pressed", active ? "true" : "false");
  document.body.classList.toggle("is-fullscreen", active);
}
