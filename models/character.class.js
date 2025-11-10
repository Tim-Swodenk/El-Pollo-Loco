/**
 * Main playable character controlled by the user.
 * @extends MovableObject
 */
class Character extends MovableObject {
  /**
   * Y-coordinate representing the ground level for the character.
   * @type {number}
   */
  static GROUND_LEVEL = 90;

  y = Character.GROUND_LEVEL;
  height = 350;
  width = 150;
  speed = 10;
  IMAGES_DEAD = [
    "assets/img/2_character_pepe/5_dead/D-51.png",
    "assets/img/2_character_pepe/5_dead/D-52.png",
    "assets/img/2_character_pepe/5_dead/D-53.png",
    "assets/img/2_character_pepe/5_dead/D-54.png",
    "assets/img/2_character_pepe/5_dead/D-55.png",
    "assets/img/2_character_pepe/5_dead/D-56.png",
    "assets/img/2_character_pepe/5_dead/D-57.png",
  ];

  IMAGES_WALKING = [
    "assets/img/2_character_pepe/2_walk/W-21.png",
    "assets/img/2_character_pepe/2_walk/W-22.png",
    "assets/img/2_character_pepe/2_walk/W-23.png",
    "assets/img/2_character_pepe/2_walk/W-24.png",
    "assets/img/2_character_pepe/2_walk/W-25.png",
    "assets/img/2_character_pepe/2_walk/W-26.png",
  ];

  IMAGES_IDLE = [
    "assets/img/2_character_pepe/1_idle/idle/I-1.png",
    "assets/img/2_character_pepe/1_idle/idle/I-2.png",
    "assets/img/2_character_pepe/1_idle/idle/I-3.png",
    "assets/img/2_character_pepe/1_idle/idle/I-4.png",
    "assets/img/2_character_pepe/1_idle/idle/I-5.png",
    "assets/img/2_character_pepe/1_idle/idle/I-6.png",
    "assets/img/2_character_pepe/1_idle/idle/I-7.png",
    "assets/img/2_character_pepe/1_idle/idle/I-8.png",
    "assets/img/2_character_pepe/1_idle/idle/I-9.png",
    "assets/img/2_character_pepe/1_idle/idle/I-10.png",
  ];

  IMAGES_LONG_IDLE = [
    "assets/img/2_character_pepe/1_idle/long_idle/I-11.png",
    "assets/img/2_character_pepe/1_idle/long_idle/I-12.png",
    "assets/img/2_character_pepe/1_idle/long_idle/I-13.png",
    "assets/img/2_character_pepe/1_idle/long_idle/I-14.png",
    "assets/img/2_character_pepe/1_idle/long_idle/I-15.png",
    "assets/img/2_character_pepe/1_idle/long_idle/I-16.png",
    "assets/img/2_character_pepe/1_idle/long_idle/I-17.png",
    "assets/img/2_character_pepe/1_idle/long_idle/I-18.png",
    "assets/img/2_character_pepe/1_idle/long_idle/I-19.png",
    "assets/img/2_character_pepe/1_idle/long_idle/I-20.png",
  ];

  IMAGES_JUMPING = [
    "assets/img/2_character_pepe/3_jump/J-31.png",
    "assets/img/2_character_pepe/3_jump/J-32.png",
    "assets/img/2_character_pepe/3_jump/J-33.png",
    "assets/img/2_character_pepe/3_jump/J-34.png",
    "assets/img/2_character_pepe/3_jump/J-35.png",
    "assets/img/2_character_pepe/3_jump/J-36.png",
    "assets/img/2_character_pepe/3_jump/J-37.png",
    "assets/img/2_character_pepe/3_jump/J-38.png",
    "assets/img/2_character_pepe/3_jump/J-39.png",
  ];

  IMAGES_HURT = [
    "assets/img/2_character_pepe/4_hurt/H-41.png",
    "assets/img/2_character_pepe/4_hurt/H-42.png",
    "assets/img/2_character_pepe/4_hurt/H-43.png",
  ];

  world;

  isHurting = false;
  currentAnimation = null;
  lastFrameChangeAt = 0;
  lastActiveAt = Date.now();

  static SLEEP_DELAY_MS = 15000;
  static IDLE_FRAME_DURATION_MS = 140;
  static LONG_IDLE_FRAME_DURATION_MS = 180;

