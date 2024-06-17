import { Scene, GameObjects } from 'phaser';

export class MainGame extends Scene {
    screenWidth: number;
    screenHeight: number;
    background: GameObjects.Image;
    containers: GameObjects.Container[];
    bgReels: GameObjects.Image;
    containerSlot: GameObjects.Container;
    symbols: string[] = ['a', 'k', 'q', 'p-blond', 'p-brown', 'p-pink', 'bonus', 'wild', 'p-forest'];
    backEndSymbols: string[][] = [
                        ['q', 'a', 'k'],
                        ['p-brown', 'p-blond', 'k'],
                        ['q', 'a', 'bonus'],
                        ['p-pink', 'a', 'q'],
                        ['p-pink', 'p-pink', 'a']
                    ];
    backEndSymbolsOld: string[][] = [
                        ['a', 'bonus', 'k'],
                        ['p-brown', 'p-blond', 'k'],
                        ['q', 'a', 'bonus'],
                        ['p-pink', 'a', 'q'],
                        ['p-pink', 'p-pink', 'a']
                    ];
    numSymbolsPerReel: number = 18;
    numReelPerSlot: number = 5;

    constructor() {
        super('MainGame');
    }

    create() {

        // Get screen dimensions
        this.screenWidth = this.cameras.main.width;
        this.screenHeight = this.cameras.main.height;
        
        // Add background and reels image
        // -------------------------------------------------------------------------------------
        const bg = this.add.image(this.screenWidth / 2, this.screenHeight / 2, 'background-logo');
        bg.setDisplaySize(this.screenWidth + 16, this.screenHeight + 16);

        this.add.rectangle(this.screenWidth / 2, this.screenHeight / 2, this.screenWidth, this.screenHeight).setStrokeStyle(8, 0x000000);

        this.bgReels = this.add.image(this.screenWidth / 2, this.screenHeight / 2 * 0.9, 'bg-reels');
        this.bgReels.setDisplaySize(this.bgReels.width * 1.15, this.bgReels.height * 1.15);
        // -------------------------------------------------------------------------------------

        // Add container, with reels and symbols
        this.createContainerSlotWithMask();
        
        // Create the SPIN button
        this.createButtonSpin();
    }

    private createContainerSlotWithMask() {
        // Generate an array[reel][symbol]
        // default 5 reels with 30 symbols
        let reels = this.createFakeReels(this.symbols, this.numReelPerSlot, this.numSymbolsPerReel);
        console.log(reels);

        // if there is an OLD then put it at the top of the array
        if(this.backEndSymbolsOld.length !== 0){
            reels = reels.map((reel,index) => {
                // replace the first 3 with the 3 elements in this.backEndSymbolsOld[index]
                reel[0] = this.backEndSymbolsOld[index][0];
                reel[1] = this.backEndSymbolsOld[index][1];
                reel[2] = this.backEndSymbolsOld[index][2];
                return reel;
            });
        }

        // concatenate the symbols received from the backend
        reels = reels.map((reel,index) => {
            return reel.concat(this.backEndSymbols[index]);
        });

        this.createContainersReel(reels);

        this.containerSlot = this.add.container(0,0,this.containers);

        // create mask
        //-------------------------------------------------------------------------------------
        const shape = this.make.graphics();

        shape.fillStyle(0xFFFFFF, 0.5);
        shape.fillRect(
            (this.screenWidth - this.bgReels.displayWidth) / 2,
            (this.screenHeight - this.bgReels.displayHeight) / 2 * 0.7,
            this.bgReels.displayWidth,
            this.bgReels.displayHeight * 0.9
        );
        
        // debug mask
        // this.add.existing(shape);
        
        const mask = shape.createGeometryMask();
        this.containerSlot.setMask(mask);
        //-------------------------------------------------------------------------------------
    }

