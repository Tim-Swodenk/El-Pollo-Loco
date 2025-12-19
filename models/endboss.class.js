/**
 * Endboss – the final enemy encountered at the end of the level.
 * @extends MovableObject
 */
class Endboss extends MovableObject {
  //base stats & size
  height = END_BOSS_BASE_STATS.height;
  width = END_BOSS_BASE_STATS.width;
  y = END_BOSS_BASE_STATS.y;
  energy = END_BOSS_BASE_STATS.energy;
  speed = END_BOSS_BASE_STATS.speed;
  spawnX = END_BOSS_BASE_STATS.spawnX;

  //animation + behavior
  animationMs = END_BOSS_BASE_STATS.animationMs;
  enraged = false;

  //state flags
  currentState = "wait";
  isJumpAttackActive = false;
  activated = false;
  hurtOverlayUntil = 0;

  //movement control
  _moveId = 0;
  walkForwardDistance = END_BOSS_BASE_STATS.walkForwardDistance;
  walkBackwardDistance = END_BOSS_BASE_STATS.walkBackwardDistance;
  attackDistance = END_BOSS_BASE_STATS.attackDistance;
  jumpAttackDistance = END_BOSS_BASE_STATS.jumpAttackDistance;

  SEQUENCES = END_BOSS_SEQUENCES;

  ACTION_DELAYS = { ...END_BOSS_ACTION_DELAYS };

  IMAGES_WAIT = END_BOSS_IMAGES.WAIT;
  IMAGES_WALK = END_BOSS_IMAGES.WALK;
  IMAGES_ALERT = END_BOSS_IMAGES.ALERT;
  IMAGES_ATTACK = END_BOSS_IMAGES.ATTACK;
  IMAGES_JUMPATTACK = END_BOSS_IMAGES.JUMPATTACK;
  IMAGES_HURT = END_BOSS_IMAGES.HURT;
  IMAGES_DEAD = END_BOSS_IMAGES.DEAD;

  constructor() {
    super();
    this.animations = new EndbossAnimations(this);
    this.behavior = new EndbossBehavior(this);
    this.loadAllImages();
    this.configureStartState();
    this.applyGravity();
    this.behavior.activateWhenVisible(40);
  }

  /**
   * Loads all sprite sheets for the endboss.
   * @returns {void}
   */
  loadAllImages() {
    this.loadImage(this.IMAGES_ALERT[0]);
    for (const group of this.getImageGroups()) {
      this.loadImages(group);
    }
  }

  /**
   * Provides grouped image arrays for batch preloading.
   * @returns {string[][]}
   */
  getImageGroups() {
    return [
      this.IMAGES_WAIT,
      this.IMAGES_WALK,
      this.IMAGES_ALERT,
      this.IMAGES_ATTACK,
      this.IMAGES_JUMPATTACK,
      this.IMAGES_HURT,
      this.IMAGES_DEAD,
    ];
  }

  /**
   * Configures the initial position and collision offsets.
   * @returns {void}
   */
  configureStartState() {
    this.x = this.spawnX;
    this.offset = { ...END_BOSS_BASE_STATS.offset };
  }

  /**
   * Waits for a given number of milliseconds.
   * @param {number} ms - Milliseconds to wait.
   * @returns {Promise<void>}
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Sets the current sprite from cache.
   * @param {string} path - Image path.
   * @returns {void}
   */
  setImage(path) {
    this.img = this.imageCache[path];
  }

  /**
   * True if vertical position is above ground level.
   * @returns {boolean}
   */
  isAboveGround() {
    return this.y < 60;
  }

  /**
   * Checks if the boss is inside the camera view.
   * @param {World} world - Game world.
   * @param {number} [buffer=0] - Extra pixels around the viewport.
   * @returns {boolean}
   */
  isOnScreen(world, buffer = 0) {
    if (!world || !world.ctx) return false;
    const w = world.ctx.canvas.width;
    const screenX = this.x + (world.camera_x || 0);
    return screenX + this.width > -buffer && screenX < w + buffer;
  }

