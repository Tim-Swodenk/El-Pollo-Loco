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
  movementInterval = null;
  animationInterval = null;

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
    this.startMovementLoop();
    this.startAnimationLoop();
  }

  /**
   * Runs the movement logic at 60 FPS based on keyboard input.
   * @returns {void}
   */
  startMovementLoop() {
    this.stopMovementLoop();
    this.movementInterval = setInterval(() => {
      this.handleHorizontalMovement();
      this.handleJumpInput();
      this.handleActivityKeys();
      this.world.camera_x = -this.x + 100;
    }, 1000 / 60);
  }

  /**
   * Moves the character left or right depending on input keys.
   * @returns {void}
   */
  handleHorizontalMovement() {
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
  }

  /**
   * Initiates a jump when the space bar is pressed and the player is grounded.
   * @returns {void}
   */
  handleJumpInput() {
    if (this.world.keyboard.SPACE && !this.isAboveGround()) {
      this.jump();
      playSoundEffect("jump");
      this.setActive();
    }
  }

  /**
   * Marks the character as active when attack or jump keys are used.
   * @returns {void}
   */
  handleActivityKeys() {
    if (this.world.keyboard.SPACE || this.world.keyboard.D) {
      this.setActive();
    }
  }

  /**
   * Periodically updates the animation state for the character.
   * @returns {void}
   */
  startAnimationLoop() {
    this.stopAnimationLoop();
    this.animationInterval = setInterval(() => {
      this.updateAnimationState();
    }, 60);
  }

  /**
   * Stops movement loop interval.
   * @returns {void}
   */
  stopMovementLoop() {
    if (!this.movementInterval) return;
    clearInterval(this.movementInterval);
    this.movementInterval = null;
  }

  /**
   * Stops animation loop interval.
   * @returns {void}
   */
  stopAnimationLoop() {
    if (!this.animationInterval) return;
    clearInterval(this.animationInterval);
    this.animationInterval = null;
  }

  /**
   * Stops all running timers on the character.
   * @returns {void}
   */
  stopAllTimers() {
    this.stopMovementLoop();
    this.stopAnimationLoop();
    this.stopGravity();
  }

  /**
   * Chooses the correct animation based on movement, damage and death states.
   * @returns {void}
   */
  updateAnimationState() {
    if (this.isDead()) {
      this.playLoop(this.IMAGES_DEAD);
    } else if (this.isHurt()) {
      this.setActive();
      this.playLoop(this.IMAGES_HURT);
    } else if (this.isAboveGround()) {
      this.setActive();
      this.jumpAnimation();
    } else {
      this.playIdleOrWalking();
    }
  }

  /**
   * Plays idle or walking animations depending on keyboard state and idle timer.
   * @returns {void}
   */
  playIdleOrWalking() {
    if (this.world.keyboard.RIGHT || this.world.keyboard.LEFT) {
      this.setActive();
      this.playLoop(this.IMAGES_WALKING);
      return;
    }

    let idleTime = Date.now() - this.lastActiveAt;
    if (idleTime >= Character.SLEEP_DELAY_MS) {
      this.playLoop(this.IMAGES_LONG_IDLE, Character.LONG_IDLE_FRAME_DURATION_MS);
    } else {
      this.playLoop(this.IMAGES_IDLE, Character.IDLE_FRAME_DURATION_MS);
    }
  }

  /**
   * Displays a jump animation based on the vertical position.
   * @returns {void}
   */
  jumpAnimation() {
    this.ensureJumpAnimationActive();

    let sequence = this.IMAGES_JUMPING;
    let progress = this.calculateJumpProgress();
    let frameIndex = this.getJumpFrameIndex(progress, sequence.length);

    this.setJumpFrame(sequence, frameIndex);
  }

  /**
   * Resets jump animation sequence when entering jump state.
   * @returns {void}
   */
  ensureJumpAnimationActive() {
    if (this.currentAnimation !== this.IMAGES_JUMPING) {
      this.currentAnimation = this.IMAGES_JUMPING;
      this.currentImage = 0;
    }
  }

  /**
   * Calculates the progress of the jump from ascent to descent.
   * @returns {number} Jump progress ranging from 0 (takeoff) to 2 (landing).
   */
  calculateJumpProgress() {
    let groundStart = Character.GROUND_LEVEL;
    let jumpPeak = -47.5;
    let descentStart = Character.GROUND_LEVEL;

    if (this.y <= groundStart && this.y >= jumpPeak) {
      return (groundStart - this.y) / (groundStart - jumpPeak);
    }

    if (this.y < groundStart && this.y < jumpPeak) {
      return 1;
    }

    let descentProgress = (this.y - jumpPeak) / (descentStart - jumpPeak);
    return 1 + descentProgress;
  }

  /**
   * Converts jump progress into a frame index of the animation sequence.
   * @param {number} progress - Jump progress between 0 and 2.
   * @param {number} sequenceLength - Number of frames in the jump sequence.
   * @returns {number} Frame index within the jump animation sequence.
   */
  getJumpFrameIndex(progress, sequenceLength) {
    let frameIndex;

    if (progress <= 1) {
      frameIndex = Math.round(progress * 3);
    } else {
      frameIndex = 3 + Math.round((progress - 1) * 5);
    }

    return Math.max(0, Math.min(sequenceLength - 1, frameIndex));
  }

  /**
   * Applies the calculated jump frame to the character image.
   * @param {string[]} sequence - Jump animation image paths.
   * @param {number} frameIndex - Index of the frame to display.
   * @returns {void}
   */
  setJumpFrame(sequence, frameIndex) {
    this.img = this.imageCache[sequence[frameIndex]];
  }

  /**
   * Determines if the character is above the ground level.
   * @returns {boolean} True if above ground.
   */
  isAboveGround() {
    return this.y < Character.GROUND_LEVEL;
  }

  /**
   * Reduces energy and plays a hurt sound when damaged.
   * @param {number} [damage=20] - Amount of damage to apply.
   * @returns {void}
   */
  hit(damage = 20) {
    super.hit(damage);
    playSoundEffect("hurt");
  }
}
