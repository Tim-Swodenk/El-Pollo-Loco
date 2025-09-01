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

  /**
   * Initializes the character and loads animations.
   */
  constructor() {
    super().loadImage("assets/img/2_character_pepe/2_walk/W-21.png");
    this.offset = { top: 140, right: 40, bottom: 20, left: 40 };
    this.loadImages(this.IMAGES_WALKING);
    this.loadImages(this.IMAGES_JUMPING);
    this.loadImages(this.IMAGES_DEAD);
    this.loadImages(this.IMAGES_HURT);
    this.applyGravity();
    this.animate();
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
      }

      if (this.world.keyboard.LEFT && this.x > 0) {
        this.moveLeft();
        this.otherDirection = true;
      }

      if (this.world.keyboard.SPACE && !this.isAboveGround()) {
        this.jump();
      }

      this.world.camera_x = -this.x + 100;
    }, 1000 / 60);

    setInterval(() => {
      if (this.isDead()) {
        this.playAnimation(this.IMAGES_DEAD);
      } else if (this.isHurt()) {
        this.playAnimation(this.IMAGES_HURT);
      } else if (this.isAboveGround()) {
        this.jumpAnimation();
      } else {
        if (this.world.keyboard.RIGHT || this.world.keyboard.LEFT) {
          //Walk animation
          this.playAnimation(this.IMAGES_WALKING);
        } else {
          this.currentImage = 0;
          this.img = this.imageCache[this.IMAGES_WALKING[0]];
        }
      }
    }, 60);
  }

  /**
   * Displays a jump animation based on the vertical position.
   * @returns {void}
   */
  jumpAnimation() {
    let yStart = Character.GROUND_LEVEL;
    let yPeak = -47.5;
    let yEnd = Character.GROUND_LEVEL;

    let images = this.IMAGES_JUMPING;

    let progress;

    if (this.y <= yStart && this.y >= yPeak) {
      progress = (yStart - this.y) / (yStart - yPeak);
    } else if (this.y < yStart && this.y < yPeak) {
      progress = 1;
    } else {
      progress = (this.y - yPeak) / (yEnd - yPeak);
      progress = 1 + progress;
    }

    let frame;

    if (progress <= 1) {
      frame = Math.round(progress * 3);
    } else {
      frame = 3 + Math.round((progress - 1) * 5);
    }
    frame = Math.max(0, Math.min(images.length - 1, frame));

    this.img = this.imageCache[images[frame]];
  }

  /**
   * Determines if the character is above the ground level.
   * @returns {boolean} True if above ground.
   */
  isAboveGround() {
    return this.y < Character.GROUND_LEVEL;
  }
}
