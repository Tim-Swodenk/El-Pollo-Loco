/**
 * Extension of {@link DrawableObject} that adds movement and physics.
 */
class MovableObject extends DrawableObject {
  speed = 0.15;
  otherDirection = false;
  speedY = 0;
  acceleration = 2.5;
  energy = 100;
  lastHit = 0;

  /**
   * Applies gravity to the object if it is above the ground.
   * @returns {void}
   */
  applyGravity() {
    setInterval(() => {
      if (this.isAboveGround() || this.speedY > 0) {
        this.y -= this.speedY;
        this.speedY -= this.acceleration;
      }
    }, 1000 / 30);
  }

  /**
   * Checks whether the object is above ground level.
   * @returns {boolean} True if the object has not reached the ground.
   */
  isAboveGround() {
    if (this instanceof ThrowableObject) {
      return true;
    } else {
      return this.y < 90;
    }
  }

  /**
   * Determines whether this object collides with another.
   * @param {MovableObject} mo - Another movable object.
   * @returns {boolean} True if objects overlap.
   */
  isColliding(mo) {
    return (
      this.x + this.width > mo.x &&
      this.y + this.height > mo.y &&
      this.x < mo.x &&
      this.y < mo.y + mo.height
    );
  }

  /**
   * Reduces energy when hit and records the time of the hit.
   * @returns {void}
   */
  hit() {
    this.energy -= 5;
    if (this.energy < 0) {
      this.energy = 0;
    } else {
      this.lastHit = new Date().getTime();
    }
  }

  /**
   * Checks if the object was recently hit.
   * @returns {boolean} True if the object is still hurt.
   */
  isHurt() {
    let timePassed = new Date().getTime() - this.lastHit; // differenz in ms
    timePassed = timePassed / 1000; // differenz in sek
    return timePassed < 1;
  }

  /**
   * Checks if the object's energy has depleted.
   * @returns {boolean} True if energy is zero.
   */
  isDead() {
    return this.energy == 0;
  }

  /**
   * Plays an animation by cycling through image paths.
   * @param {string[]} images - Array of image paths.
   * @returns {void}
   */
  playAnimation(images) {
    let i = this.currentImage % images.length;
    let path = images[i];
    this.img = this.imageCache[path];
    this.currentImage++;
  }

  /**
   * Moves the object to the right.
   * @returns {void}
   */
  moveRight() {
    this.x += this.speed;
  }

  /**
   * Moves the object to the left.
   * @returns {void}
   */
  moveLeft() {
    this.x -= this.speed;
  }

  /**
   * Initiates a jump by setting the vertical speed.
   * @returns {void}
   */
  jump() {
    this.speedY = 25;
  }
}
