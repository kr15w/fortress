import Phaser from "phaser";

/**
 * @todo handle animations
 */
const R = 2560 / 1920;

const ANIMS = {
    enter: {
        key: "enter",
        frames: this.anims.generateFrameNumbers("lobby_player", {
            start: 0,
            end: 3,
        }),
        frameRate: 24,
        repeat: -1
    },
	idle: {
        key: "idle",
        frames: this.anims.generateFrameNumbers("lobby_player", {
            start: 4,
            end: 4,
        }),
        frameRate: 24,
        repeat: -1
    },
	ready: {
        key: "ready",
        frames: this.anims.generateFrameNumbers("lobby_player", {
            start: 5,
            end: 16,
        }),
        frameRate: 24,
        repeat: 1
    },
};

export default class Lobby extends Phaser.Scene {
	constructor() {
		super("Lobby");
	}

    // hererere
	createAnimations() {
		this.anims.create({
			key: "enter",
			frames: this.anims.generateFrameNumbers("lobby_player", {
				start: 0,
				end: 3,
			}),
		});
        this.anims.create({
			key: "idle",
			frames: this.anims.generateFrameNumbers("lobby_player", {
				start: 4,
				end: 4,
			}),
		});
		this.anims.create({
			key: "ready",
			frames: this.anims.generateFrameNumbers("lobby_player", {
				start: 5,
				end: 16,
			}),
		});
	}
	playAnim(sprite, key) {
		const anim = ANIMS[key];
		if (!anim) return;
		/*
        blutbluh bluh bluh
        */
		//sprite.play(anim.key);
	}

	preload() {
		this.load.image("table", "assets/lobby_table.png");
		this.load.atlas(
			"lobby_player",
			"assets/lobby_player.png",
			"assets/lobby_player.json"
		);
		this.load.image("bg", "assets/lobby_bg.png");

		/* Get from server*/
		this.p1Enter = false;
		this.p2Enter = false;
		this.p1Ready = false;
	}

	create() {
		const SCENE_W = this.sys.game.canvas.width;
		const SCENE_H = this.sys.game.canvas.height;

		/*** add sprites******/
		this.bg = this.add.image(-244, -197, "bg").setOrigin(0, 0);

		// Draw debug point
		const graphics = this.add.graphics();
		graphics.lineStyle(2, 0xff0000);
		graphics.strokeCircle(627, 1098, 5);
		graphics.fillStyle(0xff0000);
		graphics.fillCircle(627, 1098, 5);

		// Create all animations
		this.createAnimations();

		//this.p1 = this.add.sprite(486,427,"p1").setOrigin(-0,-146).play("enter");
		this.p1 = this.add.sprite(-999, 1098, "p1").setOrigin(0.5, 1).setName("p1"); // Add name for unique animation key
		this.p2 = this.add.sprite(SCENE_W, 1098, "p2").setOrigin(0.5, 1).setName("p2"); // Add name for unique animation key
        
		//this.playAnim(this.p1, 'enter');
		this.p1.play("enter");
		this.p2.play("enter");

		// Initial location
		this.p1.setPosition(-this.p1.width, 1098);
		this.p2.setPosition(SCENE_W + this.p2.width, 1098);
		//this.p1.setPosition(486, 378); //test
		//this.p2.setPosition(1610, 378);//test //How is this number??????

		//this.p2.setPosition(this.p2.w + SCENE_W, 427);
		this.table = this.add.sprite(760, 886, "table").setOrigin(0, 0);
		this.table.scale = 0.859;
		this.p1.scale = this.p2.scale = 1;

		this.p2.flipX = true;
		this.bg.scale = 1;

		/******handle inputs */
		/*
                this.input.keyboard.on("keydown",(e)=>{
                    this.p2.flipX = !this.p2.flipX;
                });*/
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
				this.playAnim(this.p1, "idle");
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
						this.playAnim(this.p2, "idle");
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
				this.playAnim(this.p1, "ready");
			} else if (this.p1Ready) {
				console.log("Player 1 unready");
				this.p1Ready = false;
				this.playAnim(this.p1, "idle");
			}
		});
	}

	update() {}
}
