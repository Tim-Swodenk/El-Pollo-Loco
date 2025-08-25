/**
 * Represents a movable background element.
 * @extends MovableObject
 */
class BackgroundObject extends MovableObject {
  width = 720;
  height = 480;

  /**
   * Creates a new background object.
   * @param {string} imagePath - Path to the background image.
   * @param {number} [x=0] - Horizontal position.
   * @param {number} [y] - Vertical position; defaults to aligning with the ground.
   */
  constructor(imagePath, x = 0, y = undefined) {
    super().loadImage(imagePath);
    this.x = x;
    this.y = y === undefined ? 480 - this.height : y;
  }
}
