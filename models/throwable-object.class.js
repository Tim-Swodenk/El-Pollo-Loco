class ThrowableObject extends MovableObject {
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
    return this.y < 380;
  }

  /**
   * Applies gravity and stops once the bottle hits the ground.
   */
  applyGravity() {
    this.gravityInterval = setInterval(() => {
      if (this.isAboveGround() || this.speedY > 0) {
        this.y -= this.speedY;
        this.speedY -= this.acceleration;
      } else {
        this.y = 380;
        this.speedY = 0;
        clearInterval(this.gravityInterval);
      }
    }, 1000 / 30);
  }

  throw(x, y) {
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

  animate() {
    this.animationInterval = setInterval(() => {
      if (this.isAboveGround() && !this.hasSplashed) {
        this.playAnimation(this.IMAGES_ROTATION);
      } else if (!this.hasSplashed) {
        this.hasSplashed = true;
        this.playAnimation(this.IMAGES_SPLASH);
        this.removeFromWorld();
      }
    }, 80);
  }

  removeFromWorld() {}
}
