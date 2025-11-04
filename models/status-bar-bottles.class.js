/**
 * Status bar showing collected bottle percentage.
 * @extends StatusBar
 */
class StatusBarBottles extends StatusBar {
  /**
   * Creates the bottle status bar and loads its images.
   */
  constructor() {
    super(
      [
        "assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/green/0.png",
        "assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/green/20.png",
        "assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/green/40.png",
        "assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/green/60.png",
        "assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/green/80.png",
        "assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/green/100.png",
      ],
      0,
      40
    );
  }
}
