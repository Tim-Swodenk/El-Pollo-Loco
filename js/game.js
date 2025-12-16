const MUSIC_SRC = "audio/background-music.wav";
const SOUND_EFFECT_SOURCES = {
  jump: "audio/jump.wav",
  hurt: "audio/hurt.mp3",
  itemPickup: "audio/item-pickup.mp3",
};
const MUTE_STORAGE_KEY = "audioMuted";
const BASE_W = 720;
const BASE_H = 480;

const state = {
  hasGameStarted: false,
  isGameOver: false,
  keyboardFactory: () => new Keyboard(),
  keyboard: null,
  world: null,
  canvas: null,
};

let audioManager;
let touchControls = { reset: () => {}, unbind: () => {} };

/**
 * Plays a named sound effect via the audio manager.
 * @param {string} name - Registered sound effect key.
 * @returns {void}
 */
function playSoundEffect(name) {
  audioManager?.playSfx(name);
}

document.addEventListener("DOMContentLoaded", initGameUI);

/**
 * Initializes the UI wiring once the DOM is ready.
 * @returns {void}
 */
function initGameUI() {
  state.keyboard = state.keyboardFactory();
  let buttons = DomRefs.getButtons();

  bindPrimaryButtons(buttons);
  audioManager = AudioManager.createAudioManager({
    musicSrc: MUSIC_SRC,
    sfxSources: SOUND_EFFECT_SOURCES,
    storageKey: MUTE_STORAGE_KEY,
  });
  audioManager.init([buttons.mute, buttons.touchMute].filter(Boolean));

  touchControls = TouchControls.bindTouchControls({
    keyboard: () => state.keyboard,
    containerSelector: ".touch-controls",
  });

  ContextMenuGuards.blockContextMenu({
    elements: getContextMenuElements(buttons),
    onBlocked: touchControls.reset,
  });

  KeyboardControls.bindKeyboardControls({
    keyboard: () => state.keyboard,
    getState: () => state,
    actions: {
      startGame,
      restartGame,
      exitToHome,
    },
  });

  registerLayoutObservers(buttons.fullscreen);
}

/**
 * Binds click handlers to the primary buttons.
 * @param {Object} buttons - Button references.
 * @returns {void}
 */
