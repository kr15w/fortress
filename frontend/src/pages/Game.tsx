import { Component } from "react";
import Phaser from "phaser";

//all scenes
import Match from "@/pages/game/Match.js";
import Lobby from "@/pages/game/Lobby.js";
/**
 * @todo send exit event to server
 * @todo ask for confirmation
 * @todo handle fullscreen
 * @todo reject mobile clietns
 */

class Game extends Component {
	private game: Phaser.Game | null = null;

	constructor(props: any) {
		super(props);
		this.game = null;
	}

	componentDidMount() {
		const config: Phaser.Types.Core.GameConfig = {
			title: "Fortress",
			type: Phaser.AUTO,
			width: 2560,
			height: 1440,
			parent: "game",
			disableContextMenu: true, //yay
			backgroundColor: "#333333",
			scale: {
				mode: Phaser.Scale.FIT,
				autoCenter: Phaser.Scale.CENTER_BOTH,
			},
			scene: [
				Lobby,
				Match,
			],
		};

		this.game = new Phaser.Game(config);
		//uhhhhhhhhhhh
		this.game.scale.setParentSize(window.innerWidth, window.innerHeight);

		// Add window resize listener
		window.addEventListener("resize", this.handleResize);
	}

	componentWillUnmount() {
		// Remove resize listener
		window.removeEventListener("resize", this.handleResize);

		if (this.game) {
			this.game.destroy(true);
			this.game = null;
			console.log("Game destroyed");
		}
	}

	handleResize = () => {
		if (this.game) {
			// Update game scale
			this.game.scale.setParentSize(window.innerWidth, window.innerHeight);
		}
	};

	render() {
		return <div id="game" style={{}}></div>;
	}
}

export default Game;