    private createContainersReel(reels: string[][]) {
        // spacing between the reels
        const containerCoordX = [-455, -230, 0, 230, 455];
        // containers array for tweens effect
        this.containers = [];

        for (let i = 0; i < reels.length; i++) {
            const images: GameObjects.Image[] = [];
            // Y coordinate of the first image
            let imageCoordY = 150;

            for (let j = 0; j < reels[i].length; j++) {
                const symbolsImage = this.add.image(0, imageCoordY, reels[i][j]);
                images.push(symbolsImage);

                // decrease Y coordinates to space each image apart
                imageCoordY -= 210;
            }

            // container[i] reel
            const container = this.add.container(this.screenWidth / 2 + containerCoordX[i], this.screenHeight / 2, images);
            // array of individual reels to add the effect on click
            this.containers.push(container);
        }
    }

    /**
     * Generates a string[][]: reels of a slot machine with symbols
     * 
     * @param symbols Array of 9 symbols to be used in the reels.
     * @param reelCount Number of reels in the slot machine.
     * @param symbolCount Number of symbols per reel.
     * @returns A string[][] where each sub-array represents a reel with symbols.
     *
     * The probabilities of symbol are as follows:
     * 
     * - 60% chance to select symbols from indices 0 to 2.
     * - 30% chance to select symbols from indices 3 to 5.
     * - 5% chance to select the symbol at index 6.
     * - 3% chance to select the symbol at index 7.
     * - 2% chance to select the symbol at index 8.
     */
    private createFakeReels(symbols: string[], reelCount: number, symbolCount: number): string[][] {
        const reels = [];
        let min = 0;
        let max = 0;
        for (let i = 0; i < reelCount; i++) {
            const arrayTemp = [];
            for (let j = 0; j < symbolCount; j++) {
                const choice = Phaser.Math.Between(1,100);
                if (choice <= 60){
                    min = 0;
                    max = 2;
                }else if(choice <= 90){
                    min = 3;
                    max = 5;
                }else if (choice <= 95){
                    min = 6;
                    max = 6;
                }else if (choice <= 98){
                    min = 7;
                    max = 7;
                }else if (choice <= 100){
                    min = 8;
                    max = 8;
                }
                arrayTemp.push(symbols[Phaser.Math.Between(min, max)]);
            }
            reels.push(arrayTemp);
        }
        return reels;
    }

    private createButtonSpin() {
        const graphics = this.add.graphics();
        this.drawButtonSpin(graphics, 0xff9a00); // Initial color

        const btnText = this.add.text(0, 0, 'Spin!', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8
        });
        btnText.setOrigin(0.5);

        const btn = this.add.container(this.screenWidth / 2, this.screenHeight * 0.825, [graphics, btnText]);
        btn.setSize(150, 75);

        btn.setInteractive({ cursor: 'pointer' })
        .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
            this.onButtonDown(btn);
        })
        .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
            this.drawButtonSpin(graphics, 0xff7500); // Hover color
        })
        .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
            this.drawButtonSpin(graphics, 0xff9a00); // Original color
        });
    }

    private onButtonDown(btn: GameObjects.Container) {
        // Disable the button
        btn.disableInteractive();
    
        // Axios call and update 
        this.backEndSymbolsOld = this.backEndSymbols;
        // this.backEndSymbols = axios response;
    
        if (this.containers[0].y !== 450) {
            // Destroy container slot
            this.containerSlot.destroy();
            // Create new container slot
            this.createContainerSlotWithMask();
        }
    
        this.animateReels(btn);
    }
    
    private animateReels(btn: GameObjects.Container) {
        this.containers.forEach((el, index) => {
            this.tweens.add({
                targets: el,
                duration: 5000 + (300 * index),
                delay: 200 * index,
                y: el.y + (210 * (this.numSymbolsPerReel)), // Move the reels
                ease: 'Bounce.Out', // Easing type
                onComplete: () => {            
                    // Re-enable the button when the last reel has finished
                    if (index === this.containers.length - 1) { 
                        btn.setInteractive({ cursor: 'pointer' });
                    }
                }
            });
        });
    }

    private drawButtonSpin(graphics: GameObjects.Graphics, color: number) {
        graphics.clear();
        // Border
        graphics.lineStyle(4, 0x000);
        graphics.strokeEllipse(0, 0, 150, 75);
        // Fill
        graphics.fillStyle(color, 1);
        graphics.fillEllipse(0, 0, 150, 75);
    }
}
