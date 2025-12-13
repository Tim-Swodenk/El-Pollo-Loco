(function (global) {
  "use strict";

  const DEFAULT_KEYBOARD_MAPPING = {
    ArrowRight: "RIGHT",
    ArrowLeft: "LEFT",
    ArrowUp: "UP",
    ArrowDown: "DOWN",
    Space: "SPACE",
    KeyD: "D",
  };

  /**
   * Binds keyboard listeners for gameplay and lifecycle actions.
   * @param {Object} options - Configuration for keyboard handling.
   * @param {Object|Function} options.keyboard - Keyboard state or getter returning it.
   * @param {Function} options.getState - Returns { hasGameStarted, isGameOver }.
   * @param {Object} options.actions - Action callbacks.
   * @param {Function} options.actions.startGame - Triggered to start the game.
   * @param {Function} options.actions.restartGame - Triggered to restart after game over.
   * @param {Function} options.actions.exitToHome - Triggered to exit to home.
   * @returns {{unbind: function(): void}}
   */
  function bindKeyboardControls({ keyboard, getState, actions }) {
    const getKeyboard = typeof keyboard === "function" ? keyboard : () => keyboard;

    const onKeyDown = (e) => {
      if (handleGameOverKeys(e)) return;
      if (handleStartStopKeys(e)) return;
      updateMovementState(e, true);
    };

    const onKeyUp = (e) => {
      updateMovementState(e, false);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    /**
     * Handles keyboard interactions when the game is over.
     * @param {KeyboardEvent} e - The keyboard event.
     * @returns {boolean} True if the event was consumed.
     */
    function handleGameOverKeys(e) {
      const state = getState();
      if (!state.isGameOver) return false;
      if (["Space", "Enter"].includes(e.code)) {
        e.preventDefault();
        actions.restartGame();
        return true;
      }
      if (e.code === "Escape") {
        e.preventDefault();
        actions.exitToHome();
      }
      return true;
    }

    /**
     * Handles start and escape keys during normal play.
     * @param {KeyboardEvent} e - The keyboard event.
     * @returns {boolean} True if the event was consumed.
     */
    function handleStartStopKeys(e) {
      const state = getState();
      if (!state.hasGameStarted && ["Space", "Enter"].includes(e.code)) {
        e.preventDefault();
        actions.startGame();
        return true;
      }
      if (state.hasGameStarted && e.code === "Escape") {
        e.preventDefault();
        actions.exitToHome();
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
      const key = DEFAULT_KEYBOARD_MAPPING[e.code];
      if (key) getKeyboard()[key] = isPressed;
    }

    /**
     * Removes keyboard listeners.
     * @returns {void}
     */
    function unbind() {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    }

    return { unbind };
  }

  global.KeyboardControls = {
    bindKeyboardControls,
  };
})(window);
