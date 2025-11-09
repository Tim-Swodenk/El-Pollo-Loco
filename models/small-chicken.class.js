/**
 * Small chicken enemy moving quickly across the level.
 * @extends MovableObject
 */
class SmallChicken extends MovableObject {
  y = 360;
  height = 60;
  width = 60;

  IMAGES_WALKING = [
    "assets/img/3_enemies_chicken/chicken_small/1_walk/1_w.png",
    "assets/img/3_enemies_chicken/chicken_small/1_walk/2_w.png",
    "assets/img/3_enemies_chicken/chicken_small/1_walk/3_w.png",
  ];

  IMAGES_DEAD = ["assets/img/3_enemies_chicken/chicken_small/2_dead/dead.png"];

  moveInterval = null;
  walkInterval = null;
  isActive = false;

  /**
   * Creates a small chicken with randomized position and speed.
   */
  constructor() {
    super().loadImage(
      "assets/img/3_enemies_chicken/chicken_small/1_walk/1_w.png"
    );
    this.loadImages(this.IMAGES_WALKING);
    this.loadImages(this.IMAGES_DEAD);

    this.x = 300 + Math.random() * (2000 - this.width);
    this.speed = 0.3 + Math.random() * 0.6;
    this.offset = { top: 5, right: 5, bottom: 5, left: 5 };
  }

  /**
   * Starts movement and animation once the game begins.
   * @returns {void}
   */
  startBehavior() {
    if (this.isActive) return;

    this.isActive = true;

    this.moveInterval = setInterval(() => {
      this.moveLeft();
    }, 1000 / 60);

    this.walkInterval = setInterval(() => {
      this.playAnimation(this.IMAGES_WALKING);
    }, 150);
  }

  /**
   * Stops movement and animation intervals.
   * @returns {void}
   */
  stopBehavior() {
    if (this.moveInterval) {
      clearInterval(this.moveInterval);
      this.moveInterval = null;
    }
    if (this.walkInterval) {
      clearInterval(this.walkInterval);
      this.walkInterval = null;
    }
    this.isActive = false;
  }

  /**
   * Handles the death of the small chicken and removes it from the level.
   * @returns {void}
   */
  die() {
    this.stopBehavior();
    this.speed = 0;
    this.loadImage(this.IMAGES_DEAD[0]);
    this.dead = true;
    setTimeout(() => {
      if (this.world && this.world.level && this.world.level.enemies) {
        const index = this.world.level.enemies.indexOf(this);
        if (index > -1) {
          this.world.level.enemies.splice(index, 1);
        }
      }
    }, 500);
  }
}
