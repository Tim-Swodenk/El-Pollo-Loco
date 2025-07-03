class Cloud extends MovableObject {
  y = 10;
  width = 400;
  height = 400;

  constructor() {
    super().loadImage("assets/img/5_background/layers/4_clouds/1.png");

    this.x = Math.random() * 500; //zahl zwischen 200 und 700
    this.animate();
  }

  animate() {
    this.moveLeft();
  }
}
