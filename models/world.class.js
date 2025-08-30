/**
 * Main game world tying together all objects and rendering.
 */
class World {
  character = new Character();
  level = level1;
  canvas;
  ctx;
  keyboard;
  camera_x = 0;
  statusBarHealth = new StatusBarHealth();
  statusBarBottles = new StatusBarBottles();
  statusBarCoins = new StatusBarCoins();
  statusBarEndboss = new StatusBarEndboss();
  throwableObjects = [];
  lastCameraX = 0;
  collectedBottles = 0;
  maxBottles = 5;
  collectedCoins = 0;
  maxCoins = 5;
  endboss = this.level.enemies.find((enemy) => enemy instanceof Endboss);

  /**
   * Creates the game world.
   * @param {HTMLCanvasElement} canvas - Canvas to render on.
   * @param {Keyboard} keyboard - Input keyboard instance.
   */
  constructor(canvas, keyboard) {
    this.ctx = canvas.getContext("2d");
    this.canvas = canvas;
    this.keyboard = keyboard;
    this.draw();
    this.setWorld();
    this.run();
    this.startChickenSpawner();
  }

  /**
   * Periodically checks camera movement to spawn chickens.
   * @returns {void}
   */
  startChickenSpawner() {
    setInterval(() => {
      if (this.camera_x < this.lastCameraX) {
        this.spawnChicken();
        this.lastCameraX = this.camera_x;
      }
    }, 3000);
  }

  /**
   * Spawns a chicken just outside the viewport.
   * @returns {void}
   */
  spawnChicken() {
    if (this.camera_x >= -1700) {
      let spawnX = -this.camera_x + this.canvas.width + 200;
      let chicken = new Chicken();
      chicken.x = spawnX;
      chicken.world = this;
      this.level.enemies.push(chicken);
    }
  }

  /**
   * Assigns the world reference to contained objects.
   * @returns {void}
   */
  setWorld() {
    this.character.world = this;
    this.level.enemies.forEach((enemy) => (enemy.world = this));
    this.level.collectableObjects.forEach((obj) => (obj.world = this));
    this.level.coinObjects.forEach((obj) => (obj.world = this));
    this.totalBottles = this.level.collectableObjects.length;
  }

  /**
   * Starts the main game loop checking collisions and throws.
   * @returns {void}
   */
  run() {
    setInterval(() => {
      this.checkCollisionsStomping();
      this.checkCollisionsCharacter();
      this.checkCollisionsBottle();
      this.checkCollisionsCoins();
      this.checkThrowObjects();
      this.checkBottleHitsEndboss();
    }, 200);
  }

  /**
   * Handles throwing bottles when the D key is pressed.
   * @returns {void}
   */
  checkThrowObjects() {
    if (this.keyboard.D && this.collectedBottles > 0) {
      let bottle = new ThrowableObject(
        this.character.x,
        this.character.y + 200
      );
      bottle.world = this;
      this.throwableObjects.push(bottle);
      this.collectedBottles--;
      let perc = (this.collectedBottles / this.maxBottles) * 100;
      this.statusBarBottles.setPercentage(perc);
    }
  }

  /**
   * Checks collisions between the character and other objects.
   * @returns {void}
   */
  checkCollisionsCharacter() {
    this.level.enemies.forEach((enemy) => {
      if (
        !enemy.dead &&
        this.character.isColliding(enemy) &&
        !MovableObject.isTopBottomCollision(this.character, enemy) &&
        !this.character.isHurt()
      ) {
        this.character.hit();
        this.statusBarHealth.setPercentage(this.character.energy);
      }
    });
  }

  /**
   * Detects and resolves collisions when the character stomps chickens.
   * @returns {void}
   */
  checkCollisionsStomping() {
    this.level.enemies
      .filter((enemy) => enemy instanceof Chicken)
      .forEach((enemy) => {
        if (
          !enemy.dead &&
          MovableObject.isTopBottomCollision(this.character, enemy)
        ) {
          enemy.die();
        }
      });
  }

