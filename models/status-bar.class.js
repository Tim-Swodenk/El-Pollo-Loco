class StatusBar extends DrawableObject {
  IMAGES = [
    "assets/img/7_statusbars/1_statusbar/2_statusbar_health/green/0.png",
    "assets/img/7_statusbars/1_statusbar/2_statusbar_health/green/20.png",
    "assets/img/7_statusbars/1_statusbar/2_statusbar_health/green/40.png",
    "assets/img/7_statusbars/1_statusbar/2_statusbar_health/green/60.png",
    "assets/img/7_statusbars/1_statusbar/2_statusbar_health/green/80.png",
    "assets/img/7_statusbars/1_statusbar/2_statusbar_health/green/100.png",
  ];

  percantage = 100;

  constructor() {
    super();
    this.loadImages(this.IMAGES);
    this.x = 30;
    this.y = 0;
    this.width = 200;
    this.height = 60;
    this.setPercentage(100);
  }

  setPercentage(percantage) {
    this.percantage = percantage; // => 0..5
    let path = this.IMAGES[this.resolveImageIndex()];
    this.img = this.imageCache[path];
  }
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
