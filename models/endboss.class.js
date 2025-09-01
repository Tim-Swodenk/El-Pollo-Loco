/**
 * Final boss character encountered at the end of the level.
 * @extends MovableObject
 */
class Endboss extends MovableObject {
  height = 400;
  width = 250;
  y = 60;
  energy = 100;
  animationInterval;
  currentState = "walkForward";

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
    this.animate();
  }

  /**
   * Runs the state machine to control movement and animations.
   * @returns {void}
   */
  animate() {
    this.animationInterval = setInterval(() => {
      switch (this.currentState) {
        case "walkForward":
          this.walkForward();
          break;
        case "walkBackward":
          this.walkBackward();
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
    }, 200);
  }

  /** * Moves right while playing the walking animation.
   * @returns {void}
   */
  walkForward() {
    this.currentState = "walkForward";
    this.moveRight();
    this.playAnimation(this.IMAGES_WALK);
  }

  /**
   * Moves left while playing the walking animation.
   * @returns {void}
   */
  walkBackward() {
    this.currentState = "walkBackward";
    this.moveLeft();
    this.playAnimation(this.IMAGES_WALK);
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
   * Plays the attack animation.
   * @returns {void}
   */
  attack() {
    this.currentState = "attack";
    this.playAnimation(this.IMAGES_ATTACK);
  }

  /**
   * Plays the hurt animation.
   * @returns {void}
   */
  hurt() {
    this.currentState = "hurt";
    this.playAnimation(this.IMAGES_HURT);
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
      if (this.animationInterval) {
        clearInterval(this.animationInterval);
      }
      this.dead = true;
      if (this.world && this.world.level && this.world.level.enemies) {
        let index = this.world.level.enemies.indexOf(this);
        if (index > -1) {
          this.world.level.enemies.splice(index, 1);
        }
      }
    }, this.IMAGES_DEAD.length * 200);
  }
}
