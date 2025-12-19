/**
 * Shared configuration values for the endboss.
 */
const END_BOSS_BASE_STATS = Object.freeze({
  height: 400,
  width: 250,
  y: 40,
  energy: 100,
  speed: 18,
  walkForwardDistance: 400,
  walkBackwardDistance: 400,
  attackDistance: 40,
  jumpAttackDistance: 400,
  animationMs: 180,
  spawnX: 2700,
  offset: { top: 80, right: 5, bottom: 5, left: 25 },
});

const END_BOSS_ACTION_DELAYS = Object.freeze({
  walkForward: 1000,
  walkBackward: 1000,
  alert: 300,
  attack: 600,
  jumpAttack: 800,
  wait: 800,
});

const END_BOSS_SEQUENCES = [
  ["alert", "jumpAttack", "walkBackward"],
  ["walkForward", "alert", "walkBackward"],
  ["alert", "walkForward", "walkBackward"],
  ["walkForward", "alert", "attack", "walkBackward"],
  [
    "jumpAttack",
    "attack",
    "walkForward",
    "walkBackward",
    "attack",
    "walkBackward",
  ],
];

const END_BOSS_IMAGES = Object.freeze({
  WAIT: [
    "assets/img/4_enemie_boss_chicken/2_alert/G5.png",
    "assets/img/4_enemie_boss_chicken/2_alert/G6.png",
    "assets/img/4_enemie_boss_chicken/2_alert/G7.png",
  ],
  WALK: [
    "assets/img/4_enemie_boss_chicken/1_walk/G1.png",
    "assets/img/4_enemie_boss_chicken/1_walk/G2.png",
    "assets/img/4_enemie_boss_chicken/1_walk/G3.png",
    "assets/img/4_enemie_boss_chicken/1_walk/G4.png",
  ],
  ALERT: [
    "assets/img/4_enemie_boss_chicken/2_alert/G5.png",
    "assets/img/4_enemie_boss_chicken/2_alert/G6.png",
    "assets/img/4_enemie_boss_chicken/2_alert/G7.png",
    "assets/img/4_enemie_boss_chicken/2_alert/G8.png",
    "assets/img/4_enemie_boss_chicken/2_alert/G9.png",
    "assets/img/4_enemie_boss_chicken/2_alert/G10.png",
    "assets/img/4_enemie_boss_chicken/2_alert/G11.png",
    "assets/img/4_enemie_boss_chicken/2_alert/G12.png",
  ],
  ATTACK: [
    "assets/img/4_enemie_boss_chicken/3_attack/G13.png",
    "assets/img/4_enemie_boss_chicken/3_attack/G14.png",
    "assets/img/4_enemie_boss_chicken/3_attack/G15.png",
    "assets/img/4_enemie_boss_chicken/3_attack/G16.png",
    "assets/img/4_enemie_boss_chicken/3_attack/G17.png",
    "assets/img/4_enemie_boss_chicken/3_attack/G18.png",
    "assets/img/4_enemie_boss_chicken/3_attack/G19.png",
    "assets/img/4_enemie_boss_chicken/3_attack/G20.png",
  ],
  JUMPATTACK: [
    "assets/img/4_enemie_boss_chicken/3_attack/G17.png",
    "assets/img/4_enemie_boss_chicken/3_attack/G18.png",
    "assets/img/4_enemie_boss_chicken/3_attack/G19.png",
  ],
  HURT: [
    "assets/img/4_enemie_boss_chicken/4_hurt/G21.png",
    "assets/img/4_enemie_boss_chicken/4_hurt/G22.png",
    "assets/img/4_enemie_boss_chicken/4_hurt/G23.png",
  ],
  DEAD: [
    "assets/img/4_enemie_boss_chicken/5_dead/G24.png",
    "assets/img/4_enemie_boss_chicken/5_dead/G25.png",
    "assets/img/4_enemie_boss_chicken/5_dead/G26.png",
  ],
});
