import Phaser from "phaser";
import { loadAnims } from "./loadAnims";
import ANIMS from "./match_anims.json";

export default class Match extends Phaser.Scene {
  initGame() {
    this.state = {
      stage: "rps",
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
    this.povName = "noogai67";

    this.addPlayer(new Player(this.povName));
    this.addPlayer(new Player("discovry"));
  }

  init(data) {
    this.initGame();
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

    this.input.keyboard.on("keydown", (e) => this.onKeyDown(e));

    this.events.on("roundStart", () => {
      this.onRoundStart();
    });
    this.events.on("rpsResult", () => {
      this.onRpsResult();
    });
    this.events.on("tower", () => {
      alert("towah");
    });

    this.events.emit("roundStart");
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
      // weird nums
      .sprite(968, 205, "match_p2Body")
      .setDisplayOrigin(0, 0)
      .setDepth(1)
      .setName("p2Body");

    this.p2Hand = this.add
      //why is it all around the place!!!!!!
      .sprite(995, 486, "match_p2Hand")
      .setDisplayOrigin(313, 182)
      .setDepth(999)
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

    //anims arnt loaded yet
  }

  _createRpsBtns() {
    // adds buttons that triggers RpsInput event
    this.rpsText = this.add
      .sprite(1865, 395, "match_rps_text")
      .setDepth(9999)
      .setName("rpsText");

    this.RockBtn = this.add
      .sprite(1929, 564, "match_rps_rock")
      .setOrigin(0, 0)
      .setDepth(999)
      .setName("RockBtn");
    this.RockBtn.setInteractive({
      cursor: "pointer",
    }).on("pointerdown", () => {
      this.handleRpsInput("r", this.povName);
    });

    this.PaperBtn = this.add
      .sprite(1584, 709, "match_rps_paper")
      .setOrigin(0, 0)
      .setDepth(9999)
      .setName("PaperBtn")
      .setInteractive({
        cursor: "pointer",
      })
      .on("pointerdown", () => {
        this.handleRpsInput("p", this.povName);
      });

    this.ScissorsBtn = this.add
      .sprite(1513, 1057, "match_rps_scissors")
      .setOrigin(0, 0)
      .setDepth(9999)
      .setName("ScissorsBtn")
      .setInteractive({
        cursor: "pointer",
      })
      .on("pointerdown", () => {
        this.handleRpsInput("s", this.povName);
      });
  }
  handleRpsInput(choice, playerName) {
    /**called only during roundStart event.
     * Sends message to quasi server.
     */
    if (choice != "r" && choice != "p" && choice != "s") {
      console.warn("invalid choice");
      return;
    }

    // saves input to server.
    if (this.povName == playerName) {
      this.state.p1Choice = choice;
    } else {
      this.state.p2Choice = choice;
    }
    console.log(this.state.p1Choice, this.state.p2Choice);

    /**Quasi server logic.
     * Called everytime an rps input is received. */
    if (this.state.p1Choice && this.state.p2Choice) {
      this.state.stage = "rpsResult";
      this.events.emit("rpsResult");
    }
  }
  checkRpsProceed() {}
  onRpsResult() {
    // Player visuals.
    this._hideRpsButtons();

    console.log(this._decideWinner(this.state.p1Choice, this.state.p2Choice));
    // player visuals
    this.p1Right.play("match_p1Right_" + this.state.p1Choice);
    this.p2Hand.play("match_p2Hand_" + this.state.p2Choice);
    this.p2Body.play("match_p2Body_rps");

    this.time.addEvent({
      delay: 1500,
      callback: () => {
        console.log("decide winner", this.state.roundWinner);
        if (this.state.roundWinner == this.povName) {
          console.log("i win");
          //this.p1Left.play("match_p1Left_win");
          this.p1Right.play("match_p1Right_win");
          this.p2Body.play("match_p2Body_lose");
          this.p2Hand.play("match_p2Hand_lose");
        } else if (this.state.roundWinner == "discovry") {
          console.log("i lose");
          //this.p1Left.play("match_p1Left_lose");
          this.p1Right.play("match_p1Right_lose");
          this.p2Body.play("match_p2Body_win");
          this.p2Hand.play("match_p2Hand_win");
        } else if (this.state.roundWinner == null) {
          console.log("draw");
          //this.p1Left.play("match_p1Left_lose");
          this.p1Right.play("match_p1Right_lose");
          this.p2Body.play("match_p2Body_lose");
          this.p2Hand.play("match_p2Hand_lose");
        }
        this.time.addEvent({
          delay: 800,
          callback: () => {
            this.events.emit("roundStart");
          },
        });
      },
      loop: false,
    });
  }

  _decideWinner(p1Choice, p2Choice) {
    if (p1Choice == p2Choice) {
      this.state.roundWinner = null;
      return -1;
    } else if (
      (p1Choice == "r" && p2Choice == "s") ||
      (p1Choice == "p" && p2Choice == "r") ||
      (p1Choice == "s" && p2Choice == "p")
    ) {
      this.state.roundWinner = this.povName;
      return 0;
    } else {
      this.state.roundWinner = "discovry";
      return 1;
    }
  }

  onKeyDown(e) {
    //Thesea re all temporareeie
    if (this.state.stage == "rps") {
      if (e.key == "r") {
        this.handleRpsInput("r", "discovry");
      } else if (e.key == "p") {
        this.handleRpsInput("p", "discovry");
      } else if (e.key == "s") {
        this.handleRpsInput("s", "discovry");
      }
    }
  }

  onRoundStart() {
    this.state.rounds++;
    this.state.stage = "rps";
    this.state.p1Choice = null;
    this.state.p2Choice = null;

    console.log(this.state);

    //this.p1Left;
    this.p1Right.play("match_p1Right_wait");
    this.p2Body.play("match_p2Body_wait");
    this.p2Hand.play("match_p2Hand_wait");
    this._showRpsButtons();
  }

  _showRpsButtons() {
    // show buttons that emit rps input event
    this.rpsText.visible = true;
    this.RockBtn.visible = true;
    this.PaperBtn.visible = true;
    this.ScissorsBtn.visible = true;
  }
  _hideRpsButtons() {
    this.rpsText.visible = false;
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
