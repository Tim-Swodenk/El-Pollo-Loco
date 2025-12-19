/**
 * Handles drawing and camera transforms for the world.
 */
class WorldRenderer {
  /**
   * @param {CanvasRenderingContext2D} ctx - Canvas context.
   * @param {World} world - World instance to render.
   */
  constructor(ctx, world) {
    this.ctx = ctx;
    this.world = world;
    this.frameId = null;
    this.isRunning = false;
    this.drawFrame = this.drawFrame.bind(this);
  }

  /**
   * Starts the continuous rendering loop.
   * @returns {void}
   */
  start() {
    this.isRunning = true;
    this.frameId = requestAnimationFrame(this.drawFrame);
  }

  /**
   * Stops the rendering loop and cancels the pending animation frame.
   * @returns {void}
   */
  stop() {
    this.isRunning = false;
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }

  /**
   * Clears the canvas and draws all game objects.
   * @returns {void}
   */
  drawFrame() {
    if (!this.isRunning) return;
    this.clearCanvas();
    this.drawBackground();
    this.drawHud();
    this.drawForeground();
    this.resetCamera();
    this.frameId = requestAnimationFrame(this.drawFrame);
  }

  /**
   * Clears the entire rendering area of the canvas.
   * @returns {void}
   */
  clearCanvas() {
    this.ctx.clearRect(0, 0, this.world.canvas.width, this.world.canvas.height);
  }

  /**
   * Draws background objects and clouds with the current camera offset.
   * @returns {void}
   */
  drawBackground() {
    this.ctx.translate(this.world.camera_x, 0);
    this.addObjectsToMap(this.world.level.backgroundObjects);
    this.addObjectsToMap(this.world.level.clouds);
  }

  /**
   * Renders status bars without camera translation applied.
   * @returns {void}
   */
  drawHud() {
    this.ctx.translate(-this.world.camera_x, 0);
    this.addToMap(this.world.statusBarHealth);
    this.addToMap(this.world.statusBarBottles);
    this.addToMap(this.world.statusBarCoins);
    if (this.shouldShowEndbossBar()) {
      this.addToMap(this.world.statusBarEndboss);
    }
  }

  /**
   * Indicates whether the endboss health bar is within the current viewport.
   * @returns {boolean}
   */
  shouldShowEndbossBar() {
    if (!this.world.endboss) return false;
    const x = this.world.endboss.x + this.world.camera_x;
    return x >= 0 && x <= this.world.canvas.width;
  }

  /**
   * Draws all foreground entities including the player, enemies and items.
   * @returns {void}
   */
  drawForeground() {
    this.ctx.translate(this.world.camera_x, 0);
    this.addToMap(this.world.character);
    this.addObjectsToMap(this.world.level.enemies);
    this.addObjectsToMap(this.world.throwableObjects);
    this.addObjectsToMap(this.world.level.collectableObjects);
    this.addObjectsToMap(this.world.level.coinObjects);
  }

  /**
   * Resets the camera transform after drawing.
   * @returns {void}
   */
  resetCamera() {
    this.ctx.translate(-this.world.camera_x, 0);
  }

  /**
   * Adds multiple objects to the canvas.
   * @param {DrawableObject[]} objects - Objects to add.
   * @returns {void}
   */
  addObjectsToMap(objects) {
    for (const o of objects) {
      this.addToMap(o);
    }
  }

  /**
   * Draws a single movable object and handles direction flipping.
   * @param {MovableObject} mo - Object to draw.
   * @returns {void}
   */
  addToMap(mo) {
    if (mo.otherDirection) this.flipImage(mo);

    mo.draw(this.ctx);

    if (mo.otherDirection) this.flipImageBack(mo);
  }

  /**
   * Flips an image horizontally for left-facing orientation.
   * @param {MovableObject} mo - Object to flip.
   * @returns {void}
   */
  flipImage(mo) {
    this.ctx.save();
    this.ctx.translate(mo.width, 0);
    this.ctx.scale(-1, 1);
    mo.x = mo.x * -1;
  }

  /**
   * Restores the image after flipping.
   * @param {MovableObject} mo - Previously flipped object.
   * @returns {void}
   */
  flipImageBack(mo) {
    mo.x = mo.x * -1;
    this.ctx.restore();
  }
}
