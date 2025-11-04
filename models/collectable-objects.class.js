/**
 * Base class for objects that can be collected by the character.
 * Provides generic animation and collection logic.
 * @extends MovableObject
 */
class Collectable extends MovableObject {
  /**
   * Creates a collectable object.
   * @param {string} arrayName - Name of the array in the level that holds this object.
   */
  constructor(arrayName) {
    super();
    this.arrayName = arrayName;
    this.x = 300 + Math.random() * (2000 - this.width);
    this.y = 320;
  }

  /**
   * Plays the idle animation using the provided interval.
   * @param {number} interval - Interval in milliseconds.
   * @returns {void}
   */
  animate(interval) {
    let i = 0;
    this.animationInterval = setInterval(() => {
      this.img = this.imageCache[this.IMAGES[i % this.IMAGES.length]];
      i++;
    }, interval);
  }

  /**
   * Removes the object from the world when collected.
   * @param {string} [arrayName=this.arrayName] - Name of the array to remove from.
   * @returns {void}
   */
  collect(arrayName = this.arrayName) {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
    }
    if (this.world && this.world.level && arrayName) {
      let collection = this.world.level[arrayName];
      if (collection) {
        let index = collection.indexOf(this);
        if (index > -1) {
          collection.splice(index, 1);
          this.world = null;
        }
      }
    }
  }
}

/**
 * Bottles that can be collected by the character.
 * @extends Collectable
 */
class CollectableBottle extends Collectable {
  IMAGES = [
    "assets/img/6_salsa_bottle/1_salsa_bottle_on_ground.png",
    "assets/img/6_salsa_bottle/2_salsa_bottle_on_ground.png",
  ];

  /**
   * Creates a collectable bottle at a random position.
   */
  constructor() {
    super("collectableObjects");
    this.loadImage(this.IMAGES[0]);
    this.width = 100;
    this.height = 120;
    this.offset = { top: 25, right: 25, bottom: 15, left: 25 };
    this.loadImages(this.IMAGES);
    this.animate(500);
  }
}

/**
 * Coins that can be collected by the character.
 * @extends Collectable
 */
class CollectableCoin extends Collectable {
  IMAGES = ["assets/img/8_coin/coin_1.png", "assets/img/8_coin/coin_2.png"];

  /**
   * Creates a collectable coin at a random position.
   */
  constructor() {
    super("coinObjects");
    this.loadImage(this.IMAGES[0]);
    this.width = 150;
    this.height = 150;
    this.offset = { top: 45, right: 45, bottom: 45, left: 45 };
    this.loadImages(this.IMAGES);
    this.animate(750);
  }
}
