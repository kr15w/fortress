import Phaser from "phaser";
import { loadAnims } from "./loadAnims";
import ANIMS from "./match_anims.json";

/**
 * done add tie anim
 * @todo add rmb to cansel
 * @todo how to calculate p2 shield?
 * @todo show more clearly what rps is chosen
 * @todo make everything prettier
 * @todo put buttons in a container
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

		/*****also remove the debug c lol */

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
		this.debugGraphics.lineStyle(2, 0xff00ff, 1); // Magenta color for polygon
		const polygon = this.p1Base.input.hitArea;

		// Draw the polygon by connecting its points
		if (polygon && polygon.points) {
			this.debugGraphics.beginPath();
			// Move to the first point
			this.debugGraphics.moveTo(
				this.p1Base.x + polygon.points[0].x,
				this.p1Base.y + polygon.points[0].y
			);

			// Draw lines to each subsequent point
			for (let i = 1; i < polygon.points.length; i++) {
				this.debugGraphics.lineTo(
					this.p1Base.x + polygon.points[i].x,
					this.p1Base.y + polygon.points[i].y
				);
			}

			// Close the path by connecting back to the first point
			this.debugGraphics.lineTo(
				this.p1Base.x + polygon.points[0].x,
				this.p1Base.y + polygon.points[0].y
			);

			this.debugGraphics.strokePath();
		}
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

		console.log("round start", this.state);

		this.p1Left.play("match_p1Left_wait"); //yea no
		this.p1Left.visible = false;
		this.p1Right.visible = true;
		this.p1Right.play("match_p1Right_wait");
		this.p2Body.play("match_p2Body_wait");
		this.p2Hand.play("match_p2Hand_wait");
		this.targets.removeAll(true);
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

	onGameOver() {
		alert("gggggggg on Game over");
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
								console.warn(`With my ${p1Index}th cannon`);

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
								this.p2Cannons.list.forEach((c) => {
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
									this.targets.add(cannonTarget);
								});
								this.targets.setVisible(true);

								const chooseAtkTower = () => {
									console.info("chooseAtkTower() called");
									this.handleTowerInput(TowerActionTypes.ATTACK_TOWER, {
										target: -1, //-1 for tower, 0+ for opponent cannon
										cannonId: p1Index,
									});
									//console.warn("owo");
								};

								baseTarget.once("pointerdown", chooseAtkTower);

								const chooseAtkCannon = (c, p2Index) => {
									this.targets.removeAll(true);
									console.log("Attacking opopnent's cannon", p2Index);
									this.handleTowerInput(TowerActionTypes.ATTACK_CANNON, {
										target: p2Index, //-1 for tower, 0+ for opponent cannon
										cannonId: p1Index,
									});
								};
								this.p2Cannons.list.forEach((c, p2Index) => {
									c.setInteractive({ cursor: "pointer" }).on(
										"pointerdown",
										(pointer) => {
											console.warn("each cannon's index:", p2Index);
											chooseAtkCannon(c, p2Index);
										}
									);
								});
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

							/*
							// draw where the enemy tower would be placed on the other guys pov
							let oppX = mapRange(
								cannon.x,
								30,
								SCENE_W - 30,
								910,
								SCENE_W - 910
							);

							oppX += 2 * (1280 - oppX);
							console.log("oppX: ", oppX);
							if (oppX > 1026 && oppX < 1541) {
								if (oppX > 1280) {
									oppX = 1541;
								} else {
									oppX = 1026;
								}
							}
							this.debugGraphics.fillStyle(0xffffff, 1);
							this.debugGraphics.fillPoint(oppX, 545);
*/
							// Draw p1Base hit area in blue
							const baseHitArea = this.p1Base.input
								? this.p1Base.input.hitArea
								: null;
							if (baseHitArea) {
								this.debugGraphics.lineStyle(2, 0x0000ff, 1);
								this.debugGraphics.strokeRect(
									this.p1Base.x + baseHitArea.x,
									this.p1Base.y + baseHitArea.y,
									baseHitArea.width,
									baseHitArea.height
								);
							} else {
								// Fallback to bounds if no hit area
								const baseBounds = this.p1Base.getBounds();
								this.debugGraphics.lineStyle(2, 0x0000ff, 1);
								this.debugGraphics.strokeRect(
									baseBounds.x,
									baseBounds.y,
									baseBounds.width,
									baseBounds.height
								);
							}

							// Draw existing cannons hit areas in green
							this.debugGraphics.lineStyle(2, 0x00ff00, 1);
							this.p1Cannons.list.forEach((builtC) => {
								const cannonHitArea = builtC.input
									? builtC.input.hitArea
									: null;
								if (cannonHitArea) {
									this.debugGraphics.strokeRect(
										builtC.x + cannonHitArea.x,
										builtC.y + cannonHitArea.y,
										cannonHitArea.width,
										cannonHitArea.height
									);
								} else {
									// Fallback to bounds if no hit area
									const cannonBounds = builtC.getBounds();
									this.debugGraphics.strokeRect(
										cannonBounds.x,
										cannonBounds.y,
										cannonBounds.width,
										cannonBounds.height
									);
								}
							});

							// Draw current cannon hit area in red or white
							const cannonHitArea = cannon.input ? cannon.input.hitArea : null;
							this.debugGraphics.lineStyle(
								2,
								this.cantAddCannon ? 0xff0000 : 0xffffff,
								1
							);

							if (cannonHitArea) {
								// Draw the hit area if it exists
								this.debugGraphics.strokeRect(
									cannon.x + cannonHitArea.x,
									cannon.y + cannonHitArea.y,
									cannonHitArea.width,
									cannonHitArea.height
								);
								// Also draw a point at the origin for reference
								this.debugGraphics.fillStyle(0xff00ff, 1);
								this.debugGraphics.fillCircle(cannon.x, cannon.y, 5);
							} else {
								// Fallback to bounds if no hit area
								const currentCannonBounds = cannon.getBounds();
								this.debugGraphics.strokeRect(
									currentCannonBounds.x,
									currentCannonBounds.y,
									currentCannonBounds.width,
									currentCannonBounds.height
								);
							}

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
										console.warn("add le caon", cannon);
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
						let shield = new Shield(this, this.input.mousePointer);

						const handleResize = (pointer) => {
							console.info("handleResize() called");
							shield.handleResize(pointer);
							this.cantAddShield = this.p1Shields.some(
								(scale) => Math.abs(scale - shield.scale) <= 0.001
							);

							if (this.cantAddShield) {
								shield.setTint(0xff0000);
							} else {
								shield.clearTint();
							}
						};

						this.input.on("pointermove", handleResize, this);

						this.time.addEvent({
							delay: 50,
							callback: () => {
								const handleConfirm = () => {
									if (!this.cantAddShield) {
										this.input.off("pointermove", handleAddShield);
										this.input.off("pointermove", handleResize);
										this.p1Shields.push(shield);
										console.log(this.p1Shields);
										this.handleTowerInput(
											TowerActionTypes.BUILD_SHIELD,
											shield.scale
										);
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
						console.warn(`Upgrade my ${index}th cannon`);

						this.handleTowerInput(TowerActionTypes.UPGRADE_CANNON, {
							cannonId: index,
						});

						this.cannonSelectors.removeAll(true);
					});
				selector.setDisplayOrigin(131, 245);

				console.warn(
					"set shit to",
					selector.displayOriginX,
					selector.displayOriginY
				);
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
			if (["b", "a", "u"].includes(e.key)) {
				this.handleTowerInput(e.key, "discovry");
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
		console.info("handle tower inptu");
		console.debug("state: ", this.state);
		if (!this.state.roundWinner) {
			console.error("what the hell");
			return;
		}
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

				//where to update visuals
				if (this.state.players[0].hp <= 4) {
					this.p1Base.setFrame("match_p1Base000" + this.state.players[0].hp);
				}
				if (this.state.players[1].hp <= 4) {
					this.p1Base.setFrame("match_p1Base000" + this.state.players[1].hp);
				}
				// //update visuasl
				// if (this.state.roundWinner.name == this.povName) {
				// 	this.p1Base.setFrame("match_p1Base000" + this.state.roundWinner.hp);
				// } else {
				// 	this.p2Base.setFrame("match_p2Base000" + this.state.roundWinner.hp);
				// }
				break;
			case TowerActionTypes.BUILD_SHIELD:
				console.log("build shield, scale: " + info);
				this.state.roundWinner.hp += 1;

				//player visuals
				const oppSize = info.scale;
				this.add
					.sprite(1280, 523, "match_p2Shield")
					.setDisplayOrigin(283, 203)
					.setScale(info.scale);

				// shield upgrades are SCRAPPED!!!

				break;
			case TowerActionTypes.BUILD_CANNON:
				console.log("info: ", info);

				// server sends the x pos of pov, calculte opponent x pos
				let oppX = mapRange(info.x, 30, SCENE_W - 30, 910, SCENE_W - 910);

				oppX += 2 * (1280 - oppX);
				console.log("oppX: ", oppX);
				//dont draw into the base
				if (oppX > 1010 && oppX < 1561) {
					if (oppX > 1280) {
						oppX = 1561;
					} else {
						oppX = 1010;
					}
				}

				// player visuals again
				const oppCannon = this.add
					.sprite(oppX, 558, "match_p2Cannon")
					.setDisplayOrigin(107, 154)
					.setDepth(10)
					.setVisible(true);
				this.p2Cannons.add(oppCannon);
				this.state.roundWinner.cannons.push({
					x: info.x,
					pow: 1,
				});
				break;
			case TowerActionTypes.ATTACK_TOWER:
				console.log("info: ", info);
				this.state.roundLoser.hp -= 1;

				if (this.state.roundLoser.hp < 0) {
					alert("gg gamoe over");
					this.events.emit("gameOver");
				}
				this.p1Base.setFrame("match_p1Base000" + this.state.players[0].hp);
				this.p2Base.setFrame("match_p2Base000" + this.state.players[1].hp);

				//temp
				this.targets.removeAll(true);
				break;
			case TowerActionTypes.ATTACK_CANNON:
				console.log("info: ", info);
				console.log(this.p2Cannons.list);
				console.log("remove opp's", info.target, "th cannon");
				this.state.roundLoser.cannons.splice(info.target, 1);
				this.p2Cannons.list[info.target].destroy();
				break;
			/*case TowerActionTypes.UPGRADE_SHIELD:
        console.log("info: ", info);
        break;*/
			case TowerActionTypes.UPGRADE_CANNON:
				console.log("info: ", info);
				this.state.roundWinner.cannons[info.cannonId].pow += 1;

				const pow = this.state.roundWinner.cannons[info.cannonId].pow;
				console.warn(this.state.roundWinner.cannons[info.cannonId]);

				//player visuals, no update beyond 7+power
				if (pow <= 7) {
					this.p2Cannons.list[info.cannonId].setFrame(
						"match_p2Cannon000" + (pow - 1)
					);
					this.p1Cannons.list[info.cannonId].setFrame(
						"match_p1Cannon000" + (pow - 1)
					);
				}

				break;
			default:
				alert("Invalid action");
				break;
		}
		this.events.emit("roundStart");
	}
	_showRpsButtons() {
		console.warn("(do not use this, just create)show rps butons");
		// Update to show container instead of individual elements
		this.rpsButtons.removeAll(true);
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
		//this.shields = [];
		this.cannons = [];
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

		console.log("set hitarea?");
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

//unused
/*
class P2Cannon extends Phaser.GameObjects.Sprite {
	constructor(scene, pointer, forceX = null) {
		super(scene, pointer.x ? !forceX : forceX, 1430, "match_p2Cannon");
		this.pow = 1;
		this.placed = false;

		this.setDisplayOrigin(129, 281)
			.setDepth(10)
			.setInteractive()
			.setVisible(true)
			.setScale(0.7, 0.7);
		scene.add.existing(this);
	}

	handleMove(pointer) {
		this.setX(pointer.x);
	}

	handlePlacement() {
		this.placed = true;
		// Additional placement logic can go here
	}
}*/
class Shield extends Phaser.GameObjects.Sprite {
	constructor(scene, pointer) {
		super(scene, 1280, 1438, "match_p1Shield");
		this.setDisplayOrigin(817, 519)
			.setDepth(10)
			.setInteractive()
			.setVisible(true);
		scene.add.existing(this);
	}

	handleResize(pointer) {
		const distance = Phaser.Math.Distance.Between(
			this.x,
			this.y,
			pointer.x,
			pointer.y
		);

		const newScale = roundToNearest(
			Phaser.Math.Clamp(distance / 500, 0.85, 1.5),
			0.04
		);

		this.setScale(newScale);
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
