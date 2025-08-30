/**
 * Final boss character encountered at the end of the level.
 * @extends MovableObject
 */
class Endboss extends MovableObject {
  height = 400;
  width = 250;
  y = 60;
  energy = 100;
  animationInterval;

  IMAGES_WALKING = [
    "assets/img/4_enemie_boss_chicken/2_alert/G5.png",
    "assets/img/4_enemie_boss_chicken/2_alert/G6.png",
    "assets/img/4_enemie_boss_chicken/2_alert/G7.png",
    "assets/img/4_enemie_boss_chicken/2_alert/G8.png",
    "assets/img/4_enemie_boss_chicken/2_alert/G9.png",
    "assets/img/4_enemie_boss_chicken/2_alert/G10.png",
    "assets/img/4_enemie_boss_chicken/2_alert/G11.png",
    "assets/img/4_enemie_boss_chicken/2_alert/G12.png",
  ];

  /**
   * Initializes the end boss and starts its animation.
   */
  constructor() {
    super().loadImage(this.IMAGES_WALKING[0]);
    this.loadImages(this.IMAGES_WALKING);
    this.x = 2550;
    this.offset = { top: 80, right: 5, bottom: 5, left: 25 };
    this.animate();
  }

  /**
   * Plays the alert animation.
   * @returns {void}
   */
  animate() {
    this.animationInterval = setInterval(() => {
      this.playAnimation(this.IMAGES_WALKING);
    }, 200);
  }

  /**
   * Reduces energy by the given damage and checks for death.
   * @param {number} [damage=20] - Amount of energy to subtract.
   * @returns {void}
   */
  hit(damage = 20) {
    super.hit(damage);
    if (this.energy === 0) {
      this.die();
    }
  }

  /**
   * Handles the death of the endboss and removes it from the world.
   * @returns {void}
   */
  die() {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
    }
    this.dead = true;
    if (this.world && this.world.level && this.world.level.enemies) {
      let index = this.world.level.enemies.indexOf(this);
      if (index > -1) {
        this.world.level.enemies.splice(index, 1);
      }
    }
  }
}
