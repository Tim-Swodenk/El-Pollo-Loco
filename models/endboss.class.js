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

  currentState = "wait";

  SEQUENCES = [
    ["alert", "jumpAttack", "walkBackward"],
    ["walkForward", "alert", "walkBackward"],
    ["alert", "walkForward", "walkBackward"],
    ["walkForward", "attack", "walkBackward"],
  ];

  walkForwardDistance = 300;
  walkBackwardDistance = 300;
  attackDistance = 200;
  jumpAttackDistance = 300;
  attackEarlyMargin = 220; // früher loslegen: +120px zum normalen attackDistance
  attackLungeDistance = 200; // Vorstoß während der Attacke
  enrageHp = 50; // unter 50 HP wird er wilder
  enrageMult = 1.4; // Multiplikator im Enrage
  dashDistance = 260; // kurzer Sprint Richtung Spieler
  aggroTickMs = 120; // Reaktionszeit für Aggro-Loop
  maxAttackChain = 2; // max. Folgeangriffe

  ACTION_DELAYS = {
    walkForward: 1000,
    walkBackward: 1000,
    alert: 500,
    attack: 1000,
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
    this.x = 2600;
    this.spawnX = this.x;
    this._moveId = 0;
    this.offset = { top: 80, right: 5, bottom: 5, left: 25 };
    this.applyGravity();
    this.startProximityAggro();
    this.animate();
    this.startRandomBehavior();
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

  centerX() {
    return this.x + this.width * 0.5;
  }

  distanceToTargetX() {
    let c = this.world?.character;
    if (!c) return Infinity;
    return Math.abs(c.x + c.width * 0.5 - this.centerX());
  }

  dirToTarget() {
    let c = this.world?.character;
    if (!c) return 0;
    let d = c.x + c.width * 0.5 - this.centerX();
    return d === 0 ? 0 : d > 0 ? 1 : -1;
  }

  isInAttackRange() {
    let m = this.getEnrage();
    return (
      this.distanceToTargetX() <=
      (this.attackDistance + this.attackEarlyMargin) * m
    );
  }

  getEnrage() {
    return this.energy <= this.enrageHp ? this.enrageMult : 1;
  }

  faceTarget() {
    let d = this.dirToTarget();
    if (d === 0) return;
    this.otherDirection = d > 0; // ← schaut NACH RECHTS, wenn Spieler rechts ist
    // Wenn er damit wieder falsch herum schaut: einfach auf (d < 0) ändern.
    // this.otherDirection = d < 0;
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

  attack(chain = 0) {
    if (!this.isInAttackRange()) return this.approachTarget();
    this.currentState = "attack";
    this.faceTarget();
    this.playAnimation(this.IMAGES_ATTACK);
    let dx =
      this.dirToTarget() *
      Math.round(this.attackLungeDistance * this.getEnrage());
    return this.moveXOverTime(dx, this.ACTION_DELAYS.attack).then(() => {
      if (
        chain < this.maxAttackChain &&
        this.isInAttackRange() &&
        Math.random() < 0.6
      )
        return this.attack(chain + 1); // 60% Chance auf Folgehit
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
    this.faceTarget();
  }

  approachTarget(range = this.attackDistance + this.attackEarlyMargin) {
    let c = this.world?.character;
    if (!c) return;
    let delta = c.x + c.width * 0.5 - this.centerX();
    let gap = Math.abs(delta) - range;
    if (gap <= 0) return;
    let left = delta < 0,
      step = Math.min(
        gap,
        left ? this.walkForwardDistance : this.walkBackwardDistance
      );
    let dx = left ? -step : step;
    this.currentState = left ? "walkForward" : "walkBackward";
    this.faceTarget();
    this.playAnimation(this.IMAGES_WALK);
    let dur = left
      ? this.ACTION_DELAYS.walkForward
      : this.ACTION_DELAYS.walkBackward;
    return this.moveXOverTime(dx, dur);
  }

  dashTowardsTarget() {
    let dir = this.dirToTarget();
    if (!dir) return;
    this.currentState = dir < 0 ? "walkForward" : "walkBackward";
    this.faceTarget();
    this.playAnimation(this.IMAGES_WALK);
    let dx = dir * Math.round(this.dashDistance * this.getEnrage());
    let dur = Math.max(250, Math.round(this.ACTION_DELAYS.walkForward * 0.6));
    return this.moveXOverTime(dx, dur);
  }

  startProximityAggro() {
    this.aggroId = setInterval(() => {
      if (this.dead || this.isJumpAttackActive) return;
      if (this.isInAttackRange()) {
        if (this.currentState !== "attack") this.attack();
        return;
      }
      let d = this.distanceToTargetX();
      if (d > this.walkForwardDistance * 1.5) this.dashTowardsTarget();
      else this.approachTarget();
      if (Math.random() < 0.2 * this.getEnrage()) this.jumpAttack(); // öfter springen
    }, this.aggroTickMs);
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
