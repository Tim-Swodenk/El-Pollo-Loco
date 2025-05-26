class Cloud extends MovableObject {
  y = 10;

  constructor() {
    super().loadImage("assets/img/5_background/layers/4_clouds/1.png");

    this.x = Math.random() * 500;

    this.width = 400;
    this.height = 400;
  }
}
