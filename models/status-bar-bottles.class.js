/**
 * Status bar showing collected bottle percentage.
 * @extends DrawableObject
 */
class StatusBarBottles extends DrawableObject {
  IMAGES = [
    "assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/green/0.png",
    "assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/green/20.png",
    "assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/green/40.png",
    "assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/green/60.png",
    "assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/green/80.png",
    "assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/green/100.png",
  ];

  percantage = 0;

  /**
   * Creates the bottle status bar and loads its images.
   */
  constructor() {
    super();
    this.loadImages(this.IMAGES);
    this.x = 30;
    this.y = 50;
    this.width = 200;
    this.height = 60;
    this.setPercentage(0);
  }

  /**
   * Updates the displayed bottle percentage.
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
