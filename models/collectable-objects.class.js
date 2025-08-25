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
    if (this.world && this.world.collectableObjects) {
      const index = this.world.collectableObjects.indexOf(this);
      if (index > -1) {
        this.world.collectableObjects.splice(index, 1);
      }
    }
  }
}
