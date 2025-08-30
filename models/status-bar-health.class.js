/**
 * Status bar displaying the player's health.
 * @extends StatusBar
 */
class StatusBarHealth extends StatusBar {
  /**
   * Creates the health status bar and loads its images.
   * Creates the health status bar.
   */
  constructor() {
    super(
      [
        "assets/img/7_statusbars/1_statusbar/2_statusbar_health/green/0.png",
        "assets/img/7_statusbars/1_statusbar/2_statusbar_health/green/20.png",
        "assets/img/7_statusbars/1_statusbar/2_statusbar_health/green/40.png",
        "assets/img/7_statusbars/1_statusbar/2_statusbar_health/green/60.png",
        "assets/img/7_statusbars/1_statusbar/2_statusbar_health/green/80.png",
        "assets/img/7_statusbars/1_statusbar/2_statusbar_health/green/100.png",
      ],
      100,
      0
    );
  }
}
