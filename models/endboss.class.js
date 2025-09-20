/**
 * Endboss – finaler Gegner am Levelende.
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
  sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }
  setImage(path) {
    this.img = this.imageCache[path];
  }
  isAboveGround() {
    return this.y < 60;
  }

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

  isOnScreen(world, buffer = 0) {
    if (!world || !world.ctx) return false;
    let w = world.ctx.canvas.width;
    let screenX = this.x + (world.camera_x || 0); // ggf. Vorzeichen anpassen
    return screenX + this.width > -buffer && screenX < w + buffer;
  }

  activate() {
    if (this.activated) return;
    this.activated = true;
    this.animate();
    this.startRandomBehavior();
  }

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

  startRandomBehavior() {
    this.behaviorInterval = setInterval(async () => {
      if (this.isPlayingSequence || this.dead) return;
      let seq =
        this.SEQUENCES[Math.floor(Math.random() * this.SEQUENCES.length)];
      this.isPlayingSequence = true;
      console.log(seq);

      await this.playSequence(seq);
      this.isPlayingSequence = false;
    }, 1000);
  }

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

  cancelMove() {
    this._moveId++;
  }

  // --- states/actions ---
  wait(ms = this.ACTION_DELAYS.wait) {
    this.currentState = "wait";
    this.playAnimation(this.IMAGES_WAIT);
    return this.sleep(ms);
  }

  walkForward() {
    this.currentState = "walkForward";
    this.playAnimation(this.IMAGES_WALK);
    return this.moveXOverTime(
      -this.walkForwardDistance,
      this.ACTION_DELAYS.walkForward
    );
  }

  walkBackward() {
    this.currentState = "walkBackward";
    this.playAnimation(this.IMAGES_WALK);
    return this.moveXOverTime(
      this.walkBackwardDistance,
      this.ACTION_DELAYS.walkBackward
    );
  }

  alert() {
    this.currentState = "alert";
    this.playAnimation(this.IMAGES_ALERT);
  }

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

  hit(damage = 20) {
    super.hit(damage);
    if (this.energy <= 0) return this.die();
    this.hurtOverlayUntil =
      performance.now() + this.IMAGES_HURT.length * this.animationIntervalMs;
  }

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
