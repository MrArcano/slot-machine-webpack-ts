import { Scene, GameObjects } from 'phaser';

export class MainGame extends Scene {
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;
    btn: GameObjects.Container;
    containers: GameObjects.Container[];

    constructor() {
        super('MainGame');
    }

    create() {
        // create fake reels
        const symbols = ['a', 'k', 'q', 'p-blond', 'p-brown', 'p-pink', 'bonus', 'wild', 'p-forest'];
        // const symbols = ['a', 'k', 'q', 'p-forest', 'wild'];
        const reels = this.createFakeReels(symbols, 5, 20);
        console.log(reels);

        // Ottieni le dimensioni dello schermo
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;

        // Carica l'immagine bg-logo
        this.createBackground(screenWidth, screenHeight);

        const containerCoordX = [-455,-230,0,230,455];
        this.containers = [];

        for (let i = 0; i < reels.length; i++) {

            const images: GameObjects.Image[] = [];
            let imageCoordY = 150
            for (let j = 0; j < reels[i].length; j++) {
                const symbolsImage = this.add.image(0,imageCoordY,reels[i][j]);
                images.push(symbolsImage);
                imageCoordY -= 210;
            }

            // const container = 
            const container = this.add.container(screenWidth / 2 + containerCoordX[i],screenHeight / 2,images);
            this.containers.push(container);
        }

        // Crea il bottone
        this.createButton(screenWidth, screenHeight);
    }

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

    private createBackground(screenWidth: number, screenHeight: number) {
        const bg = this.add.image(screenWidth / 2, screenHeight / 2, 'background-logo');
        bg.setDisplaySize(screenWidth + 16, screenHeight + 16);

        this.add.rectangle(screenWidth / 2, screenHeight / 2, screenWidth, screenHeight).setStrokeStyle(8, 0x000000);

        const bgReels = this.add.image(screenWidth / 2, screenHeight / 2 * 0.9, 'bg-reels');
        bgReels.setDisplaySize(bgReels.width * 1.15, bgReels.height * 1.15);
    }

    private createButton(screenWidth: number, screenHeight: number) {
        const graphics = this.add.graphics();
        this.drawButton(graphics, 0xff9a00); // Colore iniziale

        const btnText = this.add.text(0, 0, 'Spin!', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8
        });
        btnText.setOrigin(0.5);

        this.btn = this.add.container(screenWidth / 2, screenHeight * 0.825, [graphics, btnText]);
        this.btn.setSize(150, 75);

        this.btn.setInteractive({ cursor: 'pointer' })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
                // disabilitare il bottone
                this.btn.disableInteractive();

                console.log("Bottone premuto");
                this.containers.forEach((el, index) => {
                    this.tweens.add({
                        targets: el,
                        duration: 3000,
                        delay: 200 * index,
                        y: el.y + 630, // Sposta verso il basso
                        ease: 'Linear', // Tipo di easing
                        onComplete: () => {
                            console.log('Scorrimento completato per:', el);
                            console.log(el.y);
                            console.log(el.displayHeight);
                            
                            // riabilitare il bottone
                            this.btn.setInteractive({ cursor: 'pointer' });
                        }
                    });
                });
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
                this.drawButton(graphics, 0xff7500); // Colore cambiato in hover
            })
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
                this.drawButton(graphics, 0xff9a00); // Colore originale
            });
    }

    private drawButton(graphics: GameObjects.Graphics, color: number) {
        graphics.clear();
        graphics.lineStyle(4, 0x000000, 1);
        graphics.fillStyle(color, 1);
        graphics.fillEllipse(0, 0, 150, 75);
        graphics.strokeEllipse(0, 0, 150, 75);
    }
}
