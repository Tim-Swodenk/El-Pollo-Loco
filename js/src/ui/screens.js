(function (global) {
  "use strict";

  let GAME_OVER_CONTENT = {
    win: {
      src: "./assets/img/You won, you lost/You Won B.png",
      alt: "You Win",
      text: "Pepe defeated the endboss. The fiesta can begin!",
    },
    loss: {
      src: "./assets/img/You won, you lost/Game Over.png",
      alt: "Game Over",
      text: "Pepe was defeated. Give it another try!",
    },
  };

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
   * Shows the start screen again.
   * @param {HTMLElement|null} startScreen - Screen to show.
   * @returns {void}
   */
  function showStartScreen(startScreen) {
    startScreen?.classList.remove("is-hidden");
    startScreen?.removeAttribute("inert");
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
   * Hides the game container so gameplay stops being visible.
   * @param {HTMLElement|null} gameContainer - Container to hide.
   * @returns {void}
   */
  function hideGameContainer(gameContainer) {
    gameContainer?.classList.add("is-hidden");
    gameContainer?.setAttribute("inert", "");
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
    if (reason === "win") return GAME_OVER_CONTENT.win;
    return GAME_OVER_CONTENT.loss;
  }

  /**
   * Reveals the game over screen and moves focus to the restart button.
   * @param {Object} elements - Game over element references.
   * @returns {void}
   */
  function revealGameOverScreen(elements) {
    elements.screen?.classList.remove("is-hidden");
    elements.screen?.removeAttribute("inert");
    elements.restartButton?.focus();
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

  global.Screens = {
    hideStartScreen,
    showStartScreen,
    showGameContainer,
    hideGameContainer,
    updateGameOverContent,
    getGameOverContent,
    revealGameOverScreen,
    hideGameOverScreen,
    resetUiState,
  };
})(window);
