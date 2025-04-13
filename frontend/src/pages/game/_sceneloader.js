class SceneLoader extends Phaser.Scene {
	constructor() {
		super("SceneLoader");
	}

	create() {
		this.add.text(100, 50, "Scene Loader", { fontSize: "32px", color: "#fff" });

		// Buttons to jump to different scenes
		const LobbyButton = this.add
			.text(100, 150, "Go to Lobby", { fontSize: "24px", color: "#fff" })
			.setInteractive()
			.on("pointerdown", () => this.scene.start("Lobby"));

		const scene2Button = this.add
			.text(100, 200, "Go to Match", { fontSize: "24px", color: "#fff" })
			.setInteractive()
			.on("pointerdown", () => this.scene.start("Scene2"));
	}
}

class Lobby extends Phaser.Scene {
	constructor() {
		super("Lobby");
	}

	create() {
		this.add.text(100, 100, "Lobby", { fontSize: "32px", color: "#fff" });

		// Add a button to return to the Scene Loader
	}
}

class Scene2 extends Phaser.Scene {
	constructor() {
		super("Scene2");
	}

	create() {
		this.add.text(100, 100, "Match", { fontSize: "32px", color: "#fff" });

		// Add a button to return to the Scene Loader
		this.add
			.text(100, 200, "Back to Loader", { fontSize: "24px", color: "#fff" })
			.setInteractive()
			.on("pointerdown", () => this.scene.start("SceneLoader"));
	}
}

const config = {
	type: Phaser.AUTO,
	width: 800,
	height: 600,
	scene: [SceneLoader, Lobby, Scene2],
};

const game = new Phaser.Game(config);
