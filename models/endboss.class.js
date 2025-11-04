/**
 * Endboss – the final enemy encountered at the end of the level.
 * @extends MovableObject
 */
class Endboss extends MovableObject {
  height = 400;
  width = 250;
  y = 60;
  energy = 100;
  speed = 15;

  animationIntervalMs = 200;
  animationIntervalId;

  isPlayingSequence = false;
  behaviorInterval;
  isJumpAttackActive = false;
  hurtOverlayUntil = 0;
  activated = false;
  visibilityCheckId = null;

  currentState = "wait";

  SEQUENCES = [
    ["alert", "jumpAttack", "walkBackward"],
    ["walkForward", "alert", "walkBackward"],
    ["alert", "walkForward", "walkBackward"],
    ["walkForward", "alert", "attack", "walkBackward"],
  ];

  walkForwardDistance = 300;
  walkBackwardDistance = 300;
  attackDistance = 20;
  jumpAttackDistance = 300;

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
    this.loadImage(this.IMAGES_ALERT[0]);
    this.loadImages(this.IMAGES_WAIT);
    this.loadImages(this.IMAGES_WALK);
    this.loadImages(this.IMAGES_ALERT);
    this.loadImages(this.IMAGES_ATTACK);
    this.loadImages(this.IMAGES_JUMPATTACK);
    this.loadImages(this.IMAGES_HURT);
    this.loadImages(this.IMAGES_DEAD);
    this.x = 2550;
    this.spawnX = this.x;
    this._moveId = 0;
    this.offset = { top: 80, right: 5, bottom: 5, left: 25 };
    this.applyGravity();
    this.activateWhenVisible(80);
  }

  // --- helpers ---
  /**
   * Delays execution for the specified time.
   * @param {number} ms - Milliseconds to wait.
   * @returns {Promise<void>} Resolves after the timeout.
   */
  sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }
  /**
   * Updates the current sprite image from the cache.
   * @param {string} path - Image path to load from the cache.
   * @returns {void}
   */
  setImage(path) {
    this.img = this.imageCache[path];
  }
  /**
   * Checks whether the boss is above ground level.
   * @returns {boolean} True if the vertical position is above the ground threshold.
   */
  isAboveGround() {
    return this.y < 60;
  }

  /**
   * Activates the boss once it becomes visible on screen.
   * @param {number} [buffer=0] - Additional buffer around the viewport.
   * @returns {void}
   */
  activateWhenVisible(buffer = 0) {
    if (this.isOnScreen(this.world, buffer)) return this.activate();
    this.visibilityCheckId = setInterval(() => {
      if (this.world && this.isOnScreen(this.world, buffer)) {
        clearInterval(this.visibilityCheckId);
        this.visibilityCheckId = null;
        this.activate();
      }
    }, 120);
  }

  /**
   * Determines whether the boss is inside the current viewport.
   * @param {World} world - The game world instance.
   * @param {number} [buffer=0] - Additional buffer around the viewport.
   * @returns {boolean} True if visible within the viewport.
   */
  isOnScreen(world, buffer = 0) {
    if (!world || !world.ctx) return false;
    let w = world.ctx.canvas.width;
    let screenX = this.x + (world.camera_x || 0);
    return screenX + this.width > -buffer && screenX < w + buffer;
  }

  /**
   * Starts animations and behavior once activated.
   * @returns {void}
   */
  activate() {
    if (this.activated) return;
    this.activated = true;
    this.animate();
    this.startRandomBehavior();
  }

  /**
   * Starts the animation loop based on the current state.
   * @returns {void}
   */
  animate() {
    this.animationIntervalId = setInterval(() => {
      if (performance.now() < this.hurtOverlayUntil) {
        this.playAnimation(this.IMAGES_HURT);
        return;
      }
      if (
        this.currentState === "walkForward" ||
        this.currentState === "walkBackward" ||
        this.currentState === "return"
      ) {
        this.playAnimation(this.IMAGES_WALK);
      } else if (this.currentState === "wait")
        this.playAnimation(this.IMAGES_WAIT);
      else if (this.currentState === "alert")
        this.playAnimation(this.IMAGES_ALERT);
      else if (this.currentState === "attack")
        this.playAnimation(this.IMAGES_ATTACK);
      else if (this.currentState === "jumpAttack")
        this.playAnimation(this.IMAGES_JUMPATTACK);
      else if (this.currentState === "dead")
        this.playAnimation(this.IMAGES_DEAD);
    }, this.animationIntervalMs);
  }

  /**
   * Plays a sequence of actions sequentially.
   * @param {string[]} sequence - Array of method names describing actions.
   * @returns {Promise<void>} Resolves once the sequence completes.
   */
  async playSequence(sequence) {
    for (let a of sequence) {
      if (this.currentState === "dead" || this.dead) break;
      if (typeof this[a] !== "function") continue;
      let out = this[a]();
      if (out instanceof Promise) await out;
      else await this.sleep(this.ACTION_DELAYS[a] ?? 1000);
    }
    if (this.currentState !== "dead" && !this.dead) {
      this.currentState = "wait";
      this.playAnimation(this.IMAGES_WAIT);
    }
  }

  /**
   * Initiates randomized behavior sequences at a fixed interval.
   * @returns {void}
   */
  startRandomBehavior() {
    this.behaviorInterval = setInterval(async () => {
      if (this.isPlayingSequence || this.dead) return;
      let seq =
        this.SEQUENCES[Math.floor(Math.random() * this.SEQUENCES.length)];
      this.isPlayingSequence = true;

      await this.playSequence(seq);
      this.isPlayingSequence = false;
    }, 1000);
  }

  /**
   * Moves horizontally over time while optionally reporting progress.
   * @param {number} dx - Horizontal distance to travel.
   * @param {number} duration - Duration of the movement in milliseconds.
   * @param {(progress: number, elapsed: number) => void} [onProgress] - Optional progress callback.
   * @returns {Promise<void>} Resolves when the movement ends or is cancelled.
   */
  moveXOverTime(dx, duration, onProgress) {
    return new Promise((resolve) => {
      let start = performance.now(),
        startX = this.x,
        id = ++this._moveId;
      let step = (now) => {
        if (id !== this._moveId || this.dead) return resolve();
        let p = Math.min((now - start) / duration, 1);
        this.x = startX + dx * p;
        if (onProgress) onProgress(p, now - start);
        if (p < 1) requestAnimationFrame(step);
        else resolve();
      };
      requestAnimationFrame(step);
    });
  }

  /**
   * Cancels the current horizontal movement.
   * @returns {void}
   */
  cancelMove() {
    this._moveId++;
  }

  // --- states/actions ---
  /**
   * Enters the waiting state for a specified duration.
   * @param {number} [ms=this.ACTION_DELAYS.wait] - Duration to wait in milliseconds.
   * @returns {Promise<void>} Resolves after waiting.
   */
  wait(ms = this.ACTION_DELAYS.wait) {
    this.currentState = "wait";
    this.playAnimation(this.IMAGES_WAIT);
    return this.sleep(ms);
  }

  /**
   * Walks forward (towards the player) over time.
   * @returns {Promise<void>} Resolves after moving.
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
   * Walks backward away from the player.
   * @returns {Promise<void>} Resolves after moving.
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
   * Switches to the alert animation.
   * @returns {void}
   */
  alert() {
    this.currentState = "alert";
    this.playAnimation(this.IMAGES_ALERT);
  }

  /**
   * Performs a close-range attack on the player.
   * @returns {Promise<void>} Resolves when the attack sequence finishes.
   */
  attack() {
    if (this.dead || this.currentState === "dead") return;
    this.currentState = "attack";
    this.currentImage = 0;
    let c = this.world?.character,
      bc = this.x + this.width * 0.5;
    let cc = c ? c.x + c.width * 0.5 : bc + 1,
      dir = cc >= bc ? 1 : -1;

    this.setImage(this.IMAGES_ATTACK[4]);
    this.speedY = Math.max(this.speedY, 18);
    let dur = this.ACTION_DELAYS.attack,
      dx = dir * this.attackDistance;
    let apex = false,
      lastY = this.y;

    return this.moveXOverTime(dx, dur, (p) => {
      if (!apex && this.y > lastY) {
        this.setImage(this.IMAGES_ATTACK[5]);
        apex = true;
      }
      lastY = this.y;
      if (p > 0.85) this.setImage(this.IMAGES_ATTACK[6]);
    }).then(() => {
      if (!this.dead) {
        this.currentState = "wait";
        this.playAnimation(this.IMAGES_WAIT);
      }
    });
  }

  /**
   * Executes a jumping attack covering a longer distance.
   * @returns {Promise<void>} Resolves after the jump attack ends.
   */
  async jumpAttack() {
    if (this.isJumpAttackActive) return;
    this.isJumpAttackActive = true;
    this.currentState = "jumpAttack";
    let duration = this.ACTION_DELAYS.jumpAttack,
      dx = -this.jumpAttackDistance;
    let apex = false,
      lastY = this.y;
    this.setImage(this.IMAGES_JUMPATTACK[0]);
    this.jump();
    await this.moveXOverTime(dx, duration, (p) => {
      if (!apex && this.y > lastY) {
        this.setImage(this.IMAGES_JUMPATTACK[1]);
        apex = true;
      }
      lastY = this.y;
      if (p > 0.85) this.setImage(this.IMAGES_JUMPATTACK[2]);
    });
    this.isJumpAttackActive = false;
    if (this.currentState === "dead" || this.dead) return;
    this.currentState = "wait";
    this.playAnimation(this.IMAGES_WAIT);
  }

  /**
   * Applies damage to the boss.
   * @param {number} [damage=20] - Amount of damage to apply.
   * @returns {void}
   */
  hit(damage = 20) {
    super.hit(damage);
    if (this.energy <= 0) return this.die();
    this.hurtOverlayUntil =
      performance.now() + this.IMAGES_HURT.length * this.animationIntervalMs;
  }

  /**
   * Handles the boss death sequence and removes it from the level.
   * @returns {void}
   */
  die() {
    this.hurtOverlayUntil = 0;
    this.isJumpAttackActive = false;
    this.cancelMove();
    if (this.behaviorInterval) clearInterval(this.behaviorInterval);
    if (this.visibilityCheckId) {
      clearInterval(this.visibilityCheckId);
      this.visibilityCheckId = null;
    }
    this.currentState = "dead";
    this.currentImage = 0;
    setTimeout(() => {
      if (this.animationIntervalId) clearInterval(this.animationIntervalId);
      this.dead = true;
      if (this.world?.level?.enemies) {
        let i = this.world.level.enemies.indexOf(this);
        if (i > -1) this.world.level.enemies.splice(i, 1);
      }
    }, this.IMAGES_DEAD.length * this.animationIntervalMs);
  }
}
