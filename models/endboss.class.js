/**
 * Endboss – the final enemy encountered at the end of the level.
 * @extends MovableObject
 */
class Endboss extends MovableObject {
  //base stats & size
  height = 400;
  width = 250;
  y = 60;
  energy = 100;
  speed = 15;

  //animation + behavior
  animationMs = 200;
  animationIntervalId = null;
  behaviorInterval = null;
  visibilityCheckId = null;

  //state flags
  currentState = "wait";
  isPlayingSequence = false;
  isJumpAttackActive = false;
  activated = false;
  hurtOverlayUntil = 0;

  //movement control
  _moveId = 0;
  walkForwardDistance = 300;
  walkBackwardDistance = 300;
  attackDistance = 20;
  jumpAttackDistance = 300;

  SEQUENCES = [
    ["alert", "jumpAttack", "walkBackward"],
    ["walkForward", "alert", "walkBackward"],
    ["alert", "walkForward", "walkBackward"],
    ["walkForward", "alert", "attack", "walkBackward"],
  ];

  ACTION_DELAYS = {
    walkForward: 1000,
    walkBackward: 1000,
    alert: 500,
    attack: 800,
    jumpAttack: 800,
    wait: 1000,
  };

  IMAGES_WAIT = [
    "assets/img/4_enemie_boss_chicken/2_alert/G5.png",
    "assets/img/4_enemie_boss_chicken/2_alert/G6.png",
    "assets/img/4_enemie_boss_chicken/2_alert/G7.png",
  ];
  IMAGES_WALK = [
    "assets/img/4_enemie_boss_chicken/1_walk/G1.png",
    "assets/img/4_enemie_boss_chicken/1_walk/G2.png",
    "assets/img/4_enemie_boss_chicken/1_walk/G3.png",
    "assets/img/4_enemie_boss_chicken/1_walk/G4.png",
  ];
  IMAGES_ALERT = [
    "assets/img/4_enemie_boss_chicken/2_alert/G5.png",
    "assets/img/4_enemie_boss_chicken/2_alert/G6.png",
    "assets/img/4_enemie_boss_chicken/2_alert/G7.png",
    "assets/img/4_enemie_boss_chicken/2_alert/G8.png",
    "assets/img/4_enemie_boss_chicken/2_alert/G9.png",
    "assets/img/4_enemie_boss_chicken/2_alert/G10.png",
    "assets/img/4_enemie_boss_chicken/2_alert/G11.png",
    "assets/img/4_enemie_boss_chicken/2_alert/G12.png",
  ];
  IMAGES_ATTACK = [
    "assets/img/4_enemie_boss_chicken/3_attack/G13.png",
    "assets/img/4_enemie_boss_chicken/3_attack/G14.png",
    "assets/img/4_enemie_boss_chicken/3_attack/G15.png",
    "assets/img/4_enemie_boss_chicken/3_attack/G16.png",
    "assets/img/4_enemie_boss_chicken/3_attack/G17.png",
    "assets/img/4_enemie_boss_chicken/3_attack/G18.png",
    "assets/img/4_enemie_boss_chicken/3_attack/G19.png",
    "assets/img/4_enemie_boss_chicken/3_attack/G20.png",
  ];
  IMAGES_JUMPATTACK = [
    "assets/img/4_enemie_boss_chicken/3_attack/G17.png",
    "assets/img/4_enemie_boss_chicken/3_attack/G18.png",
    "assets/img/4_enemie_boss_chicken/3_attack/G19.png",
  ];
  IMAGES_HURT = [
    "assets/img/4_enemie_boss_chicken/4_hurt/G21.png",
    "assets/img/4_enemie_boss_chicken/4_hurt/G22.png",
    "assets/img/4_enemie_boss_chicken/4_hurt/G23.png",
  ];
  IMAGES_DEAD = [
    "assets/img/4_enemie_boss_chicken/5_dead/G24.png",
    "assets/img/4_enemie_boss_chicken/5_dead/G25.png",
    "assets/img/4_enemie_boss_chicken/5_dead/G26.png",
  ];

  constructor() {
    super();
    this.loadAllImages();
    this.configureStartState();
    this.applyGravity();
    this.activateWhenVisible(80);
  }

  loadAllImages() {
    this.loadImage(this.IMAGES_ALERT[0]);
    for (const group of this.getImageGroups()) {
      this.loadImages(group);
    }
  }

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

