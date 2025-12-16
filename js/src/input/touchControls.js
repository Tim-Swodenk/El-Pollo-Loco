(function (global) {
  "use strict";

  /**
   * Binds touch control buttons to keyboard state updates.
   * @param {Object} options - Configuration for binding touch controls.
   * @param {Object|Function} options.keyboard - Keyboard state or getter returning it.
   * @param {string} options.containerSelector - CSS selector for the touch controls container.
   * @returns {{reset: function(): void, unbind: function(): void}}
   */
  function bindTouchControls({ keyboard, containerSelector }) {
    let getKeyboard =
      typeof keyboard === "function" ? keyboard : () => keyboard;
    let container = document.querySelector(containerSelector);
    if (!container) {
      return { reset: () => {}, unbind: () => {} };
    }

    let touchButtons = Array.from(container.querySelectorAll("[data-key]"));
    let handlers = new Map();

    touchButtons.forEach((button) => {
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

      handlers.set(button, { handlePress, handleRelease });
      button.addEventListener("pointerdown", handlePress);
      button.addEventListener("pointerup", handleRelease);
      button.addEventListener("pointercancel", handleRelease);
      button.addEventListener("pointerleave", handleRelease);
      button.addEventListener("pointerout", handleRelease);
    });

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
      getKeyboard()[key] = isActive;
    }

    /**
     * Safely toggles pointer capture to stabilize drag interactions.
     * @param {HTMLElement} button - Target button.
     * @param {PointerEvent} event - Pointer event used for capture.
     * @param {boolean} shouldCapture - True to capture, false to release.
     * @returns {void}
     */
    function togglePointerCapture(button, event, shouldCapture) {
      let method = shouldCapture
        ? "setPointerCapture"
        : "releasePointerCapture";
      if (typeof button[method] !== "function") return;
      try {
        button[method](event.pointerId);
      } catch (err) {
        /* Capture might fail on unsupported browsers */
      }
    }

    /**
     * Resets all touch controls to an inactive state.
     * @returns {void}
     */
    function reset() {
      touchButtons.forEach((button) => {
        let key = button.dataset.key;
        setTouchButtonState(button, key, false);
      });
    }

    /**
     * Removes all listeners from touch controls.
     * @returns {void}
     */
    function unbind() {
      touchButtons.forEach((button) => {
        let mapping = handlers.get(button);
        if (!mapping) return;
        button.removeEventListener("pointerdown", mapping.handlePress);
        button.removeEventListener("pointerup", mapping.handleRelease);
        button.removeEventListener("pointercancel", mapping.handleRelease);
        button.removeEventListener("pointerleave", mapping.handleRelease);
        button.removeEventListener("pointerout", mapping.handleRelease);
      });
      handlers.clear();
    }

    return { reset, unbind };
  }

  global.TouchControls = {
    bindTouchControls,
  };
})(window);