  /**
   * Initializes the character and loads animations.
   */
  constructor() {
    super().loadImage("assets/img/2_character_pepe/2_walk/W-21.png");

    this.loadImages(this.IMAGES_WALKING);
    this.loadImages(this.IMAGES_JUMPING);
    this.loadImages(this.IMAGES_DEAD);
    this.loadImages(this.IMAGES_HURT);
    this.loadImages(this.IMAGES_IDLE);
    this.loadImages(this.IMAGES_LONG_IDLE);
    this.offset = { top: 140, right: 40, bottom: 20, left: 40 };

    this.applyGravity();
    this.animate();
  }

  /**
   * Resets the idle timer to keep the character awake.
   * @returns {void}
   */
  setActive() {
    this.lastActiveAt = Date.now();
  }

  /**
   * Ensures animation sequences restart when switching.
   * @param {string[]} images - Sequence of image paths to play.
   * @returns {void}
   */
  playLoop(images, frameDuration = 60) {
    let now = Date.now();

    if (this.currentAnimation !== images) {
      this.currentAnimation = images;
      this.currentImage = 0;
      this.lastFrameChangeAt = 0;
    }

    if (now - this.lastFrameChangeAt >= frameDuration) {
      this.playAnimation(images);
      this.lastFrameChangeAt = now;
    } else if (this.img == null && images.length > 0) {
      this.img = this.imageCache[images[0]];
    }
  }

  /**
   * Handles movement and animation logic.
   * @returns {void}
   */
  animate() {
    setInterval(() => {
      if (this.world.keyboard.RIGHT && this.x < this.world.level.level_end_x) {
        this.moveRight();
        this.otherDirection = false;
        this.setActive();
      }

      if (this.world.keyboard.LEFT && this.x > 0) {
        this.moveLeft();
        this.otherDirection = true;
        this.setActive();
      }

      if (this.world.keyboard.SPACE && !this.isAboveGround()) {
        this.jump();
        this.setActive();
      }

      if (this.world.keyboard.SPACE || this.world.keyboard.D) {
        this.setActive();
      }

      this.world.camera_x = -this.x + 100;
    }, 1000 / 60);

    setInterval(() => {
      if (this.isDead()) {
        this.playLoop(this.IMAGES_DEAD);
      } else if (this.isHurt()) {
        this.setActive();
        this.playLoop(this.IMAGES_HURT);
      } else if (this.isAboveGround()) {
        this.setActive();
        this.jumpAnimation();
      } else {
        if (this.world.keyboard.RIGHT || this.world.keyboard.LEFT) {
          this.setActive();
          this.playLoop(this.IMAGES_WALKING);
        } else {
          let idleTime = Date.now() - this.lastActiveAt;
          if (idleTime >= Character.SLEEP_DELAY_MS) {
            this.playLoop(
              this.IMAGES_LONG_IDLE,
              Character.LONG_IDLE_FRAME_DURATION_MS
            );
          } else {
            this.playLoop(this.IMAGES_IDLE, Character.IDLE_FRAME_DURATION_MS);
          }
        }
      }
    }, 60);
  }

  /**
   * Displays a jump animation based on the vertical position.
   * @returns {void}
   */
  jumpAnimation() {
    if (this.currentAnimation !== this.IMAGES_JUMPING) {
      this.currentAnimation = this.IMAGES_JUMPING;
      this.currentImage = 0;
    }
    let groundStart = Character.GROUND_LEVEL;
    let jumpPeak = -47.5;
    let descentStart = Character.GROUND_LEVEL;
    let sequence = this.IMAGES_JUMPING;
    let progress;

    if (this.y <= groundStart && this.y >= jumpPeak) {
      progress = (groundStart - this.y) / (groundStart - jumpPeak);
    } else if (this.y < groundStart && this.y < jumpPeak) {
      progress = 1;
    } else {
      progress = (this.y - jumpPeak) / (descentStart - jumpPeak);
      progress = 1 + progress;
    }

    let frameIndex;

    if (progress <= 1) {
      frameIndex = Math.round(progress * 3);
    } else {
      frameIndex = 3 + Math.round((progress - 1) * 5);
    }
    frameIndex = Math.max(0, Math.min(sequence.length - 1, frameIndex));

    this.img = this.imageCache[sequence[frameIndex]];
  }

  /**
   * Determines if the character is above the ground level.
   * @returns {boolean} True if above ground.
   */
  isAboveGround() {
    return this.y < Character.GROUND_LEVEL;
  }
}
