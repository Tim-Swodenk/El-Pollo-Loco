/**
 * Handles visibility, AI sequencing and behavior scheduling for the endboss.
 */
class EndbossBehavior {
  /**
   * @param {Endboss} boss
   */
  constructor(boss) {
    this.boss = boss;
    this.behaviorInterval = null;
    this.visibilityCheckId = null;
    this.isPlayingSequence = false;
  }

  /**
   * Activate once the boss is visible in the viewport.
   * @param {number} [buffer=0] - Extra pixels around the viewport.
   * @returns {void}
   */
  activateWhenVisible(buffer = 0) {
    if (this.boss.isOnScreen(this.boss.world, buffer)) {
      this.activate();
      return;
    }
    this.visibilityCheckId = setInterval(() => {
      if (this.boss.world && this.boss.isOnScreen(this.boss.world, buffer)) {
        clearInterval(this.visibilityCheckId);
        this.visibilityCheckId = null;
        this.activate();
      }
    }, 120);
  }

  /**
   * Starts animation and AI once activated.
   * @returns {void}
   */
  activate() {
    if (this.boss.activated) return;
    this.boss.activated = true;
    this.boss.animations.animate();
    this.startRandomBehavior();
  }

  /**
   * Plays the appropriate animation frame for the current state.
   * @param {string[]} sequence - Action names.
   * @returns {Promise<void>}
   */
  async playSequence(sequence) {
    for (const name of sequence) {
      if (this.shouldStopSequence()) break;
      await this.runSequenceAction(name);
    }
    this.finishSequenceIfAlive();
  }

  /**
   * Periodically picks and plays a random behavior sequence.
   * @returns {void}
   */
  startRandomBehavior() {
    this.behaviorInterval = setInterval(async () => {
      if (this.isPlayingSequence || this.boss.dead) return;

      const seq =
        this.boss.SEQUENCES[(Math.random() * this.boss.SEQUENCES.length) | 0];

      this.isPlayingSequence = true;
      await this.playSequence(seq);
      this.isPlayingSequence = false;
    }, 1000);
  }

  /**
   * Checks if the sequence should stop due to death.
   * @returns {boolean}
   */
  shouldStopSequence() {
    return this.boss.currentState === "dead" || this.boss.dead;
  }

  /**
   * Runs a single sequence action by name and handles delays.
   * @param {string} name - Action method name.
   * @returns {Promise<void>}
   */
  async runSequenceAction(name) {
    const action = this.boss[name];
    if (typeof action !== "function") return;
    const result = action.call(this.boss);
    if (result instanceof Promise) {
      await result;
      return;
    }
    await this.boss.sleep(this.boss.ACTION_DELAYS[name] ?? 1000);
  }

  /**
   * Resets state after completing a sequence if still alive.
   * @returns {void}
   */
  finishSequenceIfAlive() {
    if (this.boss.dead || this.boss.currentState === "dead") return;
    this.boss.currentState = "wait";
    this.boss.playAnimation(this.boss.IMAGES_WAIT);
  }

  /**
   * Clears timers associated with behavior and visibility checks.
   * @returns {void}
   */
  stopAll() {
    if (this.behaviorInterval) clearInterval(this.behaviorInterval);
    if (this.visibilityCheckId) {
      clearInterval(this.visibilityCheckId);
      this.visibilityCheckId = null;
    }
  }
}
