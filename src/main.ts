import { Boot } from './scenes/Boot';
import { MainGame } from './scenes/MainGame';
import { Preloader } from './scenes/Preloader';

import { Game, Types } from "phaser";

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1600,
    height: 900,
    parent: 'game-container',
    // backgroundColor: '#028af8',
    // scale: {
    //     // mode: Phaser.Scale.FIT,
    //     // autoCenter: Phaser.Scale.CENTER_BOTH
    // },
    scene: [
        Boot,
        Preloader,
        MainGame,
    ]
};

export default new Game(config);
