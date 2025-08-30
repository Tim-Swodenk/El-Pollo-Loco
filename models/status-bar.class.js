/**
 * Base class for status bars displaying percentage values.
 * @extends DrawableObject
 */
class StatusBar extends DrawableObject {
  /**
   * Creates a new status bar.
   * @param {string[]} images - Image paths for different percentage states.
   * @param {number} percentage - Initial percentage value (0 to 100).
   * @param {number} y - Vertical position of the bar.
   */
  constructor(images, percentage, y) {
    super();
    this.IMAGES = images;
    this.loadImages(this.IMAGES);
    this.x = 10;
    this.y = y;
    this.width = 180;
    this.height = 50;
    this.setPercentage(percentage);
  }

  /**
   * Updates the displayed percentage.
   * @param {number} percentage - Value from 0 to 100.
   * @returns {void}
   */
  setPercentage(percentage) {
    this.percentage = percentage;
    const path = this.IMAGES[this.resolveImageIndex()];
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
