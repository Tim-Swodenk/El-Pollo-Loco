/**
 * Throwable salsa bottle that can splash upon impact.
 * @extends MovableObject
 */
class ThrowableObject extends MovableObject {
  /**
   * Y-coordinate representing the ground level for throwable objects.
   * @type {number}
   */
  static GROUND_LEVEL = 370;

  IMAGES_ROTATION = [
    "assets/img/6_salsa_bottle/bottle_rotation/1_bottle_rotation.png",
    "assets/img/6_salsa_bottle/bottle_rotation/2_bottle_rotation.png",
    "assets/img/6_salsa_bottle/bottle_rotation/3_bottle_rotation.png",
    "assets/img/6_salsa_bottle/bottle_rotation/4_bottle_rotation.png",
  ];

  IMAGES_SPLASH = [
    "assets/img/6_salsa_bottle/bottle_rotation/bottle_splash/1_bottle_splash.png",
    "assets/img/6_salsa_bottle/bottle_rotation/bottle_splash/2_bottle_splash.png",
    "assets/img/6_salsa_bottle/bottle_rotation/bottle_splash/3_bottle_splash.png",
    "assets/img/6_salsa_bottle/bottle_rotation/bottle_splash/4_bottle_splash.png",
    "assets/img/6_salsa_bottle/bottle_rotation/bottle_splash/5_bottle_splash.png",
    "assets/img/6_salsa_bottle/bottle_rotation/bottle_splash/6_bottle_splash.png",
  ];

  hasSplashed = false;

  /**
   * Creates a throwable bottle at the given position.
   * @param {number} x - Horizontal position.
   * @param {number} y - Vertical position.
   */
  constructor(x, y) {
    super().loadImage(
      "assets/img/6_salsa_bottle/bottle_rotation/1_bottle_rotation.png"
    );
    this.loadImages(this.IMAGES_ROTATION);
    this.loadImages(this.IMAGES_SPLASH);
    this.x = x;
    this.y = y;
    this.height = 100;
    this.throw();
    this.animate();
  }

  /**
   * Checks if the bottle is still above the ground level.
   * @returns {boolean} True if y-position is smaller than ground height.
   */
  isAboveGround() {
    return this.y < ThrowableObject.GROUND_LEVEL;
  }

  /**
   * Applies gravity and stops once the bottle hits the ground.
   * @returns {void}
   */
  applyGravity() {
    this.gravityInterval = setInterval(() => {
      if (this.isAboveGround() || this.speedY > 0) {
        this.y -= this.speedY;
        this.speedY -= this.acceleration;
      } else {
        this.y = ThrowableObject.GROUND_LEVEL;
        this.speedY = 0;
        clearInterval(this.gravityInterval);
      }
    }, 1000 / 30);
  }

  /**
   * Starts the throw and applies horizontal movement.
   * @returns {void}
   */
  throw() {
    this.speedY = 30;
    this.applyGravity();
    this.throwInterval = setInterval(() => {
      if (this.isAboveGround()) {
        this.x += 10;
      } else {
        clearInterval(this.throwInterval);
      }
    }, 25);
  }

  /**
   * Animates the bottle rotation and splash sequence.
   * @returns {void}
   */
  animate() {
    this.animationInterval = setInterval(() => {
      if (this.isAboveGround() && !this.hasSplashed) {
        this.playAnimation(this.IMAGES_ROTATION);
      } else if (!this.hasSplashed) {
        this.hasSplashed = true;
        clearInterval(this.animationInterval);
        this.playSplashAnimationOnce();
      }
    }, 80);
  }

  /**
   * Plays the splash animation once after impact.
   * @returns {void}
   */
  playSplashAnimationOnce() {
    let i = 0;
    this.splashInterval = setInterval(() => {
      this.img = this.imageCache[this.IMAGES_SPLASH[i]];
      i++;
      if (i >= this.IMAGES_SPLASH.length) {
        clearInterval(this.splashInterval);
        this.removeFromWorld();
      }
    }, 80);
  }

  /**
   * Removes the bottle from the world after the splash animation.
   * @returns {void}
   */
  removeFromWorld() {
    setTimeout(() => {
      if (this.world && this.world.throwableObjects) {
        const index = this.world.throwableObjects.indexOf(this);
        if (index > -1) {
          this.world.throwableObjects.splice(index, 1);
        }
      }
      clearInterval(this.animationInterval);
      clearInterval(this.throwInterval);
      clearInterval(this.gravityInterval);
    }, 500);
  }
}
