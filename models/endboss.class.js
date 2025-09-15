/**
 * Final boss character encountered at the end of the level.
 * @extends MovableObject
 */
class Endboss extends MovableObject {
  height = 400;
  width = 250;
  y = 60;
  energy = 100;

  animationIntervalMs = 350;
  animationIntervalId;

  currentState = "wait";

  /** Index of the next step in {@link jumpPath}. */
  jumpPathIndex = 0;

  /** Determines whether the jump path repeats after completion. */
  repeatJumpPath = true;

  /**
   * Predefined behavior sequences consisting of endboss action names.
   * @type {string[][]}
   */
  SEQUENCES = [
    ["wait", "walkForward", "alert", "walkBackward"],
    ["wait", "alert", "attack", "walkBackward"],
    ["wait", "walkForward", "walkBackward", "attack", "walkBackward"],
    ["wait", "alert", "jumpAttack", "walkBackward"],
    [
      "wait",
      "alert",
      "walkForward",
      "walkBackward",
      "jumpAttack",
      "walkBackward",
    ],
  ];

  /** Indicates whether a sequence is currently running. */
  isPlayingSequence = false;

  /** Holds the interval ID for the random behavior loop. */
  behaviorInterval;

  /** Indicates whether the endboss is currently hurt. */
  isHurt = false;

  /**
   * Default distances (in px) for endboss actions. Adjust to tweak behavior.
   */
  walkForwardDistance = 200;
  walkBackwardDistance = 200;
  attackDistance = 100;
  jumpAttackDistance = 200;

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

  /**
   * Initializes the end boss and starts its animation.
   */
  constructor() {
    super().loadImage(this.IMAGES_ALERT[0]);
    this.loadImages(this.IMAGES_WALK);
    this.loadImages(this.IMAGES_ALERT);
    this.loadImages(this.IMAGES_ATTACK);
    this.loadImages(this.IMAGES_HURT);
    this.loadImages(this.IMAGES_DEAD);
    this.x = 2550;
    this.offset = { top: 80, right: 5, bottom: 5, left: 25 };
    this.applyGravity();
    this.animate();
    this.startRandomBehavior();
  }

  /**
   * Checks whether the end boss is above ground level.
   * Overrides {@link MovableObject#isAboveGround} to use a custom ground height.
   * @returns {boolean} True if the boss has not yet reached the ground.
   */
  isAboveGround() {
    return this.y < 60;
  }

  /**
   * Runs the state machine to control movement and animations.
   * @returns {void}
   */
  animate() {
    this.animationIntervalId = setInterval(() => {
      switch (this.currentState) {
        case "walkForward":
          this.walkForward();
          break;
        case "walkBackward":
          this.walkBackward();
          break;
        case "jumpAttack":
          this.jumpAttack();
          break;
        case "attack":
          this.attack();
          break;
        case "hurt":
          this.hurt();
          break;
        case "dead":
          this.playAnimation(this.IMAGES_DEAD);
          break;
        default:
          this.alert();
          break;
      }
    }, this.animationIntervalMs);
  }

  /**
   * Plays a given sequence of actions sequentially.
   * @param {string[]} sequence - Array of method names to execute.
   * @returns {Promise<void>}
   */
  async playSequence(sequence) {
    for (let action of sequence) {
      if (typeof this[action] === "function") {
        if (this.isHurt) {
          break;
        }
        let result = this[action]();
        if (result instanceof Promise) {
          await result;
        } else {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        if (this.isHurt) {
          break;
        }
      }
    }
  }

  /**
   * Periodically selects and plays random behavior sequences.
   * @returns {void}
   */
  startRandomBehavior() {
    this.behaviorInterval = setInterval(async () => {
      if (this.isPlayingSequence || this.isHurt) {
        return;
      }
      let sequence =
        this.SEQUENCES[Math.floor(Math.random() * this.SEQUENCES.length)];
      this.isPlayingSequence = true;
      await this.playSequence(sequence);
      this.isPlayingSequence = false;
    }, 5000);
  }

  /** * Moves right while playing the walking animation.
   * @returns {void}
   */
  walkForward() {
    this.currentState = "walkForward";
    this.moveLeft();
    this.playAnimation(this.IMAGES_WALK);
    console.log("lauf vorwärts");
  }

  /**
   * Moves left while playing the walking animation.
   * @returns {void}
   */
  walkBackward() {
    this.currentState = "walkBackward";
    this.moveRight();
    this.playAnimation(this.IMAGES_WALK);
    console.log("lauf rückwärts");
  }

  /**
   * Plays the alert animation.
   * @returns {void}
   */
  alert() {
    this.currentState = "alert";
    this.playAnimation(this.IMAGES_ALERT);
    console.log("achtung");
  }

  /**
   * Plays the attack animation.
   * @returns {void}
   */
  attack() {
    this.currentState = "attack";
    this.playAnimation(this.IMAGES_ATTACK);
    console.log("angriff");
  }

  /**
   * Performs a jumping attack moving toward the character.
   * @returns {void}
   */
  jumpAttack() {
    this.currentState = "jumpAttack";
    console.log("sprung angriff");

    if (!this.isAboveGround()) {
      this.jump();
      this.speedY = 25;
    }
    this.playAnimation(this.IMAGES_JUMPATTACK);
  }

  /**
   * Plays the hurt animation.
   * @returns {void}
   */
  hurt() {
    this.currentState = "hurt";
    this.playAnimation(this.IMAGES_HURT);
    setTimeout(() => {
      this.isHurt = false;
      this.currentState = "alert";
    }, this.IMAGES_HURT.length * this.animationIntervalMs);
  }

  /**
   * Reduces energy by the given damage and triggers animations.
   * @param {number} [damage=20] - Amount of energy to subtract.
   * @returns {void}
   */
  hit(damage = 20) {
    super.hit(damage);
    if (this.energy > 0) {
      this.hurt();
    } else {
      this.die();
    }
  }

  /**
   * Handles the death of the endboss and removes it from the world.
   * @returns {void}
   */
  die() {
    this.currentState = "dead";
    setTimeout(() => {
      if (this.animationIntervalId) {
        clearInterval(this.animationIntervalId);
      }
      this.dead = true;
      if (this.world && this.world.level && this.world.level.enemies) {
        let index = this.world.level.enemies.indexOf(this);
        if (index > -1) {
          this.world.level.enemies.splice(index, 1);
        }
      }
    }, this.IMAGES_DEAD.length * this.animationIntervalMs);
  }
}
