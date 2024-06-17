import { Scene } from 'phaser';

export class Preloader extends Scene {
    constructor() {
        super('Preloader');
    }

    init() {
        // Initial settings of the loading screen
        
        // Get screen dimensions
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;

        // Add background logo image
        const bg = this.add.image(screenWidth / 2, screenHeight / 2, 'background-logo');

        // Add a border for background
        this.add.rectangle(screenWidth / 2, screenHeight / 2, screenWidth, screenHeight).setStrokeStyle(8, 0x000);

        // Set display size of background image
        bg.setDisplaySize(screenWidth + 16, screenHeight + 16);

        // Add game logo
        const logo = this.add.image(screenWidth / 2, (screenHeight / 2) * 0.7, 'logo');

        // Resize the logo
        logo.setDisplaySize(logo.width * 0.7, logo.height * 0.7);

        // Simple progress bar
        // This is the outline of the bar
        this.add.rectangle(screenWidth / 2, (screenHeight / 2) * 1.15, 468, 16).setStrokeStyle(1, 0xffffff);

        // This is the actual progress bar, which will increase in size from the left based on the progress (%)
        const bar = this.add.rectangle((screenWidth / 2) - 230, (screenHeight / 2) * 1.15, 4, 12, 0xffffff);

        // Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress : number) => {
            // Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);
        });
    }

    preload() {
        // Load game assets - Replace with your own assets

        this.load.setPath('assets');

        // Background images and symbols
        this.load.image('bg-reels', 'bg-reels.png');
        this.load.image('a', 'a.png');
        this.load.image('k', 'k.png');
        this.load.image('q', 'q.png');
        this.load.image('p-blond', 'fairy-blond.png');
        this.load.image('p-brown', 'fairy-brown.png');
        this.load.image('p-pink', 'fairy-pink.png');
        this.load.image('bonus', 'bonus.png');
        this.load.image('p-forest', 'pixies-forest.png');
        this.load.image('wild', 'wild.png');
    }

    create() {
        // When all assets have loaded, it's useful to create global objects here that the rest of the game can use.
        // For example, you can define global animations here, so they can be used in other scenes.

        // Move to the main game scene (Game).
        this.scene.start('MainGame');
        
        // TODO: Manage scene transitions
        // Example of transition with duration and easing
        // this.scene.start('MainMenu', { duration: 1000, ease: 'Power2' });
    }
}
