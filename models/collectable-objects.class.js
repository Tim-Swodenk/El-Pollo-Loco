/**
 * Bottles that can be collected by the character.
 * @extends MovableObject
 */
class CollectableBottle extends MovableObject {
  IMAGES = [
    "assets/img/6_salsa_bottle/1_salsa_bottle_on_ground.png",
    "assets/img/6_salsa_bottle/2_salsa_bottle_on_ground.png",
  ];

  /**
   * Creates a collectable bottle at a random position.
   * @param {number} x - Horizontal position (unused).
   * @param {number} y - Vertical position (unused).
   */
  constructor(x, y) {
    super().loadImage(this.IMAGES[0]);
    this.x = 300 + Math.random() * (2000 - this.width);
    this.y = 320;
    this.width = 100;
    this.height = 120;
    this.loadImages(this.IMAGES);
    this.animate();
  }

  /**
   * Plays the idle animation.
   * @returns {void}
   */
  animate() {
    let i = 0;
    this.animationInterval = setInterval(() => {
      this.img = this.imageCache[this.IMAGES[i % this.IMAGES.length]];
      i++;
    }, 500);
  }

  /**
   * Removes the bottle from the world when collected.
   * @returns {void}
   */
  collect() {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
    }
    if (this.world && this.world.level && this.world.level.collectableObjects) {
      const index = this.world.level.collectableObjects.indexOf(this);
      if (index > -1) {
        this.world.level.collectableObjects.splice(index, 1);
        this.world = null;
      }
    }
  }
}
/**
 * Coins that can be collected by the character.
 * @extends MovableObject
 */
class CollectableCoin extends MovableObject {
  IMAGES = ["assets/img/8_coin/coin_1.png", "assets/img/8_coin/coin_2.png"];

  /**
   * Creates a collectable coin at a random position.
   * @param {number} x - Horizontal position (unused).
   * @param {number} y - Vertical position (unused).
   */
  constructor(x, y) {
    super().loadImage(this.IMAGES[0]);
    this.x = 300 + Math.random() * (2000 - this.width);
    this.y = 320;
    this.width = 150;
    this.height = 150;
    this.loadImages(this.IMAGES);
    this.animate();
  }

  /**
   * Plays the idle animation.
   * @returns {void}
   */
  animate() {
    let i = 0;
    this.animationInterval = setInterval(() => {
      this.img = this.imageCache[this.IMAGES[i % this.IMAGES.length]];
      i++;
    }, 750);
  }

  /**
   * Removes the coin from the world when collected.
   * @returns {void}
   */
  collect() {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
    }
    if (this.world && this.world.level && this.world.level.coinObjects) {
      const index = this.world.level.coinObjects.indexOf(this);
      if (index > -1) {
        this.world.level.coinObjects.splice(index, 1);
        this.world = null;
      }
    }
  }
}
