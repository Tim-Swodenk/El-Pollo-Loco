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
  function createWorld({ canvas, keyboard, level, onGameOver }) {
    if (!canvas) return null;
    const world = new World(canvas, keyboard, level ?? global.level1);
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
    const level = recreateLevel();
    onTouchReset?.();
    return { keyboard: keyboardFactory(), level };
  }

  /**
   * Recreates the default level when the factory is available.
   * @returns {void}
   */
  function recreateLevelIfPossible() {
    if (typeof global.createLevel1 !== "function") return null;
    const level = global.createLevel1();
    global.level1 = level;
    if (typeof level1 !== "undefined") {
      level1 = level;
    }
    return level;
  }

  global.WorldLifecycle = {
    createWorld,
    destroyWorld,
    resetWorldForRestart,
    recreateLevelIfPossible,
  };
})(window);
