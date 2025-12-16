(function (global) {
  "use strict";

  /**
   * Prevents the context menu on provided elements and triggers a callback.
   * @param {Object} options - Configuration for context menu blocking.
   * @param {HTMLElement[]} options.elements - Elements to guard against context menu.
   * @param {Function} [options.onBlocked] - Callback executed when context is blocked.
   * @returns {void}
   */
  function blockContextMenu({ elements, onBlocked }) {
    let targets = (elements || []).filter(Boolean);
    targets.forEach((element) => {
      element.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        if (typeof onBlocked === "function") {
          onBlocked();
        }
      });
    });
  }

  global.ContextMenuGuards = {
    blockContextMenu,
  };
})(window);
