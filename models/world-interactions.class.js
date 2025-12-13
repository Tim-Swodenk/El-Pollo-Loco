/**
 * Handles collision detection and game interactions for the world.
 */
class WorldInteractions {
  /**
   * @param {World} world - World instance to operate on.
   */
  constructor(world) {
    this.world = world;
  }

  /**
   * Executes all interaction steps needed for a game loop tick.
   * @returns {void}
   */
  handleGameLoopStep() {
    this.handleStompCollisions();
    this.handleCharacterEnemyCollisions();
    this.handleBottlePickups();
    this.handleCoinPickups();
    this.handleBottleThrows();
    this.handleRegularEnemyBottleHits();
    this.handleEndbossBottleHits();
    this.world.finishGameIfDead();
  }

  /**
   * Handles throwing bottles when the D key is pressed.
   * @returns {void}
   */
  handleBottleThrows() {
    if (!this.canThrowBottle()) return;
    const bottle = this.createThrowableBottle();
    this.world.throwableObjects.push(bottle);
    this.onBottleThrown();
  }

  /**
   * Determines whether the player can throw a bottle based on input and cooldowns.
   * @returns {boolean}
   */
  canThrowBottle() {
    if (!this.world.keyboard.D || this.world.collectedBottles <= 0) return false;
    const now = Date.now();
    if (now - this.world.lastThrowTime < this.world.throwCooldownMs) return false;
    this.world.lastThrowTime = now;
    return true;
  }

  /**
   * Creates a throwable bottle at the character's current position.
   * @returns {ThrowableObject}
   */
  createThrowableBottle() {
    const bottle = new ThrowableObject(
      this.world.character.x,
      this.world.character.y + 200
    );
    bottle.world = this.world;
    return bottle;
  }

  /**
   * Updates state after a bottle has been thrown and reduces inventory.
   * @returns {void}
   */
  onBottleThrown() {
    this.world.collectedBottles--;
    const perc = (this.world.collectedBottles / this.world.maxBottles) * 100;
    this.world.statusBarBottles.setPercentage(perc);
  }

  /**
   * Checks collisions between the character and other objects.
   * @returns {void}
   */
  handleCharacterEnemyCollisions() {
    for (const enemy of this.world.level.enemies) {
      if (
        enemy.dead ||
        !this.world.character.isColliding(enemy) ||
        MovableObject.isTopBottomCollision(this.world.character, enemy) ||
        this.world.character.isHurt()
      ) {
        continue;
      }
      this.world.character.hit();
      this.world.statusBarHealth.setPercentage(this.world.character.energy);
    }
  }

  /**
   * Detects and resolves collisions when the character stomps chickens.
   * @returns {void}
   */
  handleStompCollisions() {
    for (const enemy of this.world.level.enemies) {
      if (!(enemy instanceof Chicken || enemy instanceof SmallChicken)) continue;
      if (enemy.dead) continue;

      if (MovableObject.isTopBottomCollision(this.world.character, enemy)) {
        enemy.die();
      }
    }
  }

  /**
   * Handles collisions between the character and collectible bottles.
   * @returns {void}
   */
  handleBottlePickups() {
    for (const obj of this.world.level.collectableObjects) {
      if (
        this.world.character.isColliding(obj) &&
        this.world.collectedBottles < this.world.maxBottles
      ) {
        obj.collect();
        this.world.collectedBottles++;
        playSoundEffect("itemPickup");
        const perc = (this.world.collectedBottles / this.world.maxBottles) * 100;
        this.world.statusBarBottles.setPercentage(perc);
      }
    }
  }

  /**
   * Handles collisions between the character and collectible coins.
   * @returns {void}
   */
  handleCoinPickups() {
    for (const obj of this.world.level.coinObjects) {
      if (!this.world.character.isColliding(obj)) continue;
      this.collectCoin(obj);
    }
  }

  /**
   * Handles collection logic for a single coin.
   * @param {CollectableCoin} obj - Coin that was collected.
   * @returns {void}
   */
  collectCoin(obj) {
    obj.collect();
    this.world.collectedCoins++;
    playSoundEffect("itemPickup");
    this.updateCoinStatusBar();
    if (this.world.collectedCoins !== this.world.maxCoins) return;
    this.handleFullCoinStack();
  }

  /**
   * Refreshes the coin status bar based on collected coins.
   * @returns {void}
   */
  updateCoinStatusBar() {
    const perc = (this.world.collectedCoins / this.world.maxCoins) * 100;
    this.world.statusBarCoins.setPercentage(perc);
  }

  /**
   * Applies effects when the player reaches the maximum coin count.
   * @returns {void}
   */
  handleFullCoinStack() {
    this.world.character.heal(20);
    this.world.statusBarHealth.setPercentage(this.world.character.energy);
    this.world.collectedCoins = 0;
    this.world.statusBarCoins.setPercentage(0);
  }

  /**
   * Checks collisions between thrown bottles and the endboss.
   * @returns {void}
   */
  handleEndbossBottleHits() {
    const endboss = this.world.level.enemies.find((e) => e instanceof Endboss);
    if (!endboss || endboss.dead) return;
    for (const bottle of this.world.throwableObjects) {
      if (this.shouldSkipBottle(bottle, endboss)) continue;
      this.processEndbossHit(bottle, endboss);
    }
  }

  /**
   * Skips processing if the bottle already splashed or misses the target.
   * @param {ThrowableObject} bottle - Bottle being evaluated.
   * @param {MovableObject} target - Target to test collision against.
   * @returns {boolean}
   */
  shouldSkipBottle(bottle, target) {
    return bottle.hasSplashed || !bottle.isColliding(target);
  }

  /**
   * Handles state updates when a bottle hits the endboss.
   * @param {ThrowableObject} bottle - Bottle that struck the endboss.
   * @param {Endboss} endboss - Boss being damaged.
   * @returns {void}
   */
  processEndbossHit(bottle, endboss) {
    this.handleBottleImpact(bottle);
    endboss.hit();
    this.world.statusBarEndboss.setPercentage(endboss.energy);
    if (!this.world.gameOverTriggered && endboss.energy <= 0) {
      this.world.triggerGameOver("win");
    }
  }

  /**
   * Checks collisions between thrown bottles and regular enemies (chickens).
   * @returns {void}
   */
  handleRegularEnemyBottleHits() {
    for (const bottle of this.world.throwableObjects) {
      if (bottle.hasSplashed) continue;
      this.handleBottleVsChicken(bottle);
    }
  }

  /**
   * Processes a bottle against all chickens until a hit occurs.
   * @param {ThrowableObject} bottle - Active bottle instance.
   * @returns {void}
   */
  handleBottleVsChicken(bottle) {
    for (const enemy of this.world.level.enemies) {
      if (!this.isBottleHittingChicken(bottle, enemy)) continue;
      this.handleBottleImpact(bottle);
      enemy.die();
      break;
    }
  }

  /**
   * Checks if a bottle collides with a live chicken enemy.
   * @param {ThrowableObject} bottle - Bottle to test.
   * @param {MovableObject} enemy - Enemy candidate.
   * @returns {boolean}
   */
  isBottleHittingChicken(bottle, enemy) {
    if (enemy.dead) return false;
    const isChicken = enemy instanceof Chicken || enemy instanceof SmallChicken;
    return isChicken && bottle.isColliding(enemy);
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
}
