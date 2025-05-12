import Phaser from "phaser";
import { loadAnims } from "./loadAnims";
import ANIMS from "./match_anims.json";

/**
 * done add tie anim
 * @todo p2 shielld!!!!!!!!!
 * @todo add rmb to cansel
 * @todo how to calculate p2 shield??????????????????????????????????????
 * done show more clearly what rps is chosen
 * @todo make everything prettier
 * done put buttons in a container
 * done buttons glow on hover
 */
const SCENE_H = 1440;
const SCENE_W = 2560;

const TowerActionTypes = {
	BUILD_TOWER: "bt",
	BUILD_SHIELD: "bs",
	BUILD_CANNON: "bc",
	ATTACK_TOWER: "at",
	ATTACK_CANNON: "ac",
	//UPGRADE_SHIELD: "us",
	UPGRADE_CANNON: "uc",
};

function roundToNearest(num, nearest) {
	if (nearest === 0) return num;
	return Math.round(num / nearest) * nearest;
}

export default class Match extends Phaser.Scene {
	initGame() {
		console.info("initGame() called");
		this.state = {
			roundWinner: null,
			roundLoser: null,
			stage: "rpsStart",
			players: [],
			rounds: 0,
			p1RpsChoice: null,
			p2RpsChoice: null,
			roundWinnerChoice: null,
			cannonCount: 0,
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

		/*
    this.input.on("pointerdown", (pointer) => {
      console.log("lmb 1 or rmb 2:", pointer.buttons);
    });*/
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
		this.load.image("match_chooseCannon", "assets/match_chooseCannon.png");

		this.load.atlas(
			"match_targetCannon",
			"assets/match_targetCannon.png",
			"assets/match_targetCannon.json"
		);

		this.load.atlas(
			"match_targetBase",
			"assets/match_targetBase.png",
			"assets/match_targetBase.json"
		);

		this.load.atlas(
			"match_p2Cannon",
			"assets/match_p2Cannon.png",
			"assets/match_p2Cannon.json"
		);
		this.load.atlas(
			"match_p1Cannon",
			"assets/match_p1Cannon.png",
			"assets/match_p1Cannon.json"
		);
		this.load.atlas(
			"match_p2Shield",
			"assets/match_p2Shield.png",
			"assets/match_p2Shield.json"
		);
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
		console.info("create() called");
		const SCENE_W = this.sys.game.canvas.width;
		const SCENE_H = this.sys.game.canvas.height;

		this._createBackground();
		//this.createTable(); // optimize later
		this._createBases();
		this._createPlayers();
		this._createTowerBtns();

		// Create containers for game objects
		this.p1Cannons = this.add
			.container(0, 0)
			.setDepth(10)
			.setName("p1CannonsContainer");
		this.p2Cannons = this.add
			.container(0, 0)
			.setDepth(10)
			.setName("p2CannonsContainer");

		// selct use which cannon to atk
		this.cannonSelectors = this.add
			.container(0, 0)
			.setName("cannonSelectorsContainer")
			.setDepth(10000);

		this.p1Shields = [];
		this.p2Shields = [];

		this.targets = this.add
			.container(0, 0)
			.setDepth(9999)
			.setName("targetsContainer");
		this.rpsButtons = this.add
			.container(0, 0)
			.setName("rps contaienr")
			.setDepth(9999);

		loadAnims(ANIMS, this);
		this.p1Right.play("match_p1Right_wait");
		this.p2Body.play("match_p2Body_wait");

		//todo centralize visuals
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
		this.events.on("towerResultBuildTower", (data) => {
			this.onTowerResultBuildTower(data.info, data.state);
		});
		this.events.on("towerResultBuildCannon", (data) => {
			this.onTowerResultBuildCannon(data.info, data.state);
		});
		this.events.on("towerResultBuildShield", (data) => {
			this.onTowerResultBuildShield(data.info, data.state);
		});
		this.events.on("towerResultAttackTower", (data) => {
			this.onTowerResultAttackTower(data.info, data.state);
		});
		this.events.on("towerResultAttackCannon", (data) => {
			this.onTowerResultAttackCannon(data.info, data.state);
		});
		this.events.on("towerResultUpgradeCannon", (data) => {
			this.onTowerResultUpgradeCannon(data.info, data.state);
		});
		this.events.on("gameOver", () => {
			this.onGameOver();
		});

		this.events.emit("roundStart");
	}

	_createBases() {
		this.p1Base = this.add
			.sprite(736, 1107, "match_p1Base")
			.setOrigin(0, 0)
			.setDepth(10)
			.setName("p1Base");
		const hitShape = new Phaser.Geom.Polygon([
			12,
			303,
			150,
			0,
			1083 - 150,
			0,
			1083 - 12,
			303,
		]);
		this.p1Base.setInteractive(hitShape, Phaser.Geom.Polygon.Contains);

		this.p2Base = this.add
			.sprite(1022, 525, "match_p2Base")
			.setOrigin(0, 0)
			.setDepth(10)
			.setName("p2Base");

		// Create debug graphics for showing bounds
		this.debugGraphics = this.add.graphics();
		this.debugGraphics.setDepth(10000); // Make sure it's visible above everything

		// Draw the p1Base hitArea polygon
		this.debugGraphics.lineStyle(2, 0xff00ff, 1);
		const polygon = this.p1Base.input.hitArea;
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
		console.info("_createRpsBtns() called");
		this.rpsButtons.removeAll(true);
		this.rpsText = this.add
			.sprite(1762, 414, "match_rps_text")
			.setName("rpsText");
		this.rpsButtons.add(this.rpsText);

		this.rockBtn = new Button(this, 2105, 436, "match_rps_rock").setName(
			"rockBtn"
		);
		this.rockBtn.once("pointerdown", () => {
			this.handleRpsInput("r", this.povName);
		});
		this.rpsButtons.add(this.rockBtn);

		this.paperBtn = new Button(this, 1748, 520, "match_rps_paper").setName(
			"paperBtn"
		);
		this.paperBtn.once("pointerdown", () => {
			this.handleRpsInput("p", this.povName);
		});
		this.rpsButtons.add(this.paperBtn);

		this.scissorsBtn = new Button(
			this,
			1663,
			845,
			"match_rps_scissors"
		).setName("scissorsBtn");
		this.scissorsBtn.once("pointerdown", () => {
			this.handleRpsInput("s", this.povName);
		});
		this.rpsButtons.add(this.scissorsBtn);
	}

	_createTowerBtns() {
		console.info("_createTowerBtns() called");
		// adds buttons that triggers TowerInput event
		// interactives are added in _showTowerButtons() {

		this.atkBtn = new Button(this, 546, 389, "match_atkBtn").setName("atkBtn");

		this.bldBtn = new Button(this, 862, 559, "match_bldBtn").setName("bldBtn");

		this.upgBtn = new Button(this, 710, 922, "match_upgBtn").setName("upgBtn");

		this.cannonBtn = new Button(this, 910, 292, "match_cannonBtn").setName(
			"cannonBtn"
		);

		this.shieldBtn = new Button(this, 906, 579, "match_shieldBtn").setName(
			"shieldBtn"
		);
	}

	onRoundStart() {
		//update shi
		this.state.rounds++;
		this.state.stage = "rpsStart";
		this.state.p1RpsChoice = null;
		this.state.p2RpsChoice = null;
		this.state.roundWinner = null;
		this.state.roundLoser = null;

		console.log("round start", this.state);

		this.p1Left.play("match_p1Left_wait"); //yea no
		this.p1Left.visible = false;
		this.p1Right.visible = true;
		this.p1Right.play("match_p1Right_wait");
		this.p2Body.play("match_p2Body_wait");
		this.p2Hand.play("match_p2Hand_wait");
		this.targets.removeAll(true);
		this.cannonSelectors.removeAll(true);
		this.rpsButtons.removeAll(true);

		this._createRpsBtns();
		this._hideTowerButtons();
	}

	onRpsResult() {
		console.info("show rps result");

		// Player visuals.
		this._hideRpsButtons();

		console.info(this.state.players);
		this._decideWinner(this.state.p1RpsChoice, this.state.p2RpsChoice);
		// player visuals
		this.p1Right.play("match_p1Right_" + this.state.p1RpsChoice);
		this.p2Hand.play("match_p2Hand_" + this.state.p2RpsChoice);
		this.p2Body.play("match_p2Body_rps");

		//todo change
		this.time.addEvent({
			delay: 800,
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
					delay: 500,
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
		console.info("choose tower options");

		/**An Rps winner must be determined. */
		// tower logic
		this.state.stage = "towerStart";
		console.log("tower start");

		if (this.state.roundWinner.name != this.povName) {
			//i lose, watch opponent think
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

	onTowerResultBuildTower(info, state) {
		// Client function that receives updates from the server and updates the visuals
		console.log("Client: Updating tower visuals based on server state");

		// Update the HP display for both players
		if (state.players[0].hp <= 4) {
			console.log("Client: Updating player 1 base to HP", state.players[0].hp);
			this.p1Base.setFrame("match_p1Base000" + state.players[0].hp);
		}
		if (state.players[1].hp <= 4) {
			console.log("Client: Updating player 2 base to HP", state.players[1].hp);
			this.p2Base.setFrame("match_p2Base000" + state.players[1].hp);
		}

		// Start the next round
		this.events.emit("roundStart");
	}

	onTowerResultBuildShield(info, state) {
		// Client function that receives updates from the server and updates the visuals
		console.log("Client: Updating shield visuals based on server state");

		// Check which player is the round winner and update their shield visuals
		if (state.roundWinner && state.roundWinner.name === "discovry") {
			// Player 2 is the winner, add shield to p2Shields container
			console.log(
				"Client: Adding shield for player 2 with scale",
				info.scaleX,
				info.scaleY
			);
			const p2Shield = this.add
				.sprite(1280, 526, "match_p2Shield")
				.setDisplayOrigin(283, 203)
				.setName("p2shield_" + this.p2Shields.length)
				.setScale(info.scaleX, info.scaleY)
				.setDepth(10);
			this.p2Shields.push(p2Shield);
		} else if (state.roundWinner && state.roundWinner.name === this.povName) {
			// Player 1 is the winner, add shield to p1Shields
			// Note: The actual shield sprite is created during user interaction
			console.log(
				"Client: Player 1 shield registered with scale",
				info.scaleX,
				info.scaleY
			);
		}

		// Start the next round
		this.events.emit("roundStart");
	}

	onTowerResultBuildCannon(info, state) {
		// Client function that receives updates from the server and updates the visuals
		console.log("Client: Updating cannon visuals based on server state");

		// Check which player is the round winner and update their cannon visuals
		if (state.roundWinner && state.roundWinner.name != this.povName) {
			// Player 2 is the winner, add cannon to p2Cannons container
			console.log("Client: Adding cannon for player 2 at position", info.x);

			// Server sends the x pos of pov, calculate opponent x pos
			let oppX = mapRange(info.x, 30, SCENE_W - 30, 910, SCENE_W - 910);
			oppX += 2 * (1280 - oppX);

			// Don't draw into the base
			if (oppX > 1010 && oppX < 1561) {
				if (oppX > 1280) {
					oppX = 1561;
				} else {
					oppX = 1010;
				}
			}

			// Create the cannon sprite and add it to the container
			const oppCannon = this.add
				.sprite(oppX, 558, "match_p2Cannon")
				.setDisplayOrigin(107, 154)
				.setDepth(10)
				.setVisible(true);

			// Store the cannon's ID for later reference
			if (state.roundWinner.cannons.length > 0) {
				const latestCannon =
					state.roundWinner.cannons[state.roundWinner.cannons.length - 1];
				oppCannon.id = latestCannon.id;
				oppCannon.pow = latestCannon.pow;
				console.log(
					"Client: Cannon added with ID",
					oppCannon.id,
					"and power",
					oppCannon.pow
				);
			}

			// Add the cannon to the container
			this.p2Cannons.add(oppCannon);
		} else {
			// Player 1 is the winner, update cannon in p1Cannons if needed
			// Note: The actual cannon sprite is usually created during user interaction
			console.log("Client: Player 1 cannon registered at position", info.x);
			// After the server processes the request, update the cannon with its ID
			console.warn(
				this.p1Cannons,
				this.p1Cannons.list[this.p1Cannons.list.length - 1]
			);
			const latestCannon = this.p1Cannons.list[this.p1Cannons.list.length - 1];
			latestCannon.id = state.cannonCount++;
			latestCannon.pow = latestCannon.pow;
			console.warn(
				"Client: Player 1 cannon assigned ID",
				latestCannon.id,
				"and power",
				latestCannon.pow
			);
		}

		// Start the next round
		this.events.emit("roundStart");
	}

	onTowerResultAttackTower(info, state) {
		// Client function that receives updates from the server and updates the visuals
		console.log("Client: Updating tower attack visuals based on server state");
		console.log("Attack info:", info);

		// Check if game is over
		if (state.roundLoser.hp < 0) {
			console.log("Client: Game over detected");
			this.events.emit("gameOver");
			return;
		}

		// Get the attacker index, preferring attackerIndex if available, falling back to cannonId for backward compatibility
		const attackerIndex =
			info.attackerIndex !== undefined ? info.attackerIndex : info.id || 0;

		// Highlight the attacking cannon (tint it blue)
		if (state.roundWinner.name === this.povName) {
			// Player 1's cannon is attacking
			if (this.p1Cannons.list[attackerIndex]) {
				console.log(
					"Client: Highlighting player 1 attacking cannon at index",
					attackerIndex
				);
				this.p1Cannons.list[attackerIndex].setTint(0x0000ff); // Blue tint

				// Clear the tint after 1 second
				this.time.delayedCall(1000, () => {
					if (this.p1Cannons.list[attackerIndex]) {
						this.p1Cannons.list[attackerIndex].clearTint();
					}
				});
			}
		} else {
			// Player 2's cannon is attacking
			if (this.p2Cannons.list[attackerIndex]) {
				console.log(
					"Client: Highlighting player 2 attacking cannon at index",
					attackerIndex
				);
				this.p2Cannons.list[attackerIndex].setTint(0x0000ff); // Blue tint

				// Clear the tint after 1 second
				this.time.delayedCall(1000, () => {
					if (this.p2Cannons.list[attackerIndex]) {
						this.p2Cannons.list[attackerIndex].clearTint();
					}
				});
			}
		}

		// Update shield visuals - remove the outermost shield if any exist
		if (state.roundLoser.name != this.povName) {
			// Player 2 lost a shield
			if (this.p2Shields.length > 0) {
				const outerShield = this.p2Shields.shift();
				console.log("Client: Removing player 2 shield", outerShield);

				// Make sure the shield is a valid Phaser game object before destroying
				if (outerShield && typeof outerShield.destroy === "function") {
					outerShield.destroy();
				} else {
					console.error(
						"Invalid shield object in p2Shields array",
						outerShield
					);
				}
			}
		} else {
			// Player 1 lost a shield
			if (this.p1Shields.length > 0) {
				const outerShield = this.p1Shields.shift();
				console.log("Client: Removing player 1 shield", outerShield);

				// Make sure the shield is a valid Phaser game object before destroying
				if (outerShield && typeof outerShield.destroy === "function") {
					outerShield.destroy();
				} else {
					console.error(
						"Invalid shield object in p1Shields array",
						outerShield
					);
				}
			}
		}

		// Update base visuals with current HP
		console.log(
			"Client: Updating base HP visuals",
			state.players[0].hp,
			state.players[1].hp
		);
		if (state.players[0].hp <= 4) {
			this.p1Base.setFrame("match_p1Base000" + state.players[0].hp);
		}
		if (state.players[1].hp <= 4) {
			this.p2Base.setFrame("match_p2Base000" + state.players[1].hp);
		}

		this.targets.removeAll(true);
		this.events.emit("roundStart");
	}

	onTowerResultAttackCannon(info, state) {
		/*TowerActionTypes.ATTACK_CANNON, {
			// 
			attackerCannonId: attackerCannonId,
			targetCannonId: targetCannonId,

			// Fallback to indices for backward compatibility
			attackerIndex: p1Index,
			target: p2Index,
		}*/
		// Client function that receives updates from the server and updates the visuals
		console.log("Client: Updating cannon attack visuals based on server state");
		console.log("Client: Attack info:", info);

		// Highlight the attacking cannon (tint it blue)
		const attackerIndex =
			info.attackerIndex !== undefined ? info.attackerIndex : 0;
		const attackerCannonId = info.attackerCannonId;

		// Determine which player is attacking
		if (state.roundWinner.name === this.povName) {
			// Player 1 is attacking
			if (this.p1Cannons.list[attackerIndex]) {
				console.log(
					"Client: Highlighting player 1 attacking cannon at index",
					attackerIndex
				);
				this.p1Cannons.list[attackerIndex].setTint(0x0000ff); // Blue tint

				// Clear the tint after 1 second
				this.time.delayedCall(1000, () => {
					if (this.p1Cannons.list[attackerIndex]) {
						this.p1Cannons.list[attackerIndex].clearTint();
					}
				});
			}
		} else {
			// Player 2 is attacking
			if (this.p2Cannons.list[attackerIndex]) {
				console.log(
					"Client: Highlighting player 2 attacking cannon at index",
					attackerIndex
				);
				this.p2Cannons.list[attackerIndex].setTint(0x0000ff); // Blue tint

				// Clear the tint after 1 second
				this.time.delayedCall(1000, () => {
					if (this.p2Cannons.list[attackerIndex]) {
						this.p2Cannons.list[attackerIndex].clearTint();
					}
				});
			}
		}

		// Highlight and remove the target cannon
		const targetIndex = info.target !== undefined ? info.target : -1;

		if (targetIndex >= 0) {
			// Determine which player's cannon is being targeted
			if (state.roundLoser.name === "discovry") {
				// Player 2's cannon is being destroyed
				if (this.p2Cannons.list[targetIndex]) {
					console.log("Client: Removing player 2 cannon at index", targetIndex);

					// Highlight the target cannon (tint it red) before destroying
					this.p2Cannons.list[targetIndex].setTint(0xff0000); // Red tint

					// Destroy after a short delay for visual effect
					this.time.delayedCall(500, () => {
						if (this.p2Cannons.list[targetIndex]) {
							this.p2Cannons.list[targetIndex].destroy();
						}
					});
				}
			} else if (state.roundLoser.name === this.povName) {
				// Player 1's cannon is being destroyed
				if (this.p1Cannons.list[targetIndex]) {
					console.log("Client: Removing player 1 cannon at index", targetIndex);

					// Highlight the target cannon (tint it red) before destroying
					this.p1Cannons.list[targetIndex].setTint(0xff0000); // Red tint

					// Destroy after a short delay for visual effect
					this.time.delayedCall(500, () => {
						if (this.p1Cannons.list[targetIndex]) {
							this.p1Cannons.list[targetIndex].destroy();
						}
					});
				}
			}
		}

		// Start the next round after a short delay to allow for visual effects
		this.time.delayedCall(1000, () => {
			this.events.emit("roundStart");
		});
	}

	onTowerResultUpgradeCannon(info, state) {
		// Client function that receives updates from the server and updates the visuals
		console.log(
			"Client: Updating cannon upgrade visuals based on server state"
		);
		console.log("Upgrade info:", info); //id: cannon id
		// Find the cannon data that was upgraded
		let upgradedCannon = state.roundWinner.cannons.find(
			(cannon) => cannon.id === info.id
		);
		let upgradedCannonSprite;
		//upgrade the sprites too
		if (state.roundWinner != this.povName) {
			upgradedCannonSprite = this.p2Cannons.list.find(
				(cannon) => cannon.id === info.id
			);
		} else {
			upgradedCannonSprite = this.p1Cannons.list.find(
				(cannon) => cannon.id === info.id
			);
		}

		console.warn("uwuwuwuwuwu", upgradedCannon, upgradedCannonSprite.pow);

		upgradedCannonSprite.pow = upgradedCannon.pow;
		// Find the cannon in the state data
		if (state.roundWinner && state.roundWinner.cannons) {
			console.log(
				"Client: Found cannon to upgrade with power",
				upgradedCannon.pow
			);
		}

		if (upgradedCannon) {
			const pow = upgradedCannonSprite.pow;

			// Update the visual appearance based on power (max frame is 7)
			if (pow <= 7) {
				if (state.roundWinner.name != this.povName) {
					// Player 2's cannon

					console.log("Client: Upgrading player 2 cannon to power", pow);

					// Highlight the cannon being upgraded
					upgradedCannonSprite.setTint(0x00ff00);
					upgradedCannonSprite.setFrame("match_p2Cannon000" + (pow - 1));

					// Clear the tint after a short delay
					this.time.delayedCall(1000, () => {
						upgradedCannonSprite?.clearTint();
					});
				} else {
					// Player 1's cannon

					console.log("Client: Upgrading player 1 cannon to power", pow);

					// Highlight the cannon being upgraded
					upgradedCannonSprite.setTint(0x00ff00);

					// Update the frame to show the new power level
					upgradedCannonSprite.setFrame("match_p1Cannon000" + (pow - 1));

					// Clear the tint after a short delay
					this.time.delayedCall(1000, () => {
						upgradedCannonSprite?.clearTint();
					});
				}
			} else {
				console.log(
					"Client: Cannon power exceeds maximum visual representation"
				);
			}
		} else {
			console.warn("Client: Could not find cannon to upgrade");
		}

		// Start the next round after a short delay to allow for visual effects
		this.time.delayedCall(1000, () => {
			this.cannonSelectors.removeAll(true);
			this.events.emit("roundStart");
		});
	}

	onGameOver() {
		alert("gggggg rematch or quit?");
		this.time.addEvent({
			delay: 1000,
			callback: () => {
				this.scene.sleep();
				this.scene.stop();
				this.scene.start("Lobby");
			},
		});
	}

	_showTowerButtons() {
		console.info("show tower butons");

		// The build/atk/up buttons only
		//show the arm lel
		this.p1Left.visible = true;
		this.p1Cannons.setVisible(true);
		this.cannonSelectors.setVisible(true);

		// Create new button instances instead of showing/hiding existing ones
		this.atkBtn = new Button(this, 546, 389, "match_atkBtn").setName("atkBtn");

		this.bldBtn = new Button(this, 862, 559, "match_bldBtn").setName("bldBtn");

		this.upgBtn = new Button(this, 710, 922, "match_upgBtn").setName("upgBtn");

		this.cannonBtn = new Button(this, 910, 292, "match_cannonBtn")
			.setName("cannonBtn")
			.setVisible(false);

		this.shieldBtn = new Button(this, 906, 579, "match_shieldBtn")
			.setName("shieldBtn")
			.setVisible(false);

		const chooseAtk = () => {
			console.info("chooseAtk() called");
			this.bldBtn.destroy();
			this.upgBtn.destroy();
			this.cannonBtn.destroy();
			this.shieldBtn.destroy();

			this.tweens.add({
				targets: this.atkBtn,
				x: 475,
				y: 294,
				ease: "Linear",
				duration: 300,
				onComplete: () => {
					this.atkBtn.off("pointerdown", chooseAtk, this);
					this.targets.removeAll(true);

					// Choose your weapon
					this.cannonSelectors.removeAll(true);
					this.p1Cannons.list.forEach((cannon, p1Index) => {
						const selector = new Button(
							this,
							cannon.x,
							cannon.y,
							"match_chooseCannon"
						)
							.setDisplayOrigin(131, 245)
							.setName("selfCannonSelector")
							.setInteractive({ cursor: "pointer" })
							.on("pointerdown", () => {
								//add targets, each trigger the call and then hide everyone
								this.targets.removeAll(true);

								//base target
								const baseTarget = new Button(
									this,
									this.p2Base.x,
									this.p2Base.y,
									"match_targetBase"
								)
									.setDisplayOrigin(32, 38)
									.setName("p2Base");
								this.targets.add(baseTarget);
								// cannon target
								this.p2Cannons.list.forEach((c, p2Index) => {
									console.log("add target at", c.x, c.y);

									const cannonTarget = new Button(
										this,
										c.x,
										c.y,
										"match_targetCannon"
									)
										.setDisplayOrigin(66, 92)
										.setDepth(15)
										.setVisible(true)
										.setName("p2Cannon_" + c.name);

									cannonTarget.on("pointerdown", () => {
										this.targets.removeAll(true);

										// Get cannon IDs
										let attackerCannonId = null;
										let targetCannonId = null;

										// Get the cannon ID from the cannon object
										if (cannon.id) {
											attackerCannonId = cannon.id;
										}

										// Get the target cannon ID
										if (c.id) {
											targetCannonId = c.id;
										} else if (this.state.roundLoser.cannons[p2Index]) {
											// Fallback to getting ID from state if available
											targetCannonId =
												this.state.roundLoser.cannons[p2Index].id;
										}

										console.log(
											"Attacking opponent's cannon with ID",
											targetCannonId,
											"using my cannon with ID",
											attackerCannonId
										);

										this.handleTowerInput(TowerActionTypes.ATTACK_CANNON, {
											// Primary identification using IDs
											attackerCannonId: attackerCannonId,
											targetCannonId: targetCannonId,

											// Fallback to indices for backward compatibility
											attackerIndex: p1Index,
											target: p2Index,
										});
									});

									this.targets.add(cannonTarget);
								});
								this.targets.setVisible(true);

								const chooseAtkTower = () => {
									console.info("chooseAtkTower() called");

									// Get attacker cannon ID if available
									let attackerCannonId = null;
									if (cannon.id) {
										attackerCannonId = cannon.id;
									}

									this.handleTowerInput(TowerActionTypes.ATTACK_TOWER, {
										target: -1, // -1 indicates tower target
										// Attacker information
										attackerIndex: p1Index,
										attackerCannonId: attackerCannonId,
										cannonId: p1Index, // Keep for backward compatibility
									});
								};

								baseTarget.once("pointerdown", chooseAtkTower);
							});

						this.cannonSelectors.add(selector);
					});
				},
			});
		};

		// Fix the attack button event binding
		this.atkBtn.setInteractive({ cursor: "pointer" });
		this.atkBtn.once("pointerdown", chooseAtk);

		const chooseBld = () => {
			console.info("choose build", this.state.roundWinner);

			this.atkBtn.destroy();
			this.upgBtn.destroy();

			this.tweens.add({
				targets: this.bldBtn,
				x: 607,
				y: 362,
				ease: "Linear",
				duration: 100,
				onComplete: () => {
					this.cannonBtn = new Button(
						this,
						910,
						292,
						"match_cannonBtn"
					).setName("cannonBtn");

					this.shieldBtn = new Button(
						this,
						906,
						579,
						"match_shieldBtn"
					).setName("shieldBtn");
					// this.bldBtn.off("pointerdown", chooseBld);
					// this.bldBtn.removeInteractive();
					const handleAddCannon = () => {
						console.info("handleAddCannon() called");
						this.shieldBtn.removeInteractive();
						let cannon = new Cannon(this, this.input.mousePointer);

						const handleMove = (pointer) => {
							console.info("handleMove() called");
							cannon.setX(pointer.x);
							if (cannon.x < SCENE_W / 2) {
								cannon.flipX = false;
							} else {
								cannon.flipX = true;
							}
							// dont overlap existing cannons AND da base, shields ok lol
							const movingCHitbox = new Phaser.Geom.Rectangle(
								cannon.x + cannon.input.hitArea.x,
								cannon.y + cannon.input.hitArea.y,
								cannon.input.hitArea.width,
								cannon.input.hitArea.height
							);
							this.cantAddCannon =
								this.p1Cannons.list.some((builtC) => {
									//GET BY HITAREA< NOT getbounds
									const baseHitbox = this.p1Base.input.hitArea;
									const builtCHitbox = new Phaser.Geom.Rectangle(
										builtC.x + builtC.input.hitArea.x,
										builtC.y + builtC.input.hitArea.y,
										builtC.input.hitArea.width,
										builtC.input.hitArea.height
									);

									console.log(
										"overlap canons?",
										builtCHitbox,
										movingCHitbox,
										Phaser.Geom.Rectangle.Overlaps(builtCHitbox, movingCHitbox),
										"overlap base?",
										movingCHitbox,
										this.p1Base.getBounds(),
										Phaser.Geom.Rectangle.Overlaps(
											this.p1Base.getBounds(),
											movingCHitbox
										)
									);

									return Phaser.Geom.Rectangle.Overlaps(
										builtCHitbox,
										movingCHitbox
									);
								}) ||
								Phaser.Geom.Rectangle.Overlaps(
									movingCHitbox,
									this.p1Base.getBounds()
								) ||
								cannon.x <= 27 ||
								cannon.x >= 2580;

							// Draw debug visualization
							this.debugGraphics.clear();

							// Draw current cannon hit area in red or white
							const cannonHitArea = cannon.input ? cannon.input.hitArea : null;
							this.debugGraphics.lineStyle(
								2,
								this.cantAddCannon ? 0xff0000 : 0xffffff,
								1
							);

							if (this.cantAddCannon) {
								cannon.setTint(0xff0000);
							} else {
								cannon.clearTint();
							}
						};
						this.input.on("pointermove", handleMove);

						this.time.addEvent({
							delay: 50,
							callback: () => {
								const handleConfirm = () => {
									if (!this.cantAddCannon) {
										//console.warn("add le caon", cannon);
										this.input.off("pointermove", handleMove);
										this.input.off("pointerdown", handleConfirm);
										this.p1Cannons.add(cannon);
										cannon.placed = true; //any use?

										console.log("cannons: ", this.p1Cannons);
										this.handleTowerInput(TowerActionTypes.BUILD_CANNON, {
											x: cannon.x,
										});
									}
								};

								//why isnt this once, weird
								this.input.on("pointerdown", handleConfirm, this);
							},
							loop: false,
						});
					};
					this.cannonBtn
						.setInteractive({
							cursor: "pointer",
						})
						.once("pointerdown", handleAddCannon, this);

					//disable later to avoid double clickin
					const handleAddShield = () => {
						this.cannonBtn.removeInteractive();
						let shield = new Shield(this, this.input.mousePointer).setName(
							"p1 shield"
						);

						const handleResize = (pointer) => {
							console.info("handleResize() called");
							shield.handleResize(pointer);
							this.cantAddShield = this.p1Shields.some(
								(builtS) => Math.abs(builtS.scale - shield.scale) <= 0.001
							);

							if (this.cantAddShield) {
								shield.setTint(0xff0000);
							} else {
								shield.clearTint();
							}
						};

						this.input.on("pointermove", handleResize, this);

						// confirm add shields
						this.time.addEvent({
							delay: 50,
							callback: () => {
								const handleConfirm = () => {
									if (!this.cantAddShield) {
										this.input.off("pointermove", handleAddShield);
										this.input.off("pointermove", handleResize);
										this.p1Shields.push(shield);
										console.log(this.p1Shields);
										this.handleTowerInput(TowerActionTypes.BUILD_SHIELD, {
											scaleX: shield.scaleX,
											scaleY: shield.scaleY,
										});
									}
								};
								this.input.once("pointerdown", handleConfirm);
							},
							loop: false,
						});
					};
					this.shieldBtn
						.setInteractive({
							cursor: "pointer",
						})
						.once("pointerdown", handleAddShield);
				},
			});
		};
		this.bldBtn
			.setInteractive({
				cursor: "pointer",
			})
			.once("pointerdown", chooseBld);

		const chooseUpg = () => {
			console.info("chooseUpg() called");
			this.atkBtn.destroy();
			this.bldBtn.destroy();
			if (this.cannonBtn) this.cannonBtn.destroy();
			if (this.shieldBtn) this.shieldBtn.destroy();

			//how to reuse this?
			this.p1Cannons.list.forEach((cannon, index) => {
				console.warn(cannon);
				//scale the shape of the sprite?

				const selector = new Button(
					this,
					cannon.x,
					cannon.y,
					"match_chooseCannon"
				)
					.setName("selfCannonSelector")
					.setInteractive({ cursor: "pointer" })
					.on("pointerdown", () => {
						this.targets.removeAll(true);
						//console.warn(`Upgrade my ${index}th cannon`);

						this.handleTowerInput(TowerActionTypes.UPGRADE_CANNON, {
							cannonId: cannon.id,
						});

						this.cannonSelectors.removeAll(true);
					});
				selector.setDisplayOrigin(131, 245);
				this.cannonSelectors.add(selector);
			});
		};
		this.upgBtn
			.setInteractive({
				cursor: "pointer",
			})
			.once("pointerdown", chooseUpg);

		console.log(this.state.roundWinner);

		// Show buttons based on available options
		if (this.state.roundWinner.cannons.length === 0) {
			// No cannons - can only build
			this.atkBtn.setVisible(false);
			this.upgBtn.setVisible(false);
		} else {
			// Yes cannons - can do everything
			this.atkBtn.setVisible(true);
			this.upgBtn.setVisible(true);
		}
	}

	_hideTowerButtons() {
		console.info("hide(destroy) tower butons");

		// Destroy buttons instead of hiding them
		this.atkBtn.destroy();
		this.bldBtn.destroy();
		this.upgBtn.destroy();
		this.cannonBtn.destroy();
		this.shieldBtn.destroy();

		// Remove all elements from containers
		this.cannonSelectors.removeAll(true);
		this.targets.removeAll(true);
	}

	_decideWinner(p1RpsChoice, p2RpsChoice) {
		console.log("decide winner");
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
			this.state.roundLoser = this.state.players[1];
			// roundLoser?
			return 0;
		} else {
			this.state.roundWinner = this.state.players[1];
			this.state.roundLoser = this.state.players[0];
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
			// Specific tower actions for player 2
			switch (e.key) {
				case "1": // Build tower
					this.handleTowerInput(TowerActionTypes.BUILD_TOWER, {});
					break;
				case "2": // Build shield
					this.handleTowerInput(TowerActionTypes.BUILD_SHIELD, {
						scaleX: 1.2,
						scaleY: 1.2,
					});
					break;
				case "3": // Build cannon
					this.handleTowerInput(TowerActionTypes.BUILD_CANNON, {
						x: 500, // Fixed position for testing
					});
					break;
				case "4": // Attack tower
					this.handleTowerInput(TowerActionTypes.ATTACK_TOWER, {
						target: -1,
						cannonId: 0,
					});
					break;
				case "5": // Attack cannon
					// Only try to attack a cannon if there are any
					/*
					TowerActionTypes.ATTACK_CANNON, {
											// Primary identification using IDs
											attackerCannonId: attackerCannonId,
											targetCannonId: targetCannonId,

											// Fallback to indices for backward compatibility
											attackerIndex: p1Index,
											target: p2Index,
										}*/
					if (
						this.state.roundLoser &&
						this.state.roundLoser.cannons.length > 0
					) {
						// Get the first cannon's ID if available, otherwise use index
						const firstOppCannon = this.state.roundLoser.cannons[0];
						const firstSelfCannon = this.state.roundWinner.cannons[0];
						this.handleTowerInput(TowerActionTypes.ATTACK_CANNON, {
							attackerCannonId: firstSelfCannon.id,
							targetCannonId: firstOppCannon,

							// Fallback to indices for backward compatibility
							attackerIndex: 0,
							target: 0,
						});
					}
					break;
				case "6": // Upgrade cannon
					// Only try to upgrade if there are any cannons
					if (
						this.state.roundWinner &&
						this.state.roundWinner.cannons.length > 0
					) {
						const firstCannon = this.state.roundWinner.cannons[0];
						if (firstCannon.id) {
							this.handleTowerInput(TowerActionTypes.UPGRADE_CANNON, {
								id: firstCannon.id, // Upgrade by ID
							});
						}
					}
					break;
			}
		}
	}

	handleRpsInput(choice, playerName) {
		console.info("handleRpsInput() called");
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
		console.info("handle tower input - server logic");
		console.debug("state: ", this.state);
		if (!this.state.roundWinner) {
			console.error("No round winner defined");
			return;
		}
		/**
		 * This function acts as the server that alters the game state
		 * It processes the tower action and updates the game state accordingly
		 */
		if (!Object.values(TowerActionTypes).includes(towerAction)) {
			console.warn("invalid towerAction");
			return;
		}

		console.info("Server processing tower action: " + towerAction);

		/**Quasi server logic.
		 * Called everytime an rps input is received. */

		switch (towerAction) {
			case TowerActionTypes.BUILD_TOWER:
				console.log("Server: Building tower for", this.state.roundWinner.name);
				// Increment HP but cap at 4 for this action
				if (this.state.roundWinner.hp < 4) {
					this.state.roundWinner.hp += 1;
					this.events.emit("towerResultBuildTower", {
						info,
						state: this.state,
					});
				}
				break;

			case TowerActionTypes.BUILD_SHIELD:
				console.log(
					"Server: Building shield with scale:",
					info.scaleX,
					info.scaleY
				);
				// Register shield sizes as a tuple for client rendering
				this.state.roundWinner.shields.push([info.scaleX, info.scaleY]);

				this.events.emit("towerResultBuildShield", { info, state: this.state });
				break;

			case TowerActionTypes.BUILD_CANNON:
				console.log("Server: Building cannon at position:", info.x);

				// Create a new cannon with position and power
				const newCannon = {
					id: this.state.cannonCount++,
					x: info.x, // xPos for client rendering
					pow: 1, // Initial power value
				};

				// Add the cannon to the player's cannons array
				this.state.roundWinner.cannons.push(newCannon);

				// Print the cannon object to the server console
				console.log("Server: Added new cannon object:", newCannon);
				console.log(
					"Server: Player now has",
					this.state.roundWinner.cannons.length,
					"cannons:",
					this.state.roundWinner.cannons
				);

				this.events.emit("towerResultBuildCannon", { info, state: this.state });
				break;

			case TowerActionTypes.ATTACK_TOWER:
				console.warn("CANON POWIEJR:", info);
				console.log("Server: Attacking tower with cannon ID:", info.id);

				// Check if there are any shields to absorb the attack
				if (this.state.roundLoser.shields.length > 0) {
					// Find the largest shield (the one with the largest scaleY)
					const largestShieldIndex = this.state.roundLoser.shields.reduce(
						(maxIndex, shield, index, arr) => {
							return shield[1] > arr[maxIndex][1] ? index : maxIndex;
						},
						0
					);

					// Remove the outermost shield
					this.state.roundLoser.shields.splice(largestShieldIndex, 1);
					console.log("Server: Shield absorbed the attack");
				} else {
					// No shields, reduce HP directly
					this.state.roundLoser.hp -= info.pow;
					console.log(
						"Server: Tower took damage, new HP:",
						this.state.roundLoser.hp
					);
				}

				// Check if the attack was fatal
				const isFatal = this.state.roundLoser.hp <= 0;

				// Emit event with updated state for clients to update visuals
				this.events.emit("towerResultAttackTower", {
					info: {
						cannonId: info.id,
						attackerIndex: info.attackerIndex,
						attackerCannonId: info.attackerCannonId,
						fatal: isFatal,
					},
					state: this.state,
				});
				break;

			case TowerActionTypes.ATTACK_CANNON:
				console.log("Server: Attacking cannon", info);

				// Find the attacking cannon object - prioritize using ID over index
				let attackingCannonObj = null;
				if (info.attackerCannonId) {
					// Find by cannon ID (preferred method)
					attackingCannonObj = this.state.roundWinner.cannons.find(
						(cannon) => cannon.id === info.attackerCannonId
					);
					console.log(
						"Server: Attacking cannon object (by ID):",
						attackingCannonObj
					);
				} else if (
					info.attackerIndex !== undefined &&
					this.state.roundWinner.cannons[info.attackerIndex]
				) {
					// Fallback to index if ID not available
					attackingCannonObj =
						this.state.roundWinner.cannons[info.attackerIndex];
					console.log(
						"Server: Attacking cannon object (by index):",
						attackingCannonObj
					);
				}

				// onKeyDown(
				// Find the target cannon - prioritize using ID over index
				let targetIndex = -1;
				let targetCannonObj = null;

				if (info.targetCannonId) {
					// Find by cannon ID (preferred method)
					this.state.roundLoser.cannons.forEach((cannon) => {
						console.log(
							"Server: Round loser cannon ID:",
							cannon.id,
							info.targetCannonId
						);
					});

					targetIndex = this.state.roundLoser.cannons.findIndex(
						(cannon) => cannon.id === info.targetCannonId
					);
					if (targetIndex !== -1) {
						targetCannonObj = this.state.roundLoser.cannons[targetIndex];
						console.log("Server: Target cannon found by ID:", targetCannonObj);
					}
				}

				// Remove the target cannon if found
				if (
					targetIndex !== -1 &&
					targetIndex < this.state.roundLoser.cannons.length
				) {
					console.log("Server: Removing cannon at index:", targetIndex);
					this.state.roundLoser.cannons.splice(targetIndex, 1);
				} else {
					console.warn("Server: Target cannon not found");
				}

				// Emit event with updated state and enhanced info for clients to update visuals
				this.events.emit("towerResultAttackCannon", {
					info,
					state: this.state,
				});
				break;

			case TowerActionTypes.UPGRADE_CANNON:
				console.log("Server: Upgrading cannon", info);

				// Find the target cannon to upgrade
				let targetCannon = null;
				if (info.id) {
					// Find by cannon ID
					targetCannon = this.state.roundWinner.cannons.find(
						(cannon) => cannon.id === info.id
					);
				} else if (info.id !== undefined) {
					// Use cannonId index
					if (info.id < this.state.roundWinner.cannons.length) {
						targetCannon = this.state.roundWinner.cannons[info.id];
					}
				}

				// Upgrade the cannon if found
				if (targetCannon) {
					console.log(
						"Server: Upgrading cannon power from",
						targetCannon.pow,
						"to",
						targetCannon.pow + 1
					);
					targetCannon.pow += 1;
				} else {
					console.warn("Server: Target cannon not found for upgrade");
				}

				// Emit event with updated state for clients to update visuals
				this.events.emit("towerResultUpgradeCannon", {
					info,
					state: this.state,
				});
				break;

			default:
				console.error("Invalid tower action:", towerAction);
				alert("Invalid action");
				break;
		}
	}

	_hideRpsButtons() {
		console.log("hide rpss butons");
		// Update to hide container instead of individual elements
		this.rpsButtons.removeAll(true);
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
		 * @todo change this hp
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
		this.shields = [];
		this.cannons = [];
	}

	toString() {
		return `Player(name=${this.name}, hp=${this.hp}, cannons=${this.cannons})`;
	}
}
class Button extends Phaser.GameObjects.Sprite {
	constructor(scene, x, y, texture) {
		super(scene, x, y, texture);
		this.setInteractive({ cursor: "pointer" })
			.setAlpha(0.7)
			.setDepth(9999)
			.setOrigin(0, 0);
		this.on("pointerover", () => {
			this.setAlpha(1);
		});
		this.on("pointerout", () => {
			this.setAlpha(0.7);
		});

		scene.add.existing(this);
	}
}
class Cannon extends Phaser.GameObjects.Sprite {
	constructor(scene, pointer, forceX = null) {
		/**
		 * Usually the cannon is placed at mouse, but for debug u can force its x pos
		 */
		super(scene, pointer.x ? !forceX : forceX, 1430, "match_p1Cannon");
		this.pow = 1;
		this.placed = false;

		this.setDisplayOrigin(110, 276)
			.setDepth(999)
			.setInteractive()
			.setVisible(true)
			.setName("p1Cannon");

		this.input.hitArea.setTo(-88, -150, 167, 144);
		//console.warn(this.input.hitArea, this.getBounds());
		scene.add.existing(this);
	}

	handleMove(pointer) {
		this.setX(pointer.x);
	}

	handlePlacement() {
		this.placed = true;
		// Additional placement logic can go here
	}
}

class Shield extends Phaser.GameObjects.Sprite {
	constructor(scene, pointer) {
		super(scene, 1280, 1438, "match_p1Shield");
		this.setDisplayOrigin(633, 454)
			.setDepth(10)
			.setInteractive()
			.setVisible(true);
		console.warn("new shie");
		scene.add.existing(this);
	}

	handleResize(pointer) {
		const distance = Phaser.Math.Distance.Between(
			this.x,
			this.y,
			pointer.x,
			pointer.y
		);

		//max 1.85, 1.47
		this.setScale(
			roundToNearest(Phaser.Math.Clamp(distance / 500, 1, 1.85), 0.04),
			roundToNearest(Phaser.Math.Clamp(distance / 500, 1, 1.47), 0.04)
		);
	}
}

class TargetCannon extends Phaser.GameObjects.Sprite {
	constructor(scene, x, y) {
		super(scene, x, y, "match_targetCannon");
		this.setDisplayOrigin(66, 92).setDepth(15).setVisible(true);
		scene.add.existing(this);
	}
}
function mapRange(x, a, b, c, d) {
	// map a number between (a,b) to
	return ((x - a) * (d - c)) / (b - a) + c;
}
