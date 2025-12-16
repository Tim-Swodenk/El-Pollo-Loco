const STATUS_BAR_CONFIGS = {
  health: {
    images: [
      "assets/img/7_statusbars/1_statusbar/2_statusbar_health/green/0.png",
      "assets/img/7_statusbars/1_statusbar/2_statusbar_health/green/20.png",
      "assets/img/7_statusbars/1_statusbar/2_statusbar_health/green/40.png",
      "assets/img/7_statusbars/1_statusbar/2_statusbar_health/green/60.png",
      "assets/img/7_statusbars/1_statusbar/2_statusbar_health/green/80.png",
      "assets/img/7_statusbars/1_statusbar/2_statusbar_health/green/100.png",
    ],
    percentage: 100,
    y: 0,
  },
  bottles: {
    images: [
      "assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/green/0.png",
      "assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/green/20.png",
      "assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/green/40.png",
      "assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/green/60.png",
      "assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/green/80.png",
      "assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/green/100.png",
    ],
    percentage: 0,
    y: 40,
  },
  coins: {
    images: [
      "assets/img/7_statusbars/1_statusbar/1_statusbar_coin/green/0.png",
      "assets/img/7_statusbars/1_statusbar/1_statusbar_coin/green/20.png",
      "assets/img/7_statusbars/1_statusbar/1_statusbar_coin/green/40.png",
      "assets/img/7_statusbars/1_statusbar/1_statusbar_coin/green/60.png",
      "assets/img/7_statusbars/1_statusbar/1_statusbar_coin/green/80.png",
      "assets/img/7_statusbars/1_statusbar/1_statusbar_coin/green/100.png",
    ],
    percentage: 0,
    y: 80,
  },
  endboss: {
    images: [
      "assets/img/7_statusbars/2_statusbar_endboss/green/green0.png",
      "assets/img/7_statusbars/2_statusbar_endboss/green/green20.png",
      "assets/img/7_statusbars/2_statusbar_endboss/green/green40.png",
      "assets/img/7_statusbars/2_statusbar_endboss/green/green60.png",
      "assets/img/7_statusbars/2_statusbar_endboss/green/green80.png",
      "assets/img/7_statusbars/2_statusbar_endboss/green/green100.png",
    ],
    percentage: 100,
    x: 490,
    y: 0,
  },
};

/**
 * Main game world tying together all objects and rendering.
 */
class World {
  character = new Character();
  level;
  canvas;
  ctx;
  keyboard;
  camera_x = 0;

  nextCloudSpawnX = 0;

  statusBarHealth = new StatusBar(STATUS_BAR_CONFIGS.health);
  statusBarBottles = new StatusBar(STATUS_BAR_CONFIGS.bottles);
  statusBarCoins = new StatusBar(STATUS_BAR_CONFIGS.coins);
  statusBarEndboss = new StatusBar(STATUS_BAR_CONFIGS.endboss);

  throwableObjects = [];

  lastCameraX = 0;

  throwCooldownMs = 500;
  lastThrowTime = 0;

  collectedBottles = 0;
  maxBottles = 5;

  collectedCoins = 0;
  maxCoins = 5;

  endboss = null;

  gameLoopIntervalId = null;
  chickenSpawnerId = null;
  cloudSpawnerId = null;

  gameOverTriggered = false;
  onGameOver = null;

  interactions;
  renderer;

  /**
   * Creates the game world.
   * @param {HTMLCanvasElement} canvas - Canvas to render on.
   * @param {Keyboard} keyboard - Input keyboard instance.
   */
  constructor(canvas, keyboard, level = level1) {
    this.ctx = canvas.getContext("2d");
    this.canvas = canvas;
    this.keyboard = keyboard;

    this.level = this.cloneLevel(level);
    this.endboss =
      this.level?.enemies?.find((enemy) => enemy instanceof Endboss) ?? null;

    this.interactions = new WorldInteractions(this);
    this.renderer = new WorldRenderer(this.ctx, this);

    this.setWorld();
    this.renderer.start();
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
    }, 1500);
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
    this.assignWorldToEnemies();
    this.assignWorldToCollectables();
    this.totalBottles = this.level.collectableObjects.length;
  }

  /**
   * Links each enemy in the level to this world instance.
   * @returns {void}
   */
  assignWorldToEnemies() {
    for (const enemy of this.level.enemies) {
      this.registerEnemy(enemy);
    }
  }

  /**
   * Assigns the world reference to all collectable items in the level.
   * @returns {void}
   */
  assignWorldToCollectables() {
    this.assignWorldToObjects(this.level.collectableObjects);
    this.assignWorldToObjects(this.level.coinObjects);
  }

  /**
   * Attaches the current world instance to each provided object.
   * @param {DrawableObject[]} objects - Objects that should know the world.
   * @returns {void}
   */
  assignWorldToObjects(objects) {
    for (const obj of objects) {
      obj.world = this;
    }
  }

  /**
   * Periodically removes off-screen clouds and spawns new ones to the right.
   * @returns {void}
   */
  startCloudSpawner() {
    this.nextCloudSpawnX = 0;
    this.fillInitialClouds();
    this.beginCloudSpawnerInterval();
  }

  /**
   * Populates the level with a baseline number of clouds.
   * @returns {void}
   */
  fillInitialClouds() {
    for (let i = 0; i < 6; i++) {
      this.spawnCloud();
    }
  }

  /**
   * Starts an interval that keeps the cloud queue filled while cleaning old ones.
   * @returns {void}
   */
  beginCloudSpawnerInterval() {
    this.stopCloudSpawner();
    this.cloudSpawnerId = setInterval(() => {
      this.level.clouds = this.level.clouds.filter((cloud) =>
        this.isCloudVisible(cloud)
      );
      this.spawnCloud();
    }, 60000);
  }

  /**
   * Determines whether a cloud is still within the visible area.
   * @param {Cloud} cloud - Cloud to check.
   * @returns {boolean}
   */
  isCloudVisible(cloud) {
    return cloud.x + cloud.width >= 0;
  }

  /**
   * Creates a new cloud at the current spawn offset and advances the offset.
   * @returns {void}
   */
  spawnCloud() {
    const cloud = new Cloud(this.nextCloudSpawnX);
    this.level.clouds.push(cloud);
    this.nextCloudSpawnX += cloud.width;
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
    this.gameLoopIntervalId = setInterval(() => this.gameLoopStep(), 100);
  }

  /**
   * Executes one cycle of collision checks and game state updates.
   * @returns {void}
   */
  gameLoopStep() {
    this.interactions.handleGameLoopStep();
  }

  /**
   * Triggers game over when the character has died.
   * @returns {void}
   */
  finishGameIfDead() {
    if (!this.gameOverTriggered && this.character.isDead()) {
      this.triggerGameOver("loss");
    }
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
   * Stops all running timers and disables control without triggering game over.
   * @returns {void}
   */
  destroy() {
    this.stopGameLoop();
    this.stopChickenSpawner();
    this.stopCloudSpawner();
    this.disablePlayerControl();
    this.gameOverTriggered = true;
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

  cloneLevel(level) {
    if (!level) return level;
    return new Level(
      [...(level.enemies ?? [])],
      [...(level.clouds ?? [])],
      [...(level.backgroundObjects ?? [])],
      [...(level.collectableObjects ?? [])],
      [...(level.coinObjects ?? [])]
    );
  }
}
