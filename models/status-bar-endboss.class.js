/**
 * Status bar displaying the endboss's health.
 * @extends StatusBar
 */
class StatusBarEndboss extends StatusBar {
  /**
   * Creates the endboss status bar.
   */
  constructor() {
    super(
      [
        "assets/img/7_statusbars/2_statusbar_endboss/green/green0.png",
        "assets/img/7_statusbars/2_statusbar_endboss/green/green20.png",
        "assets/img/7_statusbars/2_statusbar_endboss/green/green40.png",
        "assets/img/7_statusbars/2_statusbar_endboss/green/green60.png",
        "assets/img/7_statusbars/2_statusbar_endboss/green/green80.png",
        "assets/img/7_statusbars/2_statusbar_endboss/green/green100.png",
      ],
      100,
      0
    );
    this.x = 490;
  }
}
