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

  componentDidMount() {
    const config: Phaser.Types.Core.GameConfig = {
      title: "Fortress",
      type: Phaser.AUTO,
      width: 2560,
      height: 1440,
      parent: "game",
      backgroundColor: "#333333",
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: [Match],
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
