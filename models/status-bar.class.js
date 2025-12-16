/**
 * Base class for status bars displaying percentage values.
 * @extends DrawableObject
 */
class StatusBar extends DrawableObject {
  /**
   * Creates a new status bar.
   * @param {Object} config - Configuration for the bar visuals and position.
   * @param {string[]} config.images - Image paths for different percentage states.
   * @param {number} [config.percentage=0] - Initial percentage value (0 to 100).
   * @param {number} [config.x=10] - Horizontal position of the bar.
   * @param {number} [config.y=0] - Vertical position of the bar.
   * @param {number} [config.width=180] - Display width of the bar.
   * @param {number} [config.height=50] - Display height of the bar.
   */
  constructor({
    images,
    percentage = 0,
    x = 10,
    y = 0,
    width = 180,
    height = 50,
  }) {
    super();
    this.IMAGES = images;
    this.loadImages(this.IMAGES);
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.setPercentage(percentage);
  }

  /**
   * Updates the displayed percentage.
   * @param {number} percentage - Value from 0 to 100.
   * @returns {void}
   */
  setPercentage(percentage) {
    this.percentage = percentage;
    let path = this.IMAGES[this.resolveImageIndex()];
    this.img = this.imageCache[path];
  }

  /**
   * Determines the image index based on the current percentage.
   * @returns {number} Index of the image to display.
   */
  resolveImageIndex() {
    let steps = this.IMAGES.length - 1;
    let stepSize = 100 / steps;
    return Math.max(0, Math.min(steps, Math.round(this.percentage / stepSize)));
  }
}