  /**
   * Handles collisions between the character and collectible bottles.
   * @returns {void}
   */
  checkCollisionsBottle() {
    this.level.collectableObjects.forEach((obj) => {
      if (
        this.character.isColliding(obj) &&
        this.collectedBottles < this.maxBottles
      ) {
        obj.collect();
        this.collectedBottles++;
        let perc = (this.collectedBottles / this.maxBottles) * 100;
        this.statusBarBottles.setPercentage(perc);
      }
    });
  }

  /**
   * Handles collisions between the character and collectible coins.
   * @returns {void}
   */
  checkCollisionsCoins() {
    this.level.coinObjects.forEach((obj) => {
      if (this.character.isColliding(obj)) {
        obj.collect();
        this.collectedCoins++;
        let perc = (this.collectedCoins / this.maxCoins) * 100;
        this.statusBarCoins.setPercentage(perc);
        if (this.collectedCoins == this.maxCoins) {
          this.character.heal(20);
          this.statusBarHealth.setPercentage(this.character.energy);
          this.collectedCoins = 0;
          this.statusBarCoins.setPercentage(0);
        }
      }
    });
  }

  /**
   * Checks collisions between thrown bottles and the endboss.
   * @returns {void}
   */
  checkBottleHitsEndboss() {
    let endboss = this.level.enemies.find((enemy) => enemy instanceof Endboss);
    if (!endboss || endboss.dead) {
      return;
    }
    this.throwableObjects.forEach((bottle) => {
      if (!bottle.hasSplashed && bottle.isColliding(endboss)) {
        bottle.hasSplashed = true;
        clearInterval(bottle.animationInterval);
        clearInterval(bottle.throwInterval);
        clearInterval(bottle.gravityInterval);
        bottle.playSplashAnimationOnce();
        endboss.hit();

        this.statusBarEndboss.setPercentage(endboss.energy);
      }
    });
  }

  /**
   * Clears the canvas and draws all game objects.
   * @returns {void}
   */
  draw = () => {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.translate(this.camera_x, 0);
    this.addObjectsToMap(this.level.backgroundObjects);

    this.ctx.translate(-this.camera_x, 0); //Back
    this.addToMap(this.statusBarHealth);
    this.addToMap(this.statusBarBottles);
    this.addToMap(this.statusBarCoins);
    if (
      this.endboss &&
      this.endboss.x + this.camera_x >= 0 &&
      this.endboss.x + this.camera_x <= this.canvas.width
    ) {
      this.addToMap(this.statusBarEndboss);
    }
    this.ctx.translate(this.camera_x, 0); //Forward

    this.addToMap(this.character);
    this.addObjectsToMap(this.level.enemies);
    this.addObjectsToMap(this.level.clouds);
    this.addObjectsToMap(this.throwableObjects);
    this.addObjectsToMap(this.level.collectableObjects);
    this.addObjectsToMap(this.level.coinObjects);

    this.ctx.translate(-this.camera_x, 0);

    requestAnimationFrame(this.draw);
  };

  /**
   * Adds multiple objects to the canvas.
   * @param {DrawableObject[]} objects - Objects to add.
   * @returns {void}
   */
  addObjectsToMap(objects) {
    objects.forEach((o) => {
      this.addToMap(o);
    });
  }

  /**
   * Draws a single movable object and handles direction flipping.
   * @param {MovableObject} mo - Object to draw.
   * @returns {void}
   */
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

  /**
   * Flips an image horizontally for left-facing orientation.
   * @param {MovableObject} mo - Object to flip.
   * @returns {void}
   */
  flipImage(mo) {
    this.ctx.save();
    this.ctx.translate(mo.width, 0);
    this.ctx.scale(-1, 1);
    mo.x = mo.x * -1;
  }

  /**
   * Restores the image after flipping.
   * @param {MovableObject} mo - Previously flipped object.
   * @returns {void}
   */
  flipImageBack(mo) {
    mo.x = mo.x * -1;
    this.ctx.restore();
  }
}
