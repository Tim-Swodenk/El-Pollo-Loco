/**
 * Extension of {@link DrawableObject} that adds movement and physics.
 */
class MovableObject extends DrawableObject {
  speed = 0.15;
  otherDirection = false;
  speedY = 0;
  acceleration = 2.5;
  energy = 1000;
  lastHit = 0;
  offset = { top: 0, right: 0, bottom: 0, left: 0 };

  /**
   * Applies gravity to the object if it is above the ground.
   * @returns {void}
   */
  applyGravity() {
    setInterval(() => {
      if (this.isAboveGround() || this.speedY > 0) {
        this.y -= this.speedY;
        this.speedY -= this.acceleration;
      } else {
        this.speedY = 0;
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
      this.x + this.width - this.offset.right > mo.x + mo.offset.left &&
      this.y + this.height - this.offset.bottom > mo.y + mo.offset.top &&
      this.x + this.offset.left < mo.x + mo.width - mo.offset.right &&
      this.y + this.offset.top < mo.y + mo.height - mo.offset.bottom
    );
  }

  /**
   * Determines if the character's bottom edge hits the enemy's top edge while falling.
   * * Adds a 30px downward margin to enlarge the stomp hitbox.
   * @param {MovableObject} char - The character object.
   * @param {MovableObject} enemy - The enemy to test against.
   * @returns {boolean} True if the character stomps the enemy.
   */
  static isTopBottomCollision(char, enemy) {
    let charBottom = char.y + char.height - char.offset.bottom;
    let enemyStompTop = enemy.y + enemy.offset.top - 30;

    let overlapsX =
      char.x + char.width - char.offset.right > enemy.x + enemy.offset.left &&
      char.x + char.offset.left < enemy.x + enemy.width - enemy.offset.right;

    return overlapsX && charBottom >= enemyStompTop && char.speedY < 0;
  }

  /**
   * Reduces energy when hit and records the time of the hit.
   *  @param {number} [damage=5] - Amount of energy to subtract.
   * @returns {void}
   */
  hit(damage = 20) {
    this.energy -= damage;
    if (this.energy < 0) {
      this.energy = 0;
    } else {
      this.lastHit = new Date().getTime();
    }
  }

  /**
   * Restores energy by a given amount up to a maximum of 100.
   * @param {number} amount - Amount of energy to restore.
   * @returns {void}
   */
  heal(amount) {
    this.energy = Math.min(this.energy + amount, 100);
  }

  /**
   * Checks if the object was recently hit.
   * @returns {boolean} True if the object is still hurt.
   */
  isHurt() {
    let timePassed = new Date().getTime() - this.lastHit;
    timePassed = timePassed / 1000;
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
