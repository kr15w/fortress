import Phaser from "phaser";

export default class Match extends Phaser.Scene {
	constructor() {
		super("Match");
	}

	preload() {
		this.load.image("match_bg", "assets/match_bg.png");
		this.load.image("match_table", "assets/match_table.png");
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
			.sprite(1095, 76, "match_p2Body")
			.setOrigin(0, 0)
			.setDepth(1)
			.setName("p2Body");
		this.p2Hand = this.add
			.sprite(1150, 328, "match_p2Hand")
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
	}

	update() {}
}
