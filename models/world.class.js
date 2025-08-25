class World {
  character = new Character();
  level = level1;
  canvas;
  ctx;
  keyboard;
  camera_x = 0;
  statusBar = new StatusBar();
  statusBarBottles = new StatusBarBottles();
  throwableObjects = [];
  lastCameraX = 0;
  collectedBottles = 0;
  totalBottles = 0;

  constructor(canvas, keyboard) {
    this.ctx = canvas.getContext("2d");
    this.canvas = canvas;
    this.keyboard = keyboard;
    this.draw();
    this.setWorld();
    this.run();
    this.startChickenSpawner();
  }

  startChickenSpawner() {
    setInterval(() => {
      if (this.camera_x < this.lastCameraX) {
        this.spawnChicken();
        this.lastCameraX = this.camera_x;
      }
    }, 3000);
  }

  spawnChicken() {
    if (this.camera_x >= -1700) {
      let spawnX = -this.camera_x + this.canvas.width + 200;
      let chicken = new Chicken();
      chicken.x = spawnX;
      this.level.enemies.push(chicken);
    }
  }

  setWorld() {
    this.character.world = this;
    this.level.collectableObjects.forEach((obj) => (obj.world = this));
  }

  run() {
    setInterval(() => {
      this.checkCollisions();
      this.checkThrowObjects();
    }, 200);
  }

  checkThrowObjects() {
    if (this.keyboard.D) {
      let bottle = new ThrowableObject(
        this.character.x,
        +250,
        this.character.y
      );
      bottle.world = this;
      this.throwableObjects.push(bottle);
    }
  }

  checkCollisions() {
    this.level.enemies.forEach((enemy) => {
      if (this.character.isColliding(enemy)) {
        this.character.hit();
        this.statusBar.setPercentage(this.character.energy);
      }
    });
    this.level.collectableObjects.forEach((obj) => {
      if (this.character.isColliding(obj)) {
        console.log(obj);

        obj.collect(); // Flasche entfernen
        this.collectedBottles = (this.collectedBottles || 0) + 1;
        let perc = (this.collectedBottles / this.totalBottles) * 100;
        this.statusBarBottles.setPercentage(perc);
      }
    });
  }

  draw = () => {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.translate(this.camera_x, 0);
    this.addObjectsToMap(this.level.backgroundObjects);

    this.ctx.translate(-this.camera_x, 0); //Back
    this.addToMap(this.statusBar);
    this.addToMap(this.statusBarBottles);
    this.ctx.translate(this.camera_x, 0); //Forward

    this.addToMap(this.character);
    this.addObjectsToMap(this.level.enemies);
    this.addObjectsToMap(this.level.clouds);
    this.addObjectsToMap(this.throwableObjects);
    this.addObjectsToMap(this.level.collectableObjects);

    this.ctx.translate(-this.camera_x, 0);

    requestAnimationFrame(this.draw);
  };

  addObjectsToMap(objects) {
    objects.forEach((o) => {
      this.addToMap(o);
    });
  }

  addToMap(mo) {
    if (mo.otherDirection) {
      this.flipImage(mo);
    }

    mo.draw(this.ctx);
    mo.drawFrame(this.ctx);

    if (mo.otherDirection) {
      this.flipImageBack(mo);
    }
  }

  flipImage(mo) {
    this.ctx.save();
    this.ctx.translate(mo.width, 0);
    this.ctx.scale(-1, 1);
    mo.x = mo.x * -1;
  }

  flipImageBack(mo) {
    mo.x = mo.x * -1;
    this.ctx.restore();
  }
}