  /**
   * Moves horizontally over a duration.
   * @param {number} dx - Distance in pixels.
   * @param {number} duration - Move time in ms.
   * @param {(progress:number, elapsed:number)=>void} [onProgress] - Optional callback.
   * @returns {Promise<void>}
   */
  moveXOverTime(dx, duration, onProgress) {
    return new Promise((resolve) => {
      const start = performance.now(),
        startX = this.x,
        id = ++this._moveId;
      const step = (now) => {
        if (!this.shouldContinueMove(id)) return resolve();
        const progress = Math.min((now - start) / duration, 1);
        this.updateMovePosition(startX, dx, progress, onProgress, now - start);
        if (progress < 1) requestAnimationFrame(step);
        else resolve();
      };
      requestAnimationFrame(step);
    });
  }

  /**
   * Ensures stale motion promises end when interrupted or the boss dies.
   * @param {number} id - Movement identifier to compare.
   * @returns {boolean}
   */
  shouldContinueMove(id) {
    return id === this._moveId && !this.dead;
  }

  /**
   * Updates position during animated movement and triggers callbacks.
   * @param {number} startX - Starting x position.
   * @param {number} dx - Distance to travel.
   * @param {number} progress - Progress between 0 and 1.
   * @param {(progress:number, elapsed:number)=>void} [onProgress] - Optional callback.
   * @param {number} elapsed - Milliseconds since start.
   * @returns {void}
   */
  updateMovePosition(startX, dx, progress, onProgress, elapsed) {
    this.x = startX + dx * progress;
    if (onProgress) onProgress(progress, elapsed);
  }

  /**
   * Cancels the current horizontal motion.
   * @returns {void}
   */
  cancelMove() {
    this._moveId++;
  }

  /**
   * Idles for a while.
   * @param {number} [ms=this.ACTION_DELAYS.wait] - Duration in ms.
   * @returns {Promise<void>}
   */
  wait(ms = this.ACTION_DELAYS.wait) {
    this.currentState = "wait";
    this.playAnimation(this.IMAGES_WAIT);
    return this.sleep(ms);
  }

  /**
   * Walks toward the player.
   * @returns {Promise<void>}
   */
  walkForward() {
    this.currentState = "walkForward";
    this.playAnimation(this.IMAGES_WALK);
    return this.moveXOverTime(
      -this.walkForwardDistance,
      this.ACTION_DELAYS.walkForward
    );
  }

  /**
   * Walks away from the player.
   * @returns {Promise<void>}
   */
  walkBackward() {
    this.currentState = "walkBackward";
    this.playAnimation(this.IMAGES_WALK);
    return this.moveXOverTime(
      this.walkBackwardDistance,
      this.ACTION_DELAYS.walkBackward
    );
  }

  /**
   * Plays the alert animation.
   * @returns {void}
   */
  alert() {
    this.currentState = "alert";
    this.playAnimation(this.IMAGES_ALERT);
  }

  /**
   * Short hop attack at close range.
   * @returns {Promise<void>}
   */
  attack() {
    if (this.dead || this.currentState === "dead") return;
    this.prepareAttackState();
    const context = { apex: false, lastY: this.y };
    const motion = this.getAttackMotion();
    return this.moveXOverTime(motion.dx, motion.duration, (p) =>
      this.updateAttackDuringMove(context, p)
    ).then(() => this.finishAttackState());
  }

  /**
   * Sets up state before an attack begins.
   * @returns {void}
   */
  prepareAttackState() {
    this.currentState = "attack";
    this.currentImage = 0;
  }

  /**
   * Computes attack direction and duration based on character position.
   * @returns {{dx:number,duration:number}}
   */
  getAttackMotion() {
    const character = this.world?.character;
    const bossCenter = this.x + this.width * 0.5;
    const charCenter = character
      ? character.x + character.width * 0.5
      : bossCenter + 1;
    const dir = charCenter >= bossCenter ? 1 : -1;
    this.setImage(this.IMAGES_ATTACK[4]);
    this.speedY = Math.max(this.speedY, 18);
    return {
      dx: dir * this.attackDistance,
      duration: this.ACTION_DELAYS.attack,
    };
  }

  /**
   * Adjusts attack frames during horizontal movement.
   * @param {{apex:boolean,lastY:number}} context - Tracks attack progress state.
   * @param {number} progress - Current interpolation progress.
   * @returns {void}
   */
  updateAttackDuringMove(context, progress) {
    if (!context.apex && this.y > context.lastY) {
      this.setImage(this.IMAGES_ATTACK[5]);
      context.apex = true;
    }
    context.lastY = this.y;
    if (progress > 0.85) this.setImage(this.IMAGES_ATTACK[6]);
  }

