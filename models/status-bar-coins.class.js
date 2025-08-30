/**
 * Status bar showing collected coin percentage.
 * @extends StatusBar
 */
class StatusBarCoins extends StatusBar {
  /**
   * Creates the coin status bar and loads its images.
   * Creates the coin status bar.
   */
  constructor() {
    super(
      [
        "assets/img/7_statusbars/1_statusbar/1_statusbar_coin/green/0.png",
        "assets/img/7_statusbars/1_statusbar/1_statusbar_coin/green/20.png",
        "assets/img/7_statusbars/1_statusbar/1_statusbar_coin/green/40.png",
        "assets/img/7_statusbars/1_statusbar/1_statusbar_coin/green/60.png",
        "assets/img/7_statusbars/1_statusbar/1_statusbar_coin/green/80.png",
        "assets/img/7_statusbars/1_statusbar/1_statusbar_coin/green/100.png",
      ],
      0,
      80
    );
  }
}
