import Phaser from "phaser";

/**
 * @todo handle animations
 * @todo automate origin setting (use the relative position of the largest sprite)
 * @todo emit a signal on each event
 */

export default class Lobby extends Phaser.Scene {
	constructor() {
		super("Lobby");
	}

	loadAnims() {
		const ANIMS = {
			lobby_player: [
				{
					key: "enter",

					start: 0,
					end: 3,
					frameRate: 24,
					repeat: -1,
				},
				{
					key: "idle",

					start: 4,
					end: 4,

					frameRate: 24,
					repeat: -1,
				},
				{
					key: "ready",
					start: 5,
					end: 16,
					frameRate: 24,
					repeat: 1,
				},
			],
		};
		for (let s in ANIMS) {
			//console.log("loading anims of "+s);
			for (let a in ANIMS[s]) {
				//console.log(ANIMS[s][a]);
				this.anims.create({
					key: ANIMS[s][a].key,
					frames: this.anims.generateFrameNames(s, {
						prefix: s,
						start: ANIMS[s][a].start,
						end: ANIMS[s][a].end,
						zeroPad: 4,
					}),
					repeat: ANIMS[s][a].repeat,
				});
			}
		}
	}
	preload() {
		this.load.image("lobby_table", "assets/lobby_table.png");
		this.load.atlas(
			"lobby_player",
			"assets/lobby_player.png",
			"assets/lobby_player.json"
		);
		this.load.image("lobby_bg", "assets/lobby_bg.png");

		/* Get from server*/
		this.p1Enter = false;
		this.p2Enter = false;
		this.p1Ready = false;
	}

	create() {
		const SCENE_W = this.sys.game.canvas.width;
		const SCENE_H = this.sys.game.canvas.height;

		/*static sprites*/
		this.bg = this.add.image(-244, -197, "lobby_bg").setOrigin(0, 0);
		this.table = this.add.sprite(760, 886, "lobby_table").setOrigin(0, 0);
		this.table.scale = 0.859;
		this.table.setDepth(100);

		/*animated sprirtes*/
		this.p1 = this.add.sprite(0, 1098, "lobby_player").setName("p1");
		this.p2 = this.add.sprite(0, 1098, "lobby_player").setName("p2");

		// AUTOMATE THIS, use the largest anim for the stuff
		this.p1.setOrigin(291 / this.p1.width, 800 / this.p1.height);
		//?????
		this.p2.setOrigin(291 / this.p2.width, 800 / this.p2.height);

		// Create dots to visualize p1's and p2's origins
		this.p1OriginDot = this.add.circle(0, 0, 5, 0x00ff00); // Green dot for p1
		this.p1OriginDot.setDepth(200); // Make sure it's visible above everything
		
		this.p2OriginDot = this.add.circle(0, 0, 5, 0xff0000); // Red dot for p2
		this.p2OriginDot.setDepth(200); // Make sure it's visible above everything

		this.loadAnims();

		this.p1.play("enter", true);
		this.p2.play("enter", true);

		this.p1.setPosition(-this.p1.width, 1098);
		this.p2.setPosition(SCENE_W + this.p2.width, 1098);
		
		this.p1.scale = this.p2.scale = 1;
		this.p2.scaleX = -1;
		

		/******handle inputs */

		//P1 enters at the start of the scene
		// plays enter naim
		//Emits a Player enters room event

		this.tweens.add({
			targets: this.p1,
			x: 627,
			ease: "Linear",
			duration: 1000,
			repeat: 0,
			yoyo: false,
			onComplete: () => {
				console.log("idle");
				this.p1.play("idle");
				this.p1Enter = true;
			},
		});
		//Fire when server acknowledges p2 enter
		this.input.keyboard.on("keydown", (e) => {
			//console.log("p2 enters")
			if (e.key === "r" && !e.repeat && !this.p2Enter) {
				console.log("p2 enters");
				this.tweens.add({
					targets: this.p2,
					x: 1922,
					ease: "Linear",
					duration: 1000,
					repeat: 0,
					yoyo: false,
					onComplete: () => {
						console.log("idle");
						this.p2.play("idle");
						this.p2Enter = true;
					},
				});
			}
		});

		this.p1.setInteractive({ cursor: "pointer" });
		this.p1.on("pointerdown", (pointer) => {
			if (this.p1Enter && !this.p1Ready) {
				console.log("Player 1 ready");
				this.p1Ready = true;
				this.p1.play("ready");
			} else if (this.p1Ready) {
				console.log("Player 1 unready");
				this.p1Ready = false;
				this.p1.play("idle");
			}
		});
	}

	update() {
		// Update the position of the dots to match p1's and p2's origin positions
		// Update p1's origin dot
		if (this.p1 && this.p1OriginDot) {
			const p1OriginX = this.p1.x;
			const p1OriginY = this.p1.y;
			this.p1OriginDot.setPosition(p1OriginX, p1OriginY);
		}
		
		// Update p2's origin dot
		if (this.p2 && this.p2OriginDot) {
			const p2OriginX = this.p2.x;
			const p2OriginY = this.p2.y;
			this.p2OriginDot.setPosition(p2OriginX, p2OriginY);
		}
	}
}
