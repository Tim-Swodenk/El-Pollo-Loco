/**
 * Status bar displaying the endboss's health.
 * @extends DrawableObject
 */
class StatusBarEndboss extends DrawableObject {
  IMAGES = [
    "assets/img/7_statusbars/2_statusbar_endboss/green/green0.png",
    "assets/img/7_statusbars/2_statusbar_endboss/green/green20.png",
    "assets/img/7_statusbars/2_statusbar_endboss/green/green40.png",
    "assets/img/7_statusbars/2_statusbar_endboss/green/green60.png",
    "assets/img/7_statusbars/2_statusbar_endboss/green/green80.png",
    "assets/img/7_statusbars/2_statusbar_endboss/green/green100.png",
  ];

  percantage = 100;

  /**
   * Creates the endboss status bar and loads its images.
   */
  constructor() {
    super();
    this.loadImages(this.IMAGES);
    this.x = 490;
    this.y = 0;
    this.width = 200;
    this.height = 60;
    this.setPercentage(100);
  }

  /**
   * Updates the displayed health percentage of the endboss.
   * @param {number} percantage - Value from 0 to 100.
   * @returns {void}
   */
  setPercentage(percantage) {
    this.percantage = percantage;
    let path = this.IMAGES[this.resolveImageIndex()];
    this.img = this.imageCache[path];
  }

  /**
   * Determines the image index based on the current percentage.
   * @returns {number} Index of the image to display.
   */
  resolveImageIndex() {
    if (this.percantage == 100) {
      return 5;
    } else if (this.percantage > 80) {
      return 4;
    } else if (this.percantage > 60) {
      return 3;
    } else if (this.percantage > 40) {
      return 2;
    } else if (this.percantage > 20) {
      return 1;
    } else {
      return 0;
    }
  }
}
