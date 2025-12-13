(function (global) {
  "use strict";

  /**
   * Creates an audio manager responsible for music and sound effects.
   * @param {Object} options - Configuration for audio handling.
   * @param {string} options.musicSrc - Path to the background music source.
   * @param {Object.<string, string>} options.sfxSources - Mapping of sound effect names to file paths.
   * @param {string} options.storageKey - Local storage key for persisting mute state.
   * @returns {{init: function(HTMLElement[]): void, toggleMute: function(): void, applyMuteState: function(boolean=): void, startMusic: function(): void, stopMusic: function(): void, playSfx: function(string): void, getMuted: function(): boolean}}
   */
  function createAudioManager({ musicSrc, sfxSources, storageKey }) {
    let backgroundMusic;
    let soundEffects = {};
    let muteButtons = [];
    let isMuted = false;

    loadMutePreference();

    /**
     * Initializes audio elements and attaches mute buttons.
     * @param {HTMLElement[]} buttons - Buttons to reflect mute state.
     * @returns {void}
     */
    function init(buttons = []) {
      muteButtons = buttons.filter(Boolean);
      backgroundMusic = new Audio(musicSrc);
      backgroundMusic.loop = true;
      backgroundMusic.volume = 0.35;
      backgroundMusic.muted = isMuted;
      soundEffects = createSoundEffects();
      applyMuteState(isMuted);
    }

    /**
     * Builds audio elements for registered sound effects.
     * @returns {Object.<string, HTMLAudioElement>}
     */
    function createSoundEffects() {
      const effects = {};
      Object.entries(sfxSources).forEach(([name, src]) => {
        const audio = new Audio(src);
        audio.volume = 0.6;
        audio.muted = isMuted;
        effects[name] = audio;
      });
      return effects;
    }

    /**
     * Loads persisted mute preference.
     * @returns {void}
     */
    function loadMutePreference() {
      try {
        const storedValue = localStorage.getItem(storageKey);
        if (storedValue === null) return;
        isMuted = storedValue === "true";
      } catch (error) {
        /* Access to storage might be blocked */
      }
    }

    /**
     * Persists current mute preference.
     * @returns {void}
     */
    function persistMutePreference() {
      try {
        localStorage.setItem(storageKey, String(isMuted));
      } catch (error) {
        /* Ignore storage failures */
      }
    }

    /**
     * Applies provided mute state to all audio elements.
     * @param {boolean} [forceState] - Optional mute state to enforce.
     * @returns {void}
     */
    function applyMuteState(forceState) {
      if (typeof forceState === "boolean") {
        isMuted = forceState;
      }
      if (backgroundMusic) {
        backgroundMusic.muted = isMuted;
      }
      Object.values(soundEffects).forEach((audio) => {
        audio.muted = isMuted;
      });
      updateMuteButtonState();
      persistMutePreference();
    }

    /**
     * Starts background music playback if not muted.
     * @returns {void}
     */
    function startMusic() {
      if (!backgroundMusic) return;
      backgroundMusic.muted = isMuted;
      if (!backgroundMusic.paused) return;
      backgroundMusic.currentTime = 0;
      backgroundMusic.play().catch(() => {});
    }

    /**
     * Stops background music playback.
     * @returns {void}
     */
    function stopMusic() {
      if (!backgroundMusic) return;
      backgroundMusic.pause();
      backgroundMusic.currentTime = 0;
    }

    /**
     * Toggles the global mute state.
     * @returns {void}
     */
    function toggleMute() {
      isMuted = !isMuted;
      applyMuteState(isMuted);
    }

    /**
     * Plays a named sound effect if available.
     * @param {string} name - Sound effect key.
     * @returns {void}
     */
    function playSfx(name) {
      const effect = soundEffects[name];
      if (!effect || isMuted) return;
      effect.currentTime = 0;
      effect.play().catch(() => {});
    }

    /**
     * Updates mute button visuals and accessibility state.
     * @returns {void}
     */
    function updateMuteButtonState() {
      if (!muteButtons.length) return;
      muteButtons.forEach((button) => {
        button.classList.toggle("is-muted", isMuted);
        button.setAttribute("aria-pressed", isMuted ? "true" : "false");
        button.setAttribute("aria-label", isMuted ? "Sound off" : "Sound on");
      });
    }

    /**
     * Returns current mute state.
     * @returns {boolean}
     */
    function getMuted() {
      return isMuted;
    }

    return {
      init,
      toggleMute,
      applyMuteState,
      startMusic,
      stopMusic,
      playSfx,
      getMuted,
    };
  }

  global.AudioManager = {
    createAudioManager,
  };
})(window);
