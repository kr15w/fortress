import React, { Component } from "react";
import Lobby from "@/pages/game/Lobby.js";
import Phaser from "phaser";

/**
 * @todo send exit event to server
 * @todo ask for confirmation
 * @todo handle fullscreen
 * @todo reject mobile clietns
 */

class Game extends Component {
	private game: Phaser.Game | null = null;

	componentDidMount() {
		const config: Phaser.Types.Core.GameConfig = {
			title: "Fortress",
			type: Phaser.AUTO,
			width: 2560,
			height: 1440,
			parent: "game",
			backgroundColor: "#192a56",
			pixelArt: true,
			scale: {
				mode: Phaser.Scale.FIT,
				autoCenter: Phaser.Scale.CENTER_BOTH,
			},
			scene: [Lobby],
		};

		this.game = new Phaser.Game(config);
	}

	componentWillUnmount() {
		if (this.game) {
			this.game.destroy(true);
			this.game = null;
			console.log("Game destroyed");
		}
	}

	render() {
		return <div id="game"></div>;
	}
}

export default Game;