  /**
   * Resets state after completing an attack movement.
   * @returns {void}
   */
  finishAttackState() {
    if (this.dead) return;
    this.currentState = "wait";
    this.playAnimation(this.IMAGES_WAIT);
  }

  /**
   * Long jump attack that covers distance.
   * @returns {Promise<void>}
   */
  async jumpAttack() {
    if (this.isJumpAttackActive) return;
    this.beginJumpAttack();
    const context = { apex: false, lastY: this.y };
    const duration = this.ACTION_DELAYS.jumpAttack;
    await this.moveXOverTime(-this.jumpAttackDistance, duration, (p) =>
      this.updateJumpAttackDuringMove(context, p)
    );
    this.endJumpAttack();
  }

  /**
   * Prepares and launches a jump attack.
   * @returns {void}
   */
  beginJumpAttack() {
    this.isJumpAttackActive = true;
    this.currentState = "jumpAttack";
    this.setImage(this.IMAGES_JUMPATTACK[0]);
    this.jump();
  }

  /**
   * Updates animation frames during the jump attack travel.
   * @param {{apex:boolean,lastY:number}} context - Jump tracking data.
   * @param {number} progress - Movement progress.
   * @returns {void}
   */
  updateJumpAttackDuringMove(context, progress) {
    if (!context.apex && this.y > context.lastY) {
      this.setImage(this.IMAGES_JUMPATTACK[1]);
      context.apex = true;
    }
    context.lastY = this.y;
    if (progress > 0.85) this.setImage(this.IMAGES_JUMPATTACK[2]);
  }

  /**
   * Restores defaults after finishing a jump attack.
   * @returns {void}
   */
  endJumpAttack() {
    this.isJumpAttackActive = false;
    if (this.currentState === "dead" || this.dead) return;
    this.currentState = "wait";
    this.playAnimation(this.IMAGES_WAIT);
  }

  /**
   * Applies damage to the boss.
   * @param {number} [damage=20] - Damage value.
   * @returns {void}
   */
  hit(damage = 20) {
    super.hit(damage);
    if (this.energy <= 0) {
      this.die();
      return;
    }
    this.hurtOverlayUntil =
      performance.now() + this.IMAGES_HURT.length * this.animationMs;
    this.enrageIfBelowHalfHealth();
  }

  /**
   * Increases speed and aggressiveness when health drops below half.
   * @returns {void}
   */
  enrageIfBelowHalfHealth() {
    if (this.enraged || this.energy > 50) return;

    this.enraged = true;
    this.speed += 5;
    this.animationMs = 150;
    Object.assign(this.ACTION_DELAYS, {
      walkForward: 750,
      walkBackward: 750,
      alert: 300,
      attack: 650,
      jumpAttack: 650,
      wait: 600,
    });

    this.animations.startAnimationTimer();
  }

  /**
   * Death sequence and cleanup.
   * @returns {void}
   */
  die() {
    this.hurtOverlayUntil = 0;
    this.isJumpAttackActive = false;
    this.cancelMove();
    this.behavior.stopAll();
    this.enterDeathState();
    this.scheduleDeathCleanup();
  }

  /**
   * Configures the boss for the death animation sequence.
   * @returns {void}
   */
  enterDeathState() {
    this.currentState = "dead";
    this.currentImage = 0;
  }

  /**
   * Schedules cleanup after the death animation has finished.
   * @returns {void}
   */
  scheduleDeathCleanup() {
    const delay = this.IMAGES_DEAD.length * this.animationMs;
    setTimeout(() => this.finishDeath(), delay);
  }

  /**
   * Finalizes death by stopping animations and removing the boss.
   * @returns {void}
   */
  finishDeath() {
    this.animations.stop();
    this.dead = true;
    this.removeFromWorld();
  }

  /**
   * Removes the boss instance from the world's enemy list.
   * @returns {void}
   */
  removeFromWorld() {
    const enemies = this.world?.level?.enemies;
    if (!enemies) return;
    const index = enemies.indexOf(this);
    if (index > -1) enemies.splice(index, 1);
  }
}