function bindPrimaryButtons(buttons) {
  bindButton(buttons.start, startGame);
  bindButton(buttons.restart, restartGame);
  bindButton(buttons.fullscreen, () =>
    CanvasFit.toggleFullscreen(
      document.getElementById("game-container"),
      CanvasFit.isFullscreenActive
    )
  );
  bindButton(buttons.exit, exitToHome);
  bindButton(buttons.mute, () => audioManager.toggleMute());
  bindButton(buttons.touchMute, () => audioManager.toggleMute());
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
 * Collects elements that should block the context menu.
 * @param {Object} buttons - Control buttons.
 * @returns {HTMLElement[]}
 */
function getContextMenuElements(buttons) {
  let touchButtons = Array.from(
    document.querySelectorAll(".touch-controls__button")
  );
  return [
    document.getElementById("game-container"),
    document.getElementById("canvas"),
    buttons.start,
    buttons.restart,
    buttons.fullscreen,
    buttons.exit,
    buttons.mute,
    buttons.touchMute,
    ...touchButtons,
  ];
}

/**
 * Handles any change in layout or fullscreen state.
 * @param {HTMLElement|null} fullscreenButton - Fullscreen toggle button.
 * @returns {void}
 */
function registerLayoutObservers(fullscreenButton) {
  let onLayoutChange = () => {
    CanvasFit.updateFullscreenButtonState({
      button: fullscreenButton,
      isFullscreenActive: CanvasFit.isFullscreenActive,
    });
    CanvasFit.fitCanvasToScreen({
      canvas: state.canvas,
      baseW: BASE_W,
      baseH: BASE_H,
      isFullscreenActive: CanvasFit.isFullscreenActive,
    });
  };

  [
    "fullscreenchange",
    "webkitfullscreenchange",
    "mozfullscreenchange",
    "MSFullscreenChange",
  ].forEach((event) => document.addEventListener(event, onLayoutChange));
  window.addEventListener("resize", onLayoutChange);
  window.addEventListener("blur", touchControls.reset);

  onLayoutChange();
}

/**
 * Initializes the game world and resizes the canvas.
 * @returns {void}
 */
function initWorld() {
  let canvas = ensureCanvas();
  if (!canvas) return;

  state.world = WorldLifecycle.createWorld({
    canvas,
    keyboard: state.keyboard,
    onGameOver: handleGameOver,
  });

  CanvasFit.fitCanvasToScreen({
    canvas,
    baseW: BASE_W,
    baseH: BASE_H,
    isFullscreenActive: CanvasFit.isFullscreenActive,
  });
}

/**
 * Ensures the canvas reference exists and is sized to base dimensions.
 * @returns {HTMLCanvasElement|null}
 */
function ensureCanvas() {
  if (!state.canvas) {
    state.canvas = document.getElementById("canvas");
    if (state.canvas) {
      state.canvas.width = BASE_W;
      state.canvas.height = BASE_H;
    }
  }
  return state.canvas;
}

/**
 * Starts the game, hiding the start screen.
 * @returns {void}
 */
function startGame() {
  if (state.hasGameStarted) return;
  let ui = DomRefs.getGameScreens();
  Screens.hideStartScreen(ui.startScreen, ui.startButton);
  Screens.showGameContainer(ui.gameContainer);
  initWorld();
  audioManager.startMusic();
  state.hasGameStarted = true;
  state.isGameOver = false;
}

/**
 * Shows the game over dialog and focuses the restart button.
 * @param {string} [reason="loss"] - Outcome reason.
 * @returns {void}
 */
function handleGameOver(reason = "loss") {
  state.isGameOver = true;
  if (reason === "loss") {
    audioManager.stopMusic();
  }
  touchControls.reset();
  let elements = DomRefs.getGameOverElements();
  if (!elements.screen) return;
  Screens.updateGameOverContent(elements, reason);
  Screens.revealGameOverScreen(elements);
}

/**
 * Resets the game state without reloading the page.
 * @returns {void}
 */
function restartGame() {
  if (!state.hasGameStarted) return;

  let elements = DomRefs.getGameOverElements();
  elements.restartButton?.blur();

  state.keyboard = WorldLifecycle.resetWorldForRestart({
    destroyWorld: () => WorldLifecycle.destroyWorld(state.world),
    recreateLevel: WorldLifecycle.recreateLevelIfPossible,
    keyboardFactory: state.keyboardFactory,
    onTouchReset: touchControls.reset,
  });
  state.world = null;

  Screens.hideGameOverScreen(elements.screen);
  Screens.showGameContainer(DomRefs.getGameScreens().gameContainer);

  state.isGameOver = false;
  state.hasGameStarted = true;
  initWorld();
  audioManager.startMusic();
}

/**
 * Returns to the start screen and cleans up the current game instance.
 * @returns {void}
 */
function exitToHome() {
  let ui = DomRefs.getExitElements();
  ui.exitButton?.blur();
  if (CanvasFit.isFullscreenActive()) {
    CanvasFit.exitFullscreen();
  }
  audioManager.stopMusic();
  WorldLifecycle.destroyWorld(state.world);
  WorldLifecycle.recreateLevelIfPossible();
  touchControls.reset();
  Screens.resetUiState(ui);

  state.world = null;
  state.keyboard = state.keyboardFactory();
  state.hasGameStarted = false;
  state.isGameOver = false;

  CanvasFit.updateFullscreenButtonState({
    button: DomRefs.getButtons().fullscreen,
    isFullscreenActive: CanvasFit.isFullscreenActive,
  });
}
