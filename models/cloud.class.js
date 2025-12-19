/**
 * Cloud background object that scrolls across the sky.
 * @extends MovableObject
 */
class Cloud extends MovableObject {
  y = 10;
  width = 600;
  height = 300;

  /**
   * File paths for cloud images used in sequence.
   * @type {string[]}
   */
  IMAGES_CLOUDS = [
    "assets/img/5_background/layers/4_clouds/1.png",
    "assets/img/5_background/layers/4_clouds/2.png",
  ];

  static nextImageIndex = 0;

  /**
   *Creates a cloud at a fixed horizontal position.
   * @param {number} x - Horizontal position for the cloud.
   */
  constructor(x = 0) {
    super().loadImage(this.IMAGES_CLOUDS[Cloud.nextImageIndex]);
    Cloud.nextImageIndex =
      (Cloud.nextImageIndex + 1) % this.IMAGES_CLOUDS.length;
    this.x = x;
    this.animate();
  }

  /**
   * Moves the cloud to the left continuously.
   * @returns {void}
   */
  animate() {
    this.stopAnimation();
    this.moveInterval = setInterval(() => {
      this.moveLeft();
    }, 1000 / 25);
  }

  /**
   * Stops the cloud animation interval.
   * @returns {void}
   */
  stopAnimation() {
    if (!this.moveInterval) return;
    clearInterval(this.moveInterval);
    this.moveInterval = null;
  }

  /**
   * Stops all timers for the cloud.
   * @returns {void}
   */
  stopAllTimers() {
    this.stopAnimation();
    this.stopGravity();
  }
}
