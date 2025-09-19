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
  isHurt = false;
  isJumpAttackActive = false;
  isMovingHoriz = false;

  currentState = "wait";

  SEQUENCES = [["alert", "jumpAttack", "walkBackward"]];

  walkForwardDistance = 300;
  walkBackwardDistance = 300;
  attackDistance = 100;
  jumpAttackDistance = 300;

  ACTION_DELAYS = {
    walkForward: 2000,
    walkBackward: 2000,
    alert: 1500,
    attack: 2000,
    jumpAttack: 800,
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
    this.x = 500;
    this.offset = { top: 80, right: 5, bottom: 5, left: 25 };
    this.applyGravity();
    this.animate();
    this.startRandomBehavior();
  }

  sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  setImage(path) {
    this.img = this.imageCache[path];
  }

  isAboveGround() {
    return this.y < 60;
  }

  animate() {
    this.animationIntervalId = setInterval(() => {
      if (
        this.currentState === "walkForward" ||
        this.currentState === "walkBackward"
      )
        this.playAnimation(this.IMAGES_WALK);
      else if (this.currentState === "wait")
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
      if (this.isHurt) break;
      if (typeof this[a] !== "function") continue;
      let out = this[a]();
      if (out instanceof Promise) await out;
      else await this.sleep(this.ACTION_DELAYS[a] ?? 1000);
      if (this.isHurt) break;
    }
    this.currentState = "wait";
    this.playAnimation(this.IMAGES_WAIT);
  }

  startRandomBehavior() {
    this.behaviorInterval = setInterval(async () => {
      if (this.isPlayingSequence || this.isHurt) return;
      let seq =
        this.SEQUENCES[Math.floor(Math.random() * this.SEQUENCES.length)];
      this.isPlayingSequence = true;
      await this.playSequence(seq);
      this.isPlayingSequence = false;
    }, 5000);
  }

  playAnimationOnce(images, interval = this.animationIntervalMs) {
    return new Promise((resolve) => {
      let i = 0;
      let id = setInterval(() => {
        this.img = this.imageCache[images[i++]];
        if (i >= images.length) {
          clearInterval(id);
          resolve();
        }
      }, interval);
    });
  }

  moveXOverTime(dx, duration, onProgress) {
    return new Promise((resolve) => {
      let start = performance.now(),
        startX = this.x;
      let step = (now) => {
        if (this.dead) return resolve();
        let p = Math.min((now - start) / duration, 1);
        this.x = startX + dx * p;
        if (onProgress) onProgress(p, now - start);
        if (p < 1) requestAnimationFrame(step);
        else resolve();
      };
      requestAnimationFrame(step);
    });
  }

  wait() {
    this.currentState = "wait";
    this.playAnimation(this.IMAGES_WAIT);
  }

  walkForward() {
    this.currentState = "walkForward";
    this.playAnimation(this.IMAGES_WALK);
    if (this.isMovingHoriz) return;
    this.isMovingHoriz = true;
    return this.moveXOverTime(
      -this.walkForwardDistance,
      this.ACTION_DELAYS.walkForward
    ).finally(() => {
      this.isMovingHoriz = false;
    });
  }

  walkBackward() {
    this.currentState = "walkBackward";
    this.playAnimation(this.IMAGES_WALK);
    if (this.isMovingHoriz) return;
    this.isMovingHoriz = true;
    return this.moveXOverTime(
      this.walkBackwardDistance,
      this.ACTION_DELAYS.walkBackward
    ).finally(() => {
      this.isMovingHoriz = false;
    });
  }

  alert() {
    this.currentState = "alert";
    this.playAnimation(this.IMAGES_ALERT);
  }

  attack() {
    this.currentState = "attack";
    this.playAnimation(this.IMAGES_ATTACK);
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
    this.currentState = "wait";
    this.playAnimation(this.IMAGES_WAIT);
  }

  hurt() {
    this.currentState = "hurt";
    this.playAnimation(this.IMAGES_HURT);
    setTimeout(() => {
      this.isHurt = false;
      this.currentState = "wait";
    }, this.IMAGES_HURT.length * this.animationIntervalMs);
  }

  hit(damage = 20) {
    super.hit(damage);
    if (this.energy > 0) this.hurt();
    else this.die();
  }

  die() {
    this.currentState = "dead";
    setTimeout(() => {
      if (this.animationIntervalId) clearInterval(this.animationIntervalId);
      if (this.behaviorInterval) clearInterval(this.behaviorInterval);
      this.dead = true;
      if (this.world && this.world.level && this.world.level.enemies) {
        let i = this.world.level.enemies.indexOf(this);
        if (i > -1) this.world.level.enemies.splice(i, 1);
      }
    }, this.IMAGES_DEAD.length * this.animationIntervalMs);
  }
}
