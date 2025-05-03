import Phaser from "phaser";
import { loadAnims } from "./loadAnims";
import ANIMS from "./match_anims.json";

/**
 * done add tie anim
 * @todo show more clearly what rps is chosen
 * @todo make everything prettier
 * @todo put buttons in a container
 * done buttons glow on hover
 */

const TowerActionTypes = {
  BUILD_TOWER: "bt",
  BUILD_SHIELD: "bs",
  BUILD_CANNON: "bc",
  ATTACK_TOWER: "at",
  ATTACK_CANNON: "ac",
  UPGRADE_SHIELD: "us",
  UPGRADE_CANNON: "ub",
};

function roundToNearest(num, nearest) {
  if (nearest === 0) return num;
  return Math.round(num / nearest) * nearest;
}

export default class Match extends Phaser.Scene {
  initGame() {
    this.state = {
      roundWinner: null,
      stage: "rpsStart",
      players: [],
      rounds: 0,
      p1RpsChoice: null,
      p2RpsChoice: null,
      roundWinnerChoice: null,
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
  }

  init(data) {
    this.initGame();
    this.addPlayer(new Player(this.povName));
    this.addPlayer(new Player("discovry"));

    this.input.on("pointerdown", (pointer) => {
      console.log("lmb 1 or rmb 2:", pointer.buttons);
    });
  }

  preload() {
    this.load.image("match_bg", "assets/match_bg.png");
    this.load.image("match_table", "assets/match_table.png");
    this.load.image("match_rps_rock", "assets/match_rps_rock.png");
    this.load.image("match_rps_paper", "assets/match_rps_paper.png");
    this.load.image("match_rps_scissors", "assets/match_rps_scissors.png");
    this.load.image("match_atkBtn", "assets/match_atkBtn.png");
    this.load.image("match_bldBtn", "assets/match_bldBtn.png");
    this.load.image("match_upgBtn", "assets/match_upgBtn.png");
    this.load.image("match_cannonBtn", "assets/match_cannonBtn.png");
    this.load.image("match_shieldBtn", "assets/match_shieldBtn.png");

    this.load.atlas(
      "match_p1Shield",
      "assets/match_p1Shield.png",
      "assets/match_p1Shield.json"
    );
    this.load.atlas(
      "match_p1Base",
      "assets/match_p1Base.png",
      "assets/match_p1Base.json"
    );
    this.load.atlas(
      "match_p2Base",
      "assets/match_p2Base.png",
      "assets/match_p2Base.json"
    );
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
    //this.createTable(); // optimize later
    this._createBases();
    this._createPlayers();
    this._createRpsBtns();
    this._createTowerBtns();
    this._createShields();

    //this.add.existing(new Button(this, 0, 0, "match_rps_rock"));

    loadAnims(ANIMS, this);
    this.p1Right.play("match_p1Right_wait");
    this.p2Body.play("match_p2Body_wait");

    //debug
    this.p1Base.setFrame("match_p1Base000" + this.state.players[0].hp);
    this.p2Base.setFrame("match_p2Base000" + this.state.players[1].hp);

    this.input.keyboard.on("keydown", (e) => this.onKeyDown(e));

    this.events.on("roundStart", () => {
      this.onRoundStart();
    });
    this.events.on("rpsResult", () => {
      this.onRpsResult();
    });
    this.events.on("towerStart", () => {
      this.onTowerStart();
    });

    this.events.emit("roundStart");
  }
  _createBases() {
    this.p1Base = this.add
      .sprite(736, 1107, "match_p1Base")
      .setOrigin(0, 0)
      .setDepth(10)
      .setName("p1Base");

    this.p2Base = this.add
      .sprite(1022, 525, "match_p2Base")
      .setOrigin(0, 0)
      .setDepth(10)
      .setName("p2Base");
  }
  _createShields() {
    this.p1Shields = [];
    /*
    // a working shield DDDDD:
    let shield = this.add
      .sprite(1280, 1438, "match_p1Shield")
      .setDisplayOrigin(817, 519)
      .setDepth(10)
      .setInteractive()
      .setVisible(false);

    const resizeHandler = (pointer) => {
      const distance = Phaser.Math.Distance.Between(
        shield.x,
        shield.y,
        pointer.x,
        pointer.y
      );
      const newScale = roundToNearest(
        Math.max(0.85, Math.min(1.5, distance / 500)),
        0.05
      );
      shield.setScale(newScale);
    };
    shield.setVisible(true);
    this.input.on("pointermove", resizeHandler);

    const confirmHandler = () => {
      this.input.off("pointermove", resizeHandler);
      this.input.off("pointerdown", confirmHandler);
      this.p1Shields.push(shield.scale);

      //alert(shield.scale);
    };

    this.input.once("pointerdown", confirmHandler);
    */
  }
  _createBackground() {
    this.bg = this.add
      .sprite(-19, -95, "match_bg")
      .setOrigin(0, 0)
      .setDepth(-99)
      .setName("bg");

    this.table = this.add
      .sprite(-80, 523, "match_table")
      .setOrigin(0, 0)
      .setDepth(9)
      .setName("table");
  }

  _createPlayers() {
    // Player 2 (opponent)
    this.p2Body = this.add
      .sprite(1095, 76, "match_p2Body")
      .setDisplayOrigin(17, 93)
      .setDepth(1)
      .setName("p2Body");

    this.p2Hand = this.add
      //why is it all around the place!!!!!!
      .sprite(1130, 350, "match_p2Hand")
      .setDisplayOrigin(313, 212)
      .setDepth(999)
      .setName("p2Hand");

    // Player 1 (user)
    this.p1Left = this.add
      .sprite(-496, 1208, "match_p1Left")
      .setDisplayOrigin(0, 759)
      .setDepth(999)
      .setAlpha(0.7, 0.7, 0.9, 0.7)
      .setName("p1Left");

    this.p1Right = this.add
      .sprite(1663, 520, "match_p1Right")
      .setDisplayOrigin(0, 65)
      .setDepth(999)
      .setName("p1Right");

    //anims arnt loaded yet
  }

  _createRpsBtns() {
    // Create container for RPS elements
    this.rpsContainer = this.add.container(0, 0);
    this.rpsContainer.setDepth(9999);

    this.rpsText = this.add
      .sprite(1762, 414, "match_rps_text")
      .setName("rpsText");
    this.rpsContainer.add(this.rpsText);

    this.rockBtn = new Button(this, 2105, 436, "match_rps_rock")
      .setOrigin(0, 0)
      .setName("rockBtn");
    this.rockBtn.on("pointerdown", () => {
      this.handleRpsInput("r", this.povName);
    });
    this.rpsContainer.add(this.rockBtn);

    this.paperBtn = new Button(this, 1748, 520, "match_rps_paper")
      .setOrigin(0, 0)
      .setName("paperBtn");
    this.paperBtn.on("pointerdown", () => {
      this.handleRpsInput("p", this.povName);
    });
    this.rpsContainer.add(this.paperBtn);

    this.scissorsBtn = new Button(this, 1663, 845, "match_rps_scissors")
      .setOrigin(0, 0)
      .setName("scissorsBtn");
    this.scissorsBtn.on("pointerdown", () => {
      this.handleRpsInput("s", this.povName);
    });
    this.rpsContainer.add(this.scissorsBtn);
  }

  _createTowerBtns() {
    // adds buttons that triggers TowerInput event
    // interactives are added in _showTowerButtons()

    this.atkBtn = new Button(this, 546, 389, "match_atkBtn")
      .setOrigin(0, 0)
      .setDepth(9999)
      .setName("atkBtn");

    this.bldBtn = new Button(this, 862, 559, "match_bldBtn")
      .setOrigin(0, 0)
      .setDepth(9999)
      .setName("bldBtn");

    this.upgBtn = new Button(this, 710, 922, "match_upgBtn")
      .setOrigin(0, 0)
      .setDepth(9999)
      .setName("upgBtn");

    this.cannonBtn = new Button(this, 910, 292, "match_cannonBtn")
      .setOrigin(0, 0)
      .setDepth(9999)
      .setName("cannonBtn");

    this.shieldBtn = new Button(this, 906, 579, "match_shieldBtn")
      .setOrigin(0, 0)
      .setDepth(9999)
      .setName("shieldBtn");
  }

  onRoundStart() {
    this.state.rounds++;
    this.state.stage = "rpsStart";
    this.state.p1RpsChoice = null;
    this.state.p2RpsChoice = null;
    this.state.roundWinner = null;

    console.log(this.state);

    this.p1Left.play("match_p1Left_wait"); //yea no
    this.p1Left.visible = false;
    this.p1Right.visible = true;
    this.p1Right.play("match_p1Right_wait");
    this.p2Body.play("match_p2Body_wait");
    this.p2Hand.play("match_p2Hand_wait");
    this._showRpsButtons();
    this._hideTowerButtons();
  }

  onRpsResult() {
    // Player visuals.
    this._hideRpsButtons();

    console.info(this.state.players);
    /*
    console.log(
      
    );*/
    this._decideWinner(this.state.p1RpsChoice, this.state.p2RpsChoice);
    // player visuals
    this.p1Right.play("match_p1Right_" + this.state.p1RpsChoice);
    this.p2Hand.play("match_p2Hand_" + this.state.p2RpsChoice);
    this.p2Body.play("match_p2Body_rps");

    this.time.addEvent({
      delay: 1500,
      callback: () => {
        console.log("decide winner", this.state.roundWinner);
        if (this.state.roundWinner == null) {
          //console.log("tie");
          //this.p1Left.play("match_p1Left_lose");
          //this.p1Right.play("match_p1Right_tie");
          this.p1Right.visible = false;
          this.p2Body.play("match_p2Body_tie");
          this.p2Hand.play("match_p2Hand_tie");
        } else if (this.state.roundWinner.name == this.povName) {
          //console.log("i win");
          //this.p1Left.play("match_p1Left_win");
          this.p1Right.play("match_p1Right_win");
          this.p2Body.play("match_p2Body_lose");
          this.p2Hand.play("match_p2Hand_lose");
        } else if (this.state.roundWinner.name == "discovry") {
          //console.log("i lose");
          //this.p1Left.play("match_p1Left_lose");
          this.p1Right.play("match_p1Right_lose");
          this.p2Body.play("match_p2Body_win");
          this.p2Hand.play("match_p2Hand_win");
        }
        this.time.addEvent({
          delay: 800,
          callback: () => {
            if (this.state.roundWinner == null) {
              this.events.emit("roundStart");
            } else {
              this.events.emit("towerStart");
            }
          },
        });
      },
      loop: false,
    });
  }

  onTowerStart() {
    /**An Rps winner must be determined. */
    // tower logic
    this.state.stage = "towerStart";
    console.log("tower start");

    if (this.state.roundWinner.name != this.povName) {
      this.p1Left.play("match_p1Left_wait");
      this.p1Right.play("match_p1Right_waitTower");
      this.p2Body.play("match_p2Body_think");
      this.p2Hand.play("match_p2Hand_think");
      //dont show buttons

      if (this.state.roundWinner.hp < 4) {
        console.log("auto build");
        this.handleTowerInput(
          TowerActionTypes.BUILD_TOWER,
          this.state.roundWinner.name
        );
        return;
      }
    } else {
      // i win
      this.p1Left.play("match_p1Left_think");
      this.p1Right.visible = false;
      this.p2Body.play("match_p2Body_wait");
      this.p2Hand.play("match_p2Hand_waitTower");

      // how to unrepeat this
      if (this.state.roundWinner.hp < 4) {
        console.log("auto build");
        this.handleTowerInput(
          TowerActionTypes.BUILD_TOWER,
          this.state.roundWinner.name
        );
        return;
      }
      this._showTowerButtons();
    }
  }
  _showTowerButtons() {
    //show the arm lel
    this.p1Left.visible = true;

    this.atkBtn
      .setInteractive({
        cursor: "pointer",
      })
      .on("pointerdown", () => {
        //player visulals
        this.atkBtn.off("pointerdown");
        this.atkBtn.removeInteractive();

        this.tweens.add({
          targets: this.atkBtn,
          x: 475,
          y: 294,
          ease: "Linear",
          duration: 300,
          onComplete: () => {
            //glow opp tower
            this.p2Base.tint(0xffffff);
            //this.p2Weapons.tine(0xffffff);
            // glow weapons
          },
        });
        // Attack base or cannon?

        if (null) {
          this.handleTowerInput(TowerActionTypes.ATTACK_TOWER, targetIdk);
        } else {
          this.handleTowerInput(TowerActionTypes.ATTACK_CANNON, this.povName);
        }
      });

    this.bldBtn
      .setInteractive({
        cursor: "pointer",
      })
      .on("pointerdown", () => {
        this.tweens.add({
          targets: this.bldBtn,
          x: 607,
          y: 362,
          ease: "Linear",
          duration: 100,
          onComplete: () => {
            // canon or shield
            this.cannonBtn.visible = true;
            this.shieldBtn.visible = true;
            this.cannonBtn
              .setInteractive({
                cursor: "pointer",
              })
              .on("pointerdown", () => {
                this.handleTowerInput(
                  TowerActionTypes.BUILD_CANNON,
                  this.povName
                );
              });

            this.shieldBtn
              .setInteractive({
                cursor: "pointer",
              })
              .on("pointerdown", () => {
                // a working shield DDDDD:
                let shield = this.add
                  .sprite(1280, 1438, "match_p1Shield")
                  .setDisplayOrigin(817, 519)
                  .setDepth(10)
                  .setInteractive()
                  .setVisible(true);

                const handleResize = (pointer) => {
                  const distance = Phaser.Math.Distance.Between(
                    shield.x,
                    shield.y,
                    pointer.x,
                    pointer.y
                  );
                  //Phaser.Math.Clamp(distance/500, 0.85, 1.5)
                  const newScale = roundToNearest(
                    Math.max(0.85, Math.min(1.5, distance / 500)),
                    0.05
                  );

                  this.cantAddShield = this.p1Shields.some(
                    (scale) => Math.abs(scale - newScale) <= 0.001
                  );

                  if (this.cantAddShield) {
                    console.log("dont overlap shields");
                    shield.setTint(0xff0000);
                    //return;r
                  } else {
                    shield.clearTint();
                  }
                  shield.setScale(newScale);
                };

                this.input.on("pointermove", handleResize);

                this.time.addEvent({
                  delay: 50, //stupid code
                  callback: () => {
                    const handleConfirm = () => {
                      if (!this.cantAddShield) {
                        this.input.off("pointermove", handleResize);
                        this.input.off("pointerdown", handleConfirm);
                        this.p1Shields.push(shield.scale); // this is for visuals only
                        this.handleTowerInput(
                          TowerActionTypes.BUILD_SHIELD,
                          shield.scale
                        );
                      }
                    };

                    this.input.on("pointerdown", handleConfirm);
                  },
                  loop: false,
                });
              });
          },
        });
      });
    this.upgBtn
      .setInteractive({
        cursor: "pointer",
      })
      .on("pointerdown", () => {
        this.handleRpsInput("p", this.povName);
      });

    // Hide all buttons first
    this.atkBtn.visible = false;
    this.bldBtn.visible = true;
    this.upgBtn.visible = false;

    // Reset positions of buttons to their initial positions
    this.atkBtn.setPosition(546, 389);
    this.bldBtn.setPosition(862, 559);
    this.upgBtn.setPosition(710, 922);

    console.log(this.state.roundWinner);

    // Show buttons based on available options
    if (this.state.roundWinner.cannons.length === 0) {
      // No cannons - can only build
      this.bldBtn.visible = true;
    } else {
      // Yes cannons - can do everything
      this.atkBtn.visible = true;
      this.bldBtn.visible = true;
      this.upgBtn.visible = true;
    }
  }
  _hideTowerButtons() {
    this.atkBtn.visible = false;
    this.bldBtn.visible = false;
    this.upgBtn.visible = false;

    this.cannonBtn.visible = false;
    this.shieldBtn.visible = false;
  }

  _decideWinner(p1RpsChoice, p2RpsChoice) {
    console.info(this.state.players);

    if (p1RpsChoice == p2RpsChoice) {
      this.state.roundWinner = null;
      return -1;
    } else if (
      (p1RpsChoice == "r" && p2RpsChoice == "s") ||
      (p1RpsChoice == "p" && p2RpsChoice == "r") ||
      (p1RpsChoice == "s" && p2RpsChoice == "p")
    ) {
      this.state.roundWinner = this.state.players[0];
      return 0;
    } else {
      this.state.roundWinner = this.state.players[1];
      return 1;
    }
  }

  onKeyDown(e) {
    //Thesea re all temporareeie
    if (this.state.stage == "rpsStart") {
      if (["r", "p", "s"].includes(e.key)) {
        this.handleRpsInput(e.key, "discovry");
      }
    } else if (this.state.stage == "towerStart") {
      if (["b", "a", "u"].includes(e.key)) {
        this.handleTowerInput(e.key, "discovry");
      }
    }
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
      this.state.p1RpsChoice = choice;
    } else {
      this.state.p2RpsChoice = choice;
    }
    console.log(this.state.p1RpsChoice, this.state.p2RpsChoice);

    /**Quasi server logic.
     * Called everytime an rps input is received. */
    if (this.state.p1RpsChoice && this.state.p2RpsChoice) {
      this.state.stage = "rpsResult";
      this.events.emit("rpsResult");
    }
  }
  handleTowerInput(towerAction, info) {
    /**called only during towerStart event.
     * Sends message to quasi server.
     */
    if (!Object.values(TowerActionTypes).includes(towerAction)) {
      console.warn("invalid towerAction");
      return;
    }

    // saves input to server.
    //both atker and victim should know this actoin
    console.info("tower input: " + towerAction);
    //this.events.emit("towerResult", towerAction);

    /**Quasi server logic.
     * Called everytime an rps input is received. */
    switch (towerAction) {
      case TowerActionTypes.BUILD_TOWER:
        console.log("build tower");
        this.state.roundWinner.hp += 1;

        //update visuasl
        if (this.state.roundWinner.name == this.povName) {
          this.p1Base.setFrame("match_p1Base000" + this.state.roundWinner.hp);
        } else {
          this.p2Base.setFrame("match_p2Base000" + this.state.roundWinner.hp);
        }
        break;
      case TowerActionTypes.BUILD_SHIELD:
        console.log("build shield, scale: " + info);
        this.state.roundWinner.hp += 1;

        // shield upgrades are SCRAPPED!!!

        break;
      case TowerActionTypes.BUILD_CANNON:
        console.log("info: ", info);
        break;
      case TowerActionTypes.ATTACK_TOWER:
        console.log("info: ", info);
        break;
      case TowerActionTypes.ATTACK_CANNON:
        console.log("info: ", info);
        break;
      case TowerActionTypes.UPGRADE_SHIELD:
        console.log("info: ", info);
        break;
      case TowerActionTypes.UPGRADE_CANNON:
        console.log("info: ", info);
        break;
      default:
        alert("Invalid action");
        break;
    }
    this.events.emit("roundStart");
  }
  _showRpsButtons() {
    // Update to show container instead of individual elements
    this.rpsContainer.visible = true;
  }

  _hideRpsButtons() {
    // Update to hide container instead of individual elements
    this.rpsContainer.visible = false;
  }
}
class Player {
  constructor(name) {
    this.name = name;
    /***
     *
     *
     *
     *
     *
     *
     *
     *
     *
     *
     *
     *
     * change this hp
     *
     *
     *
     *
     *
     *
     *
     *
     */
    this.hp = 4;
    //this.shields = [];
    this.cannons = [];
    this.choice = null;
  }

  toString() {
    return `Player(name=${this.name}, hp=${this.hp}, cannons=${this.cannons})`;
  }

  onNotify(move) {
    console.log(`${this.name} received notification: ${move}`);
  }
}
class Button extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);
    this.setInteractive({ cursor: "pointer" });
    this.setAlpha(0.7);
    this.on("pointerover", () => {
      this.setAlpha(1);
    });
    this.on("pointerout", () => {
      this.setAlpha(0.7);
    });

    scene.add.existing(this);
  }
}
