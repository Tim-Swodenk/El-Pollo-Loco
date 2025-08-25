/**
 * Represents a game level with enemies, scenery and collectibles.
 */
class Level {
  enemies;
  clouds;
  backgroundObjects;
  collectableObjects;
  level_end_x = 2200;

  /**
   * Creates a level instance.
   * @param {MovableObject[]} enemies - Enemies appearing in the level.
   * @param {Cloud[]} clouds - Clouds in the background.
   * @param {BackgroundObject[]} backgroundObjects - Background elements.
   * @param {CollectableBottle[]} collectableObjects - Objects that can be collected.
   */
  constructor(enemies, clouds, backgroundObjects, collectableObjects) {
    this.enemies = enemies;
    this.clouds = clouds;
    this.backgroundObjects = backgroundObjects;
    this.collectableObjects = collectableObjects;
  }
}
