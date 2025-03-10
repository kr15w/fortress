import { Preloader } from './Preloader';
import { Lobby } from './Lobby';
import Phaser from 'phaser';

const config = {
    title: 'Card Memory Game',
    type: Phaser.AUTO,
    width: 2560,
    height: 1440,
    parent: 'game-container',
    backgroundColor: '#192a56',
    pixelArt: true,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [
        Lobby,
    ]
};

new Phaser.Game(config);