  configureStartState() {
    this.x = 2550;
    this.spawnX = this.x;
    this.offset = { top: 80, right: 5, bottom: 5, left: 25 };
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
   * Activate once the boss is visible in the viewport.
   * @param {number} [buffer=0] - Extra pixels around the viewport.
   * @returns {void}
   */
  activateWhenVisible(buffer = 0) {
    if (this.isOnScreen(this.world, buffer)) {
      this.activate();
      return;
    }
    this.visibilityCheckId = setInterval(() => {
      if (this.world && this.isOnScreen(this.world, buffer)) {
        clearInterval(this.visibilityCheckId);
        this.visibilityCheckId = null;
        this.activate();
      }
    }, 120);
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
   * Starts animation and AI once activated.
   * @returns {void}
   */
  activate() {
    if (this.activated) return;
    this.activated = true;
    this.animate();
    this.startRandomBehavior();
  }

  /**
   * Animation loop based on current state.
   * @returns {void}
   */
  animate() {
    this.startAnimationTimer();
  }

  startAnimationTimer() {
    if (this.animationIntervalId) clearInterval(this.animationIntervalId);
    this.animationIntervalId = setInterval(
      () => this.performAnimationStep(),
      this.animationMs
    );
  }

  performAnimationStep() {
    if (performance.now() < this.hurtOverlayUntil) {
      this.playAnimation(this.IMAGES_HURT);
      return;
    }
    this.playAnimation(this.getImagesForState(this.currentState));
  }

  getImagesForState(state) {
    const map = {
      walkForward: this.IMAGES_WALK,
      walkBackward: this.IMAGES_WALK,
      return: this.IMAGES_WALK,
      wait: this.IMAGES_WAIT,
      alert: this.IMAGES_ALERT,
      attack: this.IMAGES_ATTACK,
      jumpAttack: this.IMAGES_JUMPATTACK,
      dead: this.IMAGES_DEAD,
    };
    return map[state] || this.IMAGES_WAIT;
  }

  /**
   * Plays a list of actions one after another.
   * @param {string[]} sequence - Action names.
   * @returns {Promise<void>}
   */
  async playSequence(sequence) {
    for (const name of sequence) {
      if (this.shouldStopSequence()) break;
      await this.runSequenceAction(name);
    }
    this.finishSequenceIfAlive();
  }

  shouldStopSequence() {
    return this.currentState === "dead" || this.dead;
  }

  async runSequenceAction(name) {
    const action = this[name];
    if (typeof action !== "function") return;
    const result = action.call(this);
    if (result instanceof Promise) {
      await result;
      return;
    }
    await this.sleep(this.ACTION_DELAYS[name] ?? 1000);
  }

  finishSequenceIfAlive() {
    if (this.dead || this.currentState === "dead") return;
    this.currentState = "wait";
    this.playAnimation(this.IMAGES_WAIT);
  }

  /**
   * Periodically picks and plays a random behavior sequence.
   * @returns {void}
   */
  startRandomBehavior() {
    this.behaviorInterval = setInterval(async () => {
      if (this.isPlayingSequence || this.dead) return;

      const seq = this.SEQUENCES[(Math.random() * this.SEQUENCES.length) | 0];

      this.isPlayingSequence = true;
      await this.playSequence(seq);
      this.isPlayingSequence = false;
    }, 1000);
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
      const start = performance.now(), startX = this.x, id = ++this._moveId;
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

  shouldContinueMove(id) {
    return id === this._moveId && !this.dead;
  }

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

  prepareAttackState() {
    this.currentState = "attack";
    this.currentImage = 0;
  }

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

  updateAttackDuringMove(context, progress) {
    if (!context.apex && this.y > context.lastY) {
      this.setImage(this.IMAGES_ATTACK[5]);
      context.apex = true;
    }
    context.lastY = this.y;
    if (progress > 0.85) this.setImage(this.IMAGES_ATTACK[6]);
  }

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
    await this.moveXOverTime(
      -this.jumpAttackDistance,
      duration,
      (p) => this.updateJumpAttackDuringMove(context, p)
    );
    this.endJumpAttack();
  }

  beginJumpAttack() {
    this.isJumpAttackActive = true;
    this.currentState = "jumpAttack";
    this.setImage(this.IMAGES_JUMPATTACK[0]);
    this.jump();
  }

  updateJumpAttackDuringMove(context, progress) {
    if (!context.apex && this.y > context.lastY) {
      this.setImage(this.IMAGES_JUMPATTACK[1]);
      context.apex = true;
    }
    context.lastY = this.y;
    if (progress > 0.85) this.setImage(this.IMAGES_JUMPATTACK[2]);
  }

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
  }

  /**
   * Death sequence and cleanup.
   * @returns {void}
   */
  die() {
    this.hurtOverlayUntil = 0;
    this.isJumpAttackActive = false;
    this.cancelMove();
    this.stopBehaviorTimers();
    this.enterDeathState();
    this.scheduleDeathCleanup();
  }

  stopBehaviorTimers() {
    if (this.behaviorInterval) clearInterval(this.behaviorInterval);
    if (this.visibilityCheckId) {
      clearInterval(this.visibilityCheckId);
      this.visibilityCheckId = null;
    }
  }

  enterDeathState() {
    this.currentState = "dead";
    this.currentImage = 0;
  }

  scheduleDeathCleanup() {
    const delay = this.IMAGES_DEAD.length * this.animationMs;
    setTimeout(() => this.finishDeath(), delay);
  }

  finishDeath() {
    if (this.animationIntervalId) clearInterval(this.animationIntervalId);
    this.dead = true;
    this.removeFromWorld();
  }

  removeFromWorld() {
    const enemies = this.world?.level?.enemies;
    if (!enemies) return;
    const index = enemies.indexOf(this);
    if (index > -1) enemies.splice(index, 1);
  }
}
