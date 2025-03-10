//import { Preloader } from './Preloader';
import Lobby from './game/Lobby';
import Phaser from 'phaser';

const Game = () => {
    const config = {
    title: 'Fortress',
    type: Phaser.AUTO,
    width: 2560,
    height: 1440,
    parent: 'gameContainer',
    backgroundColor: '#192a56',
    pixelArt: true,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [
        Lobby,
    ]
    }   
const game = new Phaser.Game(config);
return (
    <div id="gameContainer"></div>
)
};

export default Game;

