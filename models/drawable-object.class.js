/**
 * Base class for drawable elements in the game.
 */
class DrawableObject {
  img;
  imageCache = {};
  currentImage = 0;
  x = 120;
  y = 280;
  height = 150;
  width = 100;

  /**
   * Loads an image for this object.
   * @param {string} path - File path of the image.
   * @returns {void}
   */
  loadImage(path) {
    this.img = new Image();
    this.img.src = path;
  }

  /**
   * Draws the object to the canvas.
   * @param {CanvasRenderingContext2D} ctx - Rendering context.
   * @returns {void}
   */
  draw(ctx) {
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
  }

  /**
   * Draws a frame around the object for debugging.
   * @param {CanvasRenderingContext2D} ctx - Rendering context.
   * @returns {void}
   */
  drawFrame(ctx) {
    if (!this.shouldDrawFrame()) return;
    ctx.beginPath();
    ctx.lineWidth = "2";
    ctx.strokeStyle = "red";
    const { left, right, top, bottom } = this.offset;
    ctx.rect(
      this.x + left,
      this.y + top,
      this.width - left - right,
      this.height - top - bottom
    );
    ctx.stroke();
  }

  shouldDrawFrame() {
    if (!this.offset) return false;
    return (
      this instanceof Chicken ||
      this instanceof Character ||
      this instanceof Endboss
    );
  }

  /**
   * Preloads multiple images and stores them in the cache.
   * @param {string[]} arr - Array of image paths.
   * @returns {void}
   */
  loadImages(arr) {
    arr.forEach((path) => {
      let image = new Image();
      image.src = path;
      this.imageCache[path] = image;
    });
  }
}
