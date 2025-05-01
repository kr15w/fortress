import Phaser from "phaser";
import { loadAnims } from "./loadAnims";
import ANIMS from "./match_anims.json";

export default class Match extends Phaser.Scene {
  initGame() {
    this.state = {
      players: [],
      rounds: 0,
      p1Choice: null,
      p2Choice: null,
    };
  }
  addPlayer(p) {
    this.state.players.push(p);
  }
  constructor() {
    super("Match");
    this.initGame();
    // I am noogai
    this.addPlayer(new Player("noogai67"));
    this.addPlayer(new Player("discovry"));
  }

  init(data) {
    // Clean up any previous instance
    if (this.events) {
      this.events.removeAllListeners();
    }
    // Reset state
    this.initGame();
    // Remove any existing keyboard listeners
    if (this.input && this.input.keyboard) {
      this.input.keyboard.removeAllListeners();
    }
    // Clean up any existing sprites
    if (this.children) {
      this.children.removeAll();
    }
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

    this._createBackground();
    this._createPlayers();
    this._createRpsBtns();

    loadAnims(ANIMS, this);
    this.p1Right.play("match_p1Right_wait");
    this.p2Body.play("match_p2Body_wait");

    this.input.keyboard.on("keydown", this.onKeyDown);
  }
  onKeyDown() {
    console.log("owo");
  }
  _createBackground() {
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
  }

  _createPlayers() {
    // Player 2 (opponent)
    this.p2Body = this.add
      .sprite(1095, 239, "match_p2Body")
      .setOrigin(0, 0)
      .setDepth(1)
      .setName("p2Body");

    this.p2Hand = this.add
      .sprite(1144, 489, "match_p2Hand")
      .setDisplayOrigin(318, 184)
      .setName("p2Hand");

    // Player 1 (user)
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
  }

  _createRpsBtns() {
    this.rpsText = this.add
      .sprite(1865, 395, "match_rps_text")
      .setDepth(9999)
      .setName("rpsText");

    this.RockBtn = this.add
      .sprite(1929, 564, "match_rps_rock")
      .setOrigin(0, 0)
      .setDepth(999)
      .setName("RockBtn")
      .setInteractive()
      .on("pointerdown", () => {
        this._handleRpsClick("r");
      });

    this.PaperBtn = this.add
      .sprite(1584, 709, "match_rps_paper")
      .setOrigin(0, 0)
      .setDepth(9999)
      .setName("PaperBtn")
      .setInteractive()
      .on("pointerdown", () => {
        this._handleRpsClick("p");
      });

    this.ScissorsBtn = this.add
      .sprite(1513, 1057, "match_rps_scissors")
      .setOrigin(0, 0)
      .setDepth(9999)
      .setName("ScissorsBtn")
      .setInteractive()
      .on("pointerdown", () => {
        this._handleRpsClick("s");
      });
  }
  _showRpsButtons() {
    this.RockBtn.visible = true;
    this.PaperBtn.visible = true;
    this.ScissorsBtn.visible = true;
  }
  _hideRpsButtons() {
    this.RockBtn.visible = false;
    this.PaperBtn.visible = false;
    this.ScissorsBtn.visible = false;
  }
}
class Player {
  constructor(name) {
    this.name = name;
    this.hp = 0;
    this.shields = [];
    this.cannons = [];
    this.choice = null;
  }

  toString() {
    return `Player(name=${this.name}, hp=${this.hp}, shields=${this.shields}, cannons=${this.cannons})`;
  }

  onNotify(move) {
    console.log(`${this.name} received notification: ${move}`);
  }
}
