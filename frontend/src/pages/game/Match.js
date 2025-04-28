import Phaser from "phaser";
import { loadAnims } from "./loadAnims";

// Apparently thee animations in the same scene uhhh shares keys
const ANIMS = {
  match_p2Body: [
    {
      key: "wait",

      start: 1,
      end: 1,
      frameRate: 24,
      repeat: -1,
    },
    {
      key: "rps",

      start: 0,
      end: 0,

      frameRate: 24,
      repeat: -1,
    },
  ],
  match_p2Hand: [
    {
      key: "wait",

      start: 0,
      end: 0,
      frameRate: 24,
      repeat: -1,
    },
    {
      key: "rock",

      start: 1,
      end: 1,

      frameRate: 24,
      repeat: -1,
    },
    {
      key: "paper",

      start: 2,
      end: 2,

      frameRate: 24,
      repeat: -1,
    },
    {
      key: "scissors",

      start: 3,
      end: 3,

      frameRate: 24,
      repeat: -1,
    },
  ],
  match_p1Right: [
    {
      key: "wait",

      start: 0,
      end: 0,
      frameRate: 24,
      repeat: -1,
    },
    {
      key: "paper",

      start: 1,
      end: 1,

      frameRate: 24,
      repeat: -1,
    },
    {
      key: "scissors",

      start: 2,
      end: 2,

      frameRate: 24,
      repeat: -1,
    },
    {
      key: "rock",

      start: 3,
      end: 3,

      frameRate: 24,
      repeat: -1,
    },
    {
      key: "win",

      start: 4,
      end: 4,

      frameRate: 24,
      repeat: -1,
    },
    {
      key: "lose",

      start: 5,
      end: 5,

      frameRate: 24,
      repeat: -1,
    },
  ],
  match_rps_text: [
    {
      key: "choose",
      start: 0,
      end: 0,
      frameRate: 24,
      repeat: -1,
    },
  ],
};

export default class Match extends Phaser.Scene {
  constructor() {
    super("Match");
  }

  preload() {
    this.load.image("match_bg", "assets/match_bg.png");
    this.load.image("match_table", "assets/match_table.png");
    this.load.image("match_rps_rock", "assets/match_rps_rock.png");
    this.load.image("match_rps_paper", "assets/match_rps_paper.png");
    this.load.image("match_rps_scissors", "assets/match_rps_scissors.png");
    this.load.atlas(
      "match_p1Left",
      "assets/match_p1Left.png",
      "assets/match_p1Left.json"
    );
    this.load.atlas(
      "match_p1Right",
      "assets/match_p1Right.png",
      "assets/match_p1Right.json"
    );
    this.load.atlas(
      "match_rps_text",
      "assets/match_rps_text.png",
      "assets/match_rps_text.json"
    );
    this.load.atlas(
      "match_p2Body",
      "assets/match_p2Body.png",
      "assets/match_p2Body.json"
    );
    this.load.atlas(
      "match_p2Hand",
      "assets/match_p2Hand.png",
      "assets/match_p2Hand.json"
    );
  }

  create() {
    const SCENE_W = this.sys.game.canvas.width;
    const SCENE_H = this.sys.game.canvas.height;

    this.bg = this.add
      .sprite(-19, -95, "match_bg")
      .setOrigin(0, 0)
      .setDepth(-99)
      .setName("bg");
    this.table = this.add
      .sprite(-80, 592, "match_table")
      .setOrigin(0, 0)
      .setDepth(9)
      .setName("table");

    this.p2Body = this.add
      .sprite(1095, 239, "match_p2Body")
      .setOrigin(0, 0)
      .setDepth(1)
      .setName("p2Body");

    this.p2Hand = this.add
      .sprite(1144, 489, "match_p2Hand")
      .setDisplayOrigin(318, 184)
      .setName("p2Hand");

    this.p1Left = this.add
      .sprite(-184, 1360, "match_p1Left")
      .setDisplayOrigin(0, 49)
      .setDepth(999)
      .setName("p1Left");
    this.p1Right = this.add
      .sprite(2476, 1677, "match_p1Right")
      .setDisplayOrigin(996, 1184)
      .setDepth(999)
      .setName("p1Right");

    // menu
    this.rpsText = this.add
      .sprite(1865, 395, "match_rps_text") // weird
      .setDepth(9999)
      .setName("rpsText");

    this.rpsRock = this.add
      .sprite(1929, 564, "match_rps_rock")
      .setOrigin(0, 0)
      .setDepth(999)
      .setName("rpsRock");

    this.rpsPaper = this.add
      .sprite(1584, 709, "match_rps_paper")
      .setOrigin(0, 0)
      .setDepth(9999)
      .setName("rpsPaper");

    this.rpsScissors = this.add
      .sprite(1513, 1057, "match_rps_scissors")
      .setOrigin(0, 0)
      .setDepth(9999)
      .setName("rpsScissors");

    loadAnims(ANIMS, this);

    this.p1Right.play("match_p1Right_wait");
    this.p2Body.play("match_p2Body_wait");
  }

  update() {}
}
