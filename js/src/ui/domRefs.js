(function (global) {
  "use strict";

  /**
   * Collects primary control buttons from the DOM.
   * @returns {{start: HTMLElement|null, restart: HTMLElement|null, fullscreen: HTMLElement|null, exit: HTMLElement|null, mute: HTMLElement|null, touchMute: HTMLElement|null}}
   */
  function getButtons() {
    return {
      start: document.getElementById("start-button"),
      restart: document.getElementById("restart-button"),
      fullscreen: document.getElementById("fullscreen-button"),
      exit: document.getElementById("exit-button"),
      mute: document.getElementById("mute-button"),
      touchMute: document.getElementById("touch-mute-button"),
    };
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

  global.DomRefs = {
    getButtons,
    getGameScreens,
    getGameOverElements,
    getExitElements,
  };
})(window);
