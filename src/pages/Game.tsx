import React from 'react';
import Lobby from '@/pages/game/Lobby.js';
import Phaser from 'phaser';

const Game: React.FC = () => {
    const config: Phaser.Types.Core.GameConfig = {
        title: 'Fortress',
        type: Phaser.AUTO,
        width: 2560,
        height: 1440,
        parent: 'game',
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
    
    const game = new Phaser.Game(config);
    
    return (
        <div id="game"></div>
    );
};

export default Game;
