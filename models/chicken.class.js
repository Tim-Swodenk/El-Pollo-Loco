/**
 * Small enemy chicken moving left across the level.
 * @extends MovableObject
 */
class Chicken extends MovableObject {
  y = 350;
  height = 80;
  width = 80;
  IMAGES_WALKING = [
    "assets/img/3_enemies_chicken/chicken_normal/1_walk/1_w.png",
    "assets/img/3_enemies_chicken/chicken_normal/1_walk/2_w.png",
    "assets/img/3_enemies_chicken/chicken_normal/1_walk/3_w.png",
  ];

  /**
   * Creates an enemy chicken with random position and speed.
   */
  constructor() {
    super().loadImage(
      "assets/img/3_enemies_chicken/chicken_normal/1_walk/1_w.png"
    );
    this.loadImages(this.IMAGES_WALKING);

    this.x = 300 + Math.random() * (2000 - this.width);
    this.speed = 0.15 + Math.random() * 0.5;
    this.offset = { top: 5, right: 5, bottom: 5, left: 5 };

    this.animate();
  }

  /**
   * Moves the chicken and plays walking animation.
   * @returns {void}
   */
  animate() {
    setInterval(() => {
      this.moveLeft();
    }, 1000 / 60);

    setInterval(() => {
      //Walk animation
      this.playAnimation(this.IMAGES_WALKING);
    }, 150);
  }
}
