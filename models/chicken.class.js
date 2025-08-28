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

  IMAGES_DEAD = ["assets/img/3_enemies_chicken/chicken_normal/2_dead/dead.png"];

  /**
   * Creates an enemy chicken with random position and speed.
   */
  constructor() {
    super().loadImage(
      "assets/img/3_enemies_chicken/chicken_normal/1_walk/1_w.png"
    );
    this.loadImages(this.IMAGES_WALKING);
    this.loadImages(this.IMAGES_DEAD);

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
    this.moveInterval = setInterval(() => {
      this.moveLeft();
    }, 1000 / 60);

    this.walkInterval = setInterval(() => {
      //Walk animation
      this.playAnimation(this.IMAGES_WALKING);
    }, 150);
  }

  /**
   * Handles the death of the chicken.
   * Stops all animations, shows the dead sprite and removes the chicken.
   * @returns {void}
   */
  die() {
    if (this.moveInterval) {
      clearInterval(this.moveInterval);
    }
    if (this.walkInterval) {
      clearInterval(this.walkInterval);
    }
    this.speed = 0;
    this.loadImage(this.IMAGES_DEAD[0]);
    this.dead = true;
    setTimeout(() => {
      if (this.world && this.world.level && this.world.level.enemies) {
        let index = this.world.level.enemies.indexOf(this);
        if (index > -1) {
          this.world.level.enemies.splice(index, 1);
        }
      }
    }, 500);
  }
}
