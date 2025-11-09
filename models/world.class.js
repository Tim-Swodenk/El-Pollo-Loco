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

  nextCloudSpawnX = 0;

  statusBarHealth = new StatusBarHealth();
  statusBarBottles = new StatusBarBottles();
  statusBarCoins = new StatusBarCoins();
  statusBarEndboss = new StatusBarEndboss();

  throwableObjects = [];

  lastCameraX = 0;

  throwCooldownMs = 500;
  lastThrowTime = 0;

  collectedBottles = 0;
  maxBottles = 5;

  collectedCoins = 0;
  maxCoins = 5;

  endboss = this.level.enemies.find((enemy) => enemy instanceof Endboss);

  gameLoopIntervalId = null;
  chickenSpawnerId = null;
  cloudSpawnerId = null;

  gameOverTriggered = false;
  onGameOver = null;

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
    this.startCloudSpawner();
  }

  /**
   * Periodically checks camera movement to spawn chickens.
   * @returns {void}
   */
  startChickenSpawner() {
    this.stopChickenSpawner();
    this.chickenSpawnerId = setInterval(() => {
      if (this.camera_x < this.lastCameraX) {
        this.spawnChicken();
        this.lastCameraX = this.camera_x;
      }
    }, 3000);
  }

  /**
   * Stops spawning chickens.
   * @returns {void}
   */
  stopChickenSpawner() {
    if (!this.chickenSpawnerId) return;
    clearInterval(this.chickenSpawnerId);
    this.chickenSpawnerId = null;
  }

  /**
   * Spawns a chicken just outside the viewport.
   * @returns {void}
   */
  spawnChicken() {
    if (this.camera_x < -1700) return;

    const spawnX = -this.camera_x + this.canvas.width + 200;
    const enemy = Math.random() < 0.5 ? new Chicken() : new SmallChicken();
    enemy.x = spawnX;
    this.registerEnemy(enemy);

    this.level.enemies.push(enemy);
  }

  /**
   * Assigns the world to the enemy and starts its behaviour if supported.
   * @param {MovableObject} enemy - Enemy to register.
   * @returns {void}
   */
  registerEnemy(enemy) {
    enemy.world = this;
    if (typeof enemy.startBehavior === "function") {
      enemy.startBehavior();
    }
  }

  /**
   * Assigns the world reference to contained objects.
   * @returns {void}
   */
  setWorld() {
    this.character.world = this;

    for (const enemy of this.level.enemies) {
      this.registerEnemy(enemy);
    }
    for (const obj of this.level.collectableObjects) {
      obj.world = this;
    }
    for (const obj of this.level.coinObjects) {
      obj.world = this;
    }

    this.totalBottles = this.level.collectableObjects.length;
  }

  /**
   * Periodically removes off-screen clouds and spawns new ones to the right.
   * @returns {void}
   */
  startCloudSpawner() {
    this.nextCloudSpawnX = 0;

    // initial fill
    for (let i = 0; i < 6; i++) {
      const cloud = new Cloud(this.nextCloudSpawnX);
      this.level.clouds.push(cloud);
      this.nextCloudSpawnX += cloud.width;
    }

    this.stopCloudSpawner();
    this.cloudSpawnerId = setInterval(() => {
      // keep only visible clouds
      this.level.clouds = this.level.clouds.filter(
        (cloud) => cloud.x + cloud.width >= 0
      );

      // add one more to the right
      const cloud = new Cloud(this.nextCloudSpawnX);
      this.level.clouds.push(cloud);
      this.nextCloudSpawnX += cloud.width;
    }, 60000);
  }

  /**
   * Stops spawning clouds.
   * @returns {void}
   */
  stopCloudSpawner() {
    if (!this.cloudSpawnerId) return;
    clearInterval(this.cloudSpawnerId);
    this.cloudSpawnerId = null;
  }

  /**
   * Starts the main game loop checking collisions and throws.
   * @returns {void}
   */
  run() {
    this.stopGameLoop();
    this.gameLoopIntervalId = setInterval(() => {
      this.checkCollisionsStomping();
      this.checkCollisionsCharacter();
      this.checkCollisionsBottle();
      this.checkCollisionsCoins();
      this.checkThrowObjects();
      this.checkBottleHitsRegularEnemies();
      this.checkBottleHitsEndboss();

      if (!this.gameOverTriggered && this.character.isDead()) {
        this.triggerGameOver("loss");
      }
    }, 100);
  }

  /**
   * Stops the main game loop interval.
   * @returns {void}
   */
  stopGameLoop() {
    if (!this.gameLoopIntervalId) return;
    clearInterval(this.gameLoopIntervalId);
    this.gameLoopIntervalId = null;
  }

  /**
   * Registers a callback that is executed when the game is over.
   * @param {() => void} callback - Callback to run.
   * @returns {void}
   */
  setOnGameOver(callback) {
    this.onGameOver = callback;
  }

  /**
   * Stops movement, timers and triggers the game over callback.
   * @param {"win"|"loss"} [reason="loss"] - Outcome that finished the game.
   * @returns {void}
   */
  triggerGameOver(reason = "loss") {
    if (this.gameOverTriggered) return;

    this.gameOverTriggered = true;

    this.stopGameLoop();
    this.stopChickenSpawner();
    this.stopCloudSpawner();
    this.disablePlayerControl();

    if (typeof this.onGameOver === "function") {
      this.onGameOver(reason);
    }
  }

  /**
   * Resets keyboard state to stop all movement.
   * @returns {void}
   */
  disablePlayerControl() {
    if (!this.keyboard) return;

    for (const key of Object.keys(this.keyboard)) {
      this.keyboard[key] = false;
    }
    this.character.speed = 0;
    this.character.speedY = 0;
  }

  /**
   * Handles throwing bottles when the D key is pressed.
   * @returns {void}
   */
  checkThrowObjects() {
    if (!this.keyboard.D || this.collectedBottles <= 0) return;

    const now = Date.now();
    if (now - this.lastThrowTime < this.throwCooldownMs) return;

    let bottle = new ThrowableObject(this.character.x, this.character.y + 200);
    bottle.world = this;
    this.throwableObjects.push(bottle);

    this.lastThrowTime = now;

    this.collectedBottles--;
    let perc = (this.collectedBottles / this.maxBottles) * 100;
    this.statusBarBottles.setPercentage(perc);
  }

  /**
   * Checks collisions between the character and other objects.
   * @returns {void}
   */
  checkCollisionsCharacter() {
    for (const enemy of this.level.enemies) {
      if (
        enemy.dead ||
        !this.character.isColliding(enemy) ||
        MovableObject.isTopBottomCollision(this.character, enemy) ||
        this.character.isHurt()
      ) {
        continue;
      }
      this.character.hit();
      this.statusBarHealth.setPercentage(this.character.energy);
    }
  }

  /**
   * Detects and resolves collisions when the character stomps chickens.
   * @returns {void}
   */
  checkCollisionsStomping() {
    for (const enemy of this.level.enemies) {
      if (!(enemy instanceof Chicken || enemy instanceof SmallChicken))
        continue;
      if (enemy.dead) continue;

      if (MovableObject.isTopBottomCollision(this.character, enemy)) {
        enemy.die();
      }
    }
  }

  /**
   * Handles collisions between the character and collectible bottles.
   * @returns {void}
   */
  checkCollisionsBottle() {
    for (const obj of this.level.collectableObjects) {
      if (
        this.character.isColliding(obj) &&
        this.collectedBottles < this.maxBottles
      ) {
        obj.collect();
        this.collectedBottles++;
        const perc = (this.collectedBottles / this.maxBottles) * 100;
        this.statusBarBottles.setPercentage(perc);
      }
    }
  }

  /**
   * Handles collisions between the character and collectible coins.
   * @returns {void}
   */
  checkCollisionsCoins() {
    for (const obj of this.level.coinObjects) {
      if (!this.character.isColliding(obj)) continue;

      obj.collect();
      this.collectedCoins++;
      const perc = (this.collectedCoins / this.maxCoins) * 100;
      this.statusBarCoins.setPercentage(perc);

      if (this.collectedCoins === this.maxCoins) {
        this.character.heal(20);
        this.statusBarHealth.setPercentage(this.character.energy);
        this.collectedCoins = 0;
        this.statusBarCoins.setPercentage(0);
      }
    }
  }

  /**
   * Checks collisions between thrown bottles and the endboss.
   * @returns {void}
   */
  checkBottleHitsEndboss() {
    const endboss = this.level.enemies.find((e) => e instanceof Endboss);
    if (!endboss || endboss.dead) return;

    for (const bottle of this.throwableObjects) {
      if (bottle.hasSplashed) continue;
      if (!bottle.isColliding(endboss)) continue;

      this.handleBottleImpact(bottle);

      endboss.hit();
      this.statusBarEndboss.setPercentage(endboss.energy);

      if (!this.gameOverTriggered && endboss.energy <= 0) {
        this.triggerGameOver("win");
      }
    }
  }

  /**
   * Checks collisions between thrown bottles and regular enemies (chickens).
   * @returns {void}
   */
  checkBottleHitsRegularEnemies() {
    for (const bottle of this.throwableObjects) {
      if (bottle.hasSplashed) continue;

      for (const enemy of this.level.enemies) {
        if (
          enemy.dead ||
          !(enemy instanceof Chicken || enemy instanceof SmallChicken)
        ) {
          continue;
        }
        if (!bottle.isColliding(enemy)) continue;

        this.handleBottleImpact(bottle);
        enemy.die();
        break;
      }
    }
  }

  /**
   * Stops bottle movement and starts the splash animation.
   * @param {ThrowableObject} bottle - The bottle that hit something.
   * @returns {void}
   */
  handleBottleImpact(bottle) {
    if (bottle.hasSplashed) return;

    bottle.hasSplashed = true;
    clearInterval(bottle.animationInterval);
    clearInterval(bottle.throwInterval);
    clearInterval(bottle.gravityInterval);
    bottle.playSplashAnimationOnce();
  }

  /**
   * Clears the canvas and draws all game objects.
   * @returns {void}
   */
  draw = () => {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    //background & clouds
    this.ctx.translate(this.camera_x, 0);
    this.addObjectsToMap(this.level.backgroundObjects);
    this.addObjectsToMap(this.level.clouds);

    //HUD
    this.ctx.translate(-this.camera_x, 0);
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

    //foreground actors
    this.ctx.translate(this.camera_x, 0);
    this.addToMap(this.character);
    this.addObjectsToMap(this.level.enemies);
    this.addObjectsToMap(this.throwableObjects);
    this.addObjectsToMap(this.level.collectableObjects);
    this.addObjectsToMap(this.level.coinObjects);

    //reset transform for next frame
    this.ctx.translate(-this.camera_x, 0);

    requestAnimationFrame(this.draw);
  };

  /**
   * Adds multiple objects to the canvas.
   * @param {DrawableObject[]} objects - Objects to add.
   * @returns {void}
   */
  addObjectsToMap(objects) {
    for (const o of objects) {
      this.addToMap(o);
    }
  }

  /**
   * Draws a single movable object and handles direction flipping.
   * @param {MovableObject} mo - Object to draw.
   * @returns {void}
   */
  addToMap(mo) {
    if (mo.otherDirection) this.flipImage(mo);

    mo.draw(this.ctx);
    //mo.drawFrame(this.ctx);

    if (mo.otherDirection) this.flipImageBack(mo);
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
