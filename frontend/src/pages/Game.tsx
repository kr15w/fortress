import { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import { useBeforeUnload } from "react-router-dom";
//all scenes
import Match from "@/pages/game/Match.js";
import Lobby from "@/pages/game/Lobby.js";
/**
 * @todo send exit event to server
 * @todo ask for confirmation
 * @todo handle fullscreen
 * @todo reject mobile clietns
 */

function Game() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const config: Phaser.Types.Core.GameConfig = {
      title: "Fortress",
      type: Phaser.AUTO,
      width: 2560,
      height: 1440,
      parent: "game",
      backgroundColor: "#333333",
      pixelArt: true,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: [Match],
    };

    gameRef.current = new Phaser.Game(config);

    // exit confirm doesnt work
    /*
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
*/
    // The return funciton is called on unmount
    return () => {
      //window.removeEventListener("beforeunload", handleBeforeUnload);
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
        console.log("Game destroyed");
      }
    };
  }, [pending]);

  return <div id="game" />;
}

export default Game;
