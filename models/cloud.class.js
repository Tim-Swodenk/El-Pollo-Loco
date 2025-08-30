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

  nextImageIndex = 0;

  /**
   * Creates a cloud at a random horizontal position.
   */
  constructor() {
    super().loadImage(this.IMAGES_CLOUDS[this.nextImageIndex]);
    this.nextImageIndex = (this.nextImageIndex + 1) % this.IMAGES_CLOUDS.length;
    this.x = Math.random() * 500; //zahl zwischen 200 und 700
    this.animate();
  }

  /**
   * Moves the cloud to the left continuously.
   * @returns {void}
   */
  animate() {
    setInterval(() => {
      this.moveLeft();
    }, 1000 / 25);
  }
}
