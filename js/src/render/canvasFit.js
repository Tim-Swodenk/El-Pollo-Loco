(function (global) {
  "use strict";

  /**
   * Fits the canvas to the available viewport while keeping aspect ratio and HiDPI scaling.
   * @param {Object} options - Canvas fit configuration.
   * @param {HTMLCanvasElement} options.canvas - Target canvas element.
   * @param {number} options.baseW - Base logical width.
   * @param {number} options.baseH - Base logical height.
   * @param {Function} options.isFullscreenActive - Callback to determine fullscreen state.
   * @returns {void}
   */
  function fitCanvasToScreen({ canvas, baseW, baseH, isFullscreenActive }) {
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    if (isFullscreenActive()) {
      fitCanvasFullscreen(canvas, baseW, baseH, dpr);
    } else {
      fitCanvasWindowed(canvas, baseW, baseH, dpr);
    }
  }

  /**
   * Updates fullscreen button state and body class.
   * @param {Object} options - Options for fullscreen button update.
   * @param {HTMLElement|null} options.button - Fullscreen toggle button.
   * @param {Function} options.isFullscreenActive - Callback to determine fullscreen state.
   * @returns {void}
   */
  function updateFullscreenButtonState({ button, isFullscreenActive }) {
    if (!button) return;
    const active = isFullscreenActive();
    button.textContent = active ? "Exit fullscreen" : "Fullscreen";
    button.setAttribute("aria-pressed", active ? "true" : "false");
    document.body.classList.toggle("is-fullscreen", active);
  }

  /**
   * Toggles fullscreen mode for a given element.
   * @param {HTMLElement} element - Element to request fullscreen on.
   * @param {Function} isFullscreenActive - Callback to determine fullscreen state.
   * @returns {void}
   */
  function toggleFullscreen(element, isFullscreenActive) {
    if (!element) return;
    if (isFullscreenActive()) {
      exitFullscreen();
    } else {
      requestFullscreen(element);
    }
  }

  /**
   * Determines whether any element is currently in fullscreen.
   * @returns {boolean}
   */
  function isFullscreenActive() {
    return Boolean(
      document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
    );
  }

  /**
   * Requests fullscreen mode for the provided element.
   * @param {HTMLElement} element - Element to display in fullscreen.
   * @returns {void}
   */
  function requestFullscreen(element) {
    if (element.requestFullscreen) element.requestFullscreen();
    else if (element.webkitRequestFullscreen) element.webkitRequestFullscreen();
    else if (element.mozRequestFullScreen) element.mozRequestFullScreen();
    else if (element.msRequestFullscreen) element.msRequestFullscreen();
  }

  /**
   * Exits fullscreen mode on the document.
   * @returns {void}
   */
  function exitFullscreen() {
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
    else if (document.msExitFullscreen) document.msExitFullscreen();
  }

  function fitCanvasFullscreen(el, baseW, baseH, dpr) {
    const size = getFullscreenCanvasSize(baseW, baseH);
    setCanvasStyle(el, size.targetW, size.targetH);
    const render = getRenderSize(size, dpr);
    updateCanvasResolution(el, render.width, render.height);
    applyCanvasScale(el, size.targetW / baseW, dpr);
  }

  function fitCanvasWindowed(el, baseW, baseH, dpr) {
    clearCanvasStyle(el);
    const render = getRenderSize({ targetW: baseW, targetH: baseH }, dpr);
    updateCanvasResolution(el, render.width, render.height);
    applyCanvasScale(el, 1, dpr);
  }

  function getFullscreenCanvasSize(baseW, baseH) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const ratio = baseW / baseH;
    return {
      targetW: Math.min(w, h * ratio),
      targetH: Math.min(h, w / ratio),
    };
  }

  function setCanvasStyle(el, width, height) {
    el.style.width = `${width}px`;
    el.style.height = `${height}px`;
  }

  function getRenderSize(size, dpr) {
    return {
      width: Math.round(size.targetW * dpr),
      height: Math.round(size.targetH * dpr),
    };
  }

  function updateCanvasResolution(el, width, height) {
    if (el.width === width && el.height === height) return;
    el.width = width;
    el.height = height;
  }

  function applyCanvasScale(el, scale, dpr) {
    const ctx = el.getContext("2d");
    ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
  }

  function clearCanvasStyle(el) {
    el.style.width = "";
    el.style.height = "";
  }

  global.CanvasFit = {
    fitCanvasToScreen,
    updateFullscreenButtonState,
    toggleFullscreen,
    isFullscreenActive,
    requestFullscreen,
    exitFullscreen,
  };
})(window);
