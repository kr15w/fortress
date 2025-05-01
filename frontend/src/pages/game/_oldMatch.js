import Phaser from "phaser";
import { loadAnims } from "./loadAnims";
import ANIMS from "./match_anims.json";

export default class Match extends Phaser.Scene {
  constructor() {
    super("Match");

    //Updated by server?

    this.initGame();
    this.povIndex = 0; // I am noogai
    this.oppIndex = 1 - this.povIndex; // enemy is discovry
    this.addPlayer(new Player("noogai67"));
    this.addPlayer(new Player("discovry"));
  }

  init(data) {
    // Clean up any previous instance
    if (this.events) {
      this.events.removeAllListeners();
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

    // Add event listeners after scene is initialized
    this.events.on("rpsPhaseStart", this._onRpsPhaseStart);
    this.events.on("towerPhaseStart", this._onTowerPhaseStart);

    // for p2 input
    this.input.keyboard.on("keydown", (e) => {
      if (!e.repeat) {
        if (this.state.phase == "rps") {
          if (e.key != "r" && e.key != "p" && e.key != "s") return;
          const choice = e.key;
          const player = this.state.players[this.oppIndex];
          this._processRpsChoice(player, choice);
        } else {
        }
      }
    });
    loadAnims(ANIMS, this);
    this.p1Right.play("match_p1Right_wait");
    this.p2Body.play("match_p2Body_wait");

    this.events.emit("rpsPhaseStart");
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

  _createTowerBtns() {
    this.buildBtn;
    this.atkBtn;
    this.upgBtn;
  }

  // ====== Event Handlers =======

  // Phase handlers
  _onRpsPhaseStart() {
    this._showRpsButtons();
    this._hideRpsButtons();
    this.state.waitingForInput = true;
  }

  // Input handlers
  _handleRpsClick(choice) {
    if (this.state.phase !== "rps") return;

    const player = this.state.players[this.povIndex];
    this._processRpsChoice(player, choice);
  }
  // Game state update handlers
  _processRpsChoice(player, choice) {
    // choice = r p s
    if (player === this.state.players[0]) {
      this.state.p1Choice = choice;
    } else {
      this.state.p2Choice = choice;
    }

    if (this.state.p1Choice && this.state.p2Choice) {
      this._resolveRpsRound();
    }
  }

  // Visual update handlers
  handleRpsResult(result) {
    console.log(result);
    // Add animations here
  }
  _updatePlayerDisplays() {}

  update() {
    // This is called every frame...
    if (this.state.gameOver) {
      this.handleGameOver();
      return;
    }

    if (this.state.phase === "rps" && !this.state.waitingForInput) {
      this.events.emit("rpsPhaseStart");
    }

    if (this.state.phase === "tower" && !this.state.waitingForInput) {
      this.events.emit("towerPhaseStart");
    }
  }

  // game logics
  initGame() {
    this.state = {
      phase: "rps",
      waitingForInput: true,
      p1Choice: null,
      p2Choice: null,
      players: [],
      roundWinner: null,
      roundLoser: null,
      finalWinner: null,
      rounds: 0,
      gameOver: false,
    };
  }
  addPlayer(player) {
    this.state.players.push(player);
  }

  removePlayer(playerIndex) {
    this.state.players.splice(playerIndex, 1);
  }

  notify(msg) {
    for (p of this.state.players) {
      p.onNotify(msg);
    }
  }
  /*
  decideWinner(p1Choice, p2Choice) {
    if (p1Choice === p2Choice) {
      console.log("draw");
      this.state.roundWinner = null;
      this.state.roundLoser = null;
      return -1;
    }

    const wins = {
      r: "s",
      s: "p",
      p: "r",
    };

    if (wins[p1Choice] === p2Choice) {
      console.log("p1 wins");
      this.state.roundWinner = this.state.players[0];
      this.state.roundLoser = this.state.players[1];
      return 0;
    } else {
      console.log("p2 wins");
      this.state.roundWinner = this.state.players[1];
      this.state.roundLoser = this.state.players[0];
      return 1;
    }
  }

  handleBuild(bldAction) {
    const action = bldAction.action;
    if (
      ![
        TowerActionTypes.BUILD_CANNON,
        TowerActionTypes.BUILD_SHIELD,
        TowerActionTypes.BUILD_TOWER,
      ].includes(action)
    ) {
      throw new Error("Invalid type");
    }

    if (!this.state.roundWinner || !this.state.roundLoser) {
      console.log("no winner");
      return;
    }

    if (action === TowerActionTypes.BUILD_SHIELD) {
      this.state.roundWinner.shields.push(new Shield());
    } else if (action === TowerActionTypes.BUILD_CANNON) {
      this.state.roundWinner.cannons.push(new Cannon());
    } else if (action === TowerActionTypes.BUILD_TOWER) {
      if (this.state.roundWinner.hp >= 4)
        throw new Error("tower already complete");
      this.state.roundWinner.hp += 1;
    }
  }

  handleAttack(atkAction) {
    const action = atkAction.action;
    const atkIndex = atkAction.target[0];
    const targetIndex =
      action === TowerActionTypes.ATTACK_CANNON ? atkAction.target[1] : null;

    if (
      ![TowerActionTypes.ATTACK_CANNON, TowerActionTypes.ATTACK_TOWER].includes(
        action
      )
    ) {
      throw new Error("Invalid type");
    }

    if (!this.state.roundWinner || !this.state.roundLoser) {
      console.log("no winner");
      return;
    }

    const attacker = this.state.roundWinner;
    const target = this.state.roundLoser;

    if (attacker.cannons.length === 0) throw new Error("no cannons");

    if (action === TowerActionTypes.ATTACK_TOWER) {
      if (target.shields.length > 0) {
        if (target.shields[target.shields.length - 1].hp > 0) {
          target.shields[target.shields.length - 1].hp -= 1;
        } else {
          target.shields.pop();
        }
      } else {
        target.hp -= 1;
      }

      if (target.hp < 0) {
        console.log(target.hp);
        console.log(target, "died!");
        this.state.gameOver = true;
        return;
      }
    } else if (action === TowerActionTypes.ATTACK_CANNON) {
      target.cannons.splice(targetIndex, 1);
    }
  }

  handleUpgrade(upgAction) {
    const action = upgAction.action;
    const index = upgAction.target[0];

    if (
      ![
        TowerActionTypes.UPGRADE_CANNON,
        TowerActionTypes.UPGRADE_SHIELD,
      ].includes(action)
    ) {
      throw new Error("Invalid type");
    }

    if (!this.state.roundWinner || !this.state.roundLoser) {
      console.log("no winner");
      return;
    }

    if (action === TowerActionTypes.UPGRADE_SHIELD) {
      if (index < 0 || index >= this.state.roundWinner.shields.length)
        throw new Error("Invalid index");
      this.state.roundWinner.shields[index].hp += 1;
    } else if (action === TowerActionTypes.UPGRADE_CANNON) {
      if (index < 0 || index >= this.state.roundWinner.cannons.length)
        throw new Error("Invalid index");
      this.state.roundWinner.cannons[index].pow += 1;
    }
  }
*/
  // Player Input
  handleInputRps() {}
  // Player visuals
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

  _showTowerButtons() {
    if (this.state.roundWinner.hp < 4) {
      this.buildBtn.visible = true;
      this.atkBtn.visible = false;
      this.upgBtn.visible = false;
    } else {
      this.buildBtn.visible = true;
      this.atkBtn.visible = this.state.roundWinner.cannons.length > 0;
      this.upgBtn.visible =
        this.state.roundWinner.shields.length > 0 ||
        this.state.roundWinner.cannons.length > 0;
    }
  }
}

//translating flow.py to js yee

//message classes
class RpsAction {
  constructor(source, choice) {
    this.source = source;
    this.choice = choice;
  }
}

const TowerActionTypes = {
  BUILD_TOWER: "bt",
  BUILD_SHIELD: "bs",
  BUILD_CANNON: "bc",
  ATTACK_TOWER: "at",
  ATTACK_CANNON: "ac",
  UPGRADE_SHIELD: "us",
  UPGRADE_CANNON: "ub",
};

class TowerAction {
  constructor(source, action, target) {
    this.source = source;
    this.action = action;
    this.target = target;
  }
}

//objects
class Shield {
  constructor() {
    this.hp = 1;
  }

  toString() {
    return `Shield(hp=${this.hp})`;
  }
}

class Cannon {
  constructor() {
    this.pow = 1;
  }

  toString() {
    return `Cannon(pow=${this.pow})`;
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
