(function (global) {
  "use strict";

  /**
   * Creates a world instance wired with game over handling.
   * @param {Object} options - World creation options.
   * @param {HTMLCanvasElement} options.canvas - Target canvas element.
   * @param {Keyboard} options.keyboard - Keyboard instance.
   * @param {Function} options.onGameOver - Callback for game over events.
   * @returns {World|null}
   */
  function createWorld({ canvas, keyboard, onGameOver }) {
    if (!canvas) return null;
    const world = new World(canvas, keyboard);
    if (typeof world.setOnGameOver === "function") {
      world.setOnGameOver(onGameOver);
    }
    return world;
  }

  /**
   * Destroys the provided world instance safely.
   * @param {World|null} world - World instance to destroy.
   * @returns {void}
   */
  function destroyWorld(world) {
    if (!world) return;
    if (typeof world.destroy === "function") {
      world.destroy();
    }
  }

  /**
   * Resets world objects and inputs to their default state before a restart.
   * @param {Object} options - Reset configuration.
   * @param {Function} options.destroyWorld - Function to destroy the current world.
   * @param {Function} options.recreateLevel - Function to recreate the level if available.
   * @param {Function} options.keyboardFactory - Factory that returns a new Keyboard instance.
   * @param {Function} [options.onTouchReset] - Callback to reset touch controls.
   * @returns {Keyboard}
   */
  function resetWorldForRestart({
    destroyWorld,
    recreateLevel,
    keyboardFactory,
    onTouchReset,
  }) {
    destroyWorld();
    recreateLevel();
    onTouchReset?.();
    return keyboardFactory();
  }

  /**
   * Recreates the default level when the factory is available.
   * @returns {void}
   */
  function recreateLevelIfPossible() {
    if (typeof global.createLevel1 !== "function") return;
    global.level1 = global.createLevel1();
  }

  global.WorldLifecycle = {
    createWorld,
    destroyWorld,
    resetWorldForRestart,
    recreateLevelIfPossible,
  };
})(window);
