/**
 * Controls animation timing and sprite selection for the endboss.
 */
class EndbossAnimations {
  /**
   * @param {Endboss} boss
   */
  constructor(boss) {
    this.boss = boss;
    this.animationIntervalId = null;
  }

  /**
   * Starts animation loop based on the current speed.
   * @returns {void}
   */
  animate() {
    this.startAnimationTimer();
  }

  /**
   * Starts or restarts the animation timer based on the boss' speed.
   * @returns {void}
   */
  startAnimationTimer() {
    if (this.animationIntervalId) clearInterval(this.animationIntervalId);
    this.animationIntervalId = setInterval(
      () => this.performAnimationStep(),
      this.boss.animationMs
    );
  }

  /**
   * Plays the appropriate animation frame for the current state.
   * @returns {void}
   */
  performAnimationStep() {
    if (performance.now() < this.boss.hurtOverlayUntil) {
      this.boss.playAnimation(this.boss.IMAGES_HURT);
      return;
    }
    this.boss.playAnimation(this.getImagesForState(this.boss.currentState));
  }

  /**
   * Resolves the correct sprite list for a given state.
   * @param {string} state - Current action state.
   * @returns {string[]}
   */
  getImagesForState(state) {
    const map = {
      walkForward: this.boss.IMAGES_WALK,
      walkBackward: this.boss.IMAGES_WALK,
      return: this.boss.IMAGES_WALK,
      wait: this.boss.IMAGES_WAIT,
      alert: this.boss.IMAGES_ALERT,
      attack: this.boss.IMAGES_ATTACK,
      jumpAttack: this.boss.IMAGES_JUMPATTACK,
      dead: this.boss.IMAGES_DEAD,
    };
    return map[state] || this.boss.IMAGES_WAIT;
  }

  /**
   * Stops the animation loop.
   * @returns {void}
   */
  stop() {
    if (this.animationIntervalId) clearInterval(this.animationIntervalId);
  }
}
