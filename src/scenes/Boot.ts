import { Scene } from 'phaser';

export class Boot extends Scene
{
    constructor ()
    {
        super('Boot');
    }

    preload ()
    {
        //  The Boot Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
        //  The smaller the file size of the assets, the better, as the Boot Scene itself has no preloader.

        this.load.setPath('assets');

        this.load.image('background-logo', 'bg-logo.jpg');
        this.load.image('logo', 'logo.png');

    }

    create ()
    {
        this.scene.start('Preloader');
    }
}
