import { Scene, GameObjects } from "phaser";
import { Utility } from "./Utility";
import axios from "axios";

export class MainGame extends Scene {
  screenWidth: number;
  screenHeight: number;
  background: GameObjects.Image;
  containers: GameObjects.Container[];
  bgReels: GameObjects.Image;
  containerSlot: GameObjects.Container;
  symbols: string[] = [
    "a",
    "k",
    "q",
    "p-blond",
    "p-brown",
    "p-pink",
    "bonus",
    "wild",
    "p-forest",
  ];
  backEndSymbols: string[][] = [];
  backEndSymbolsOld: string[][] = [];
  numSymbolsPerReel: number = 21;
  numReelPerSlot: number = 5;
  heightSymbols: number = 210;
  isAnimatedLoading: boolean = false;
  dataReceived: boolean = false;
  timeAnimation: number = 0;
  btnSpin: GameObjects.Container;
  reels: string[][];

  constructor() {
    super("MainGame");
  }

  /**
   * Phaser's create method. Called when the scene is created.
   */
  create() {
    this.screenWidth = this.cameras.main.width;
    this.screenHeight = this.cameras.main.height;

    this.createBackground();
    this.createContainerSlotWithMask();
    this.createButtonSpin();
  }

  /**
   * Create and display the background image.
   */
  private createBackground() {
    const bg = this.add.image(
      this.screenWidth / 2,
      this.screenHeight / 2,
      "background-logo"
    );
    bg.setDisplaySize(this.screenWidth + 16, this.screenHeight + 16);

    this.add
      .rectangle(
        this.screenWidth / 2,
        this.screenHeight / 2,
        this.screenWidth,
        this.screenHeight
      )
      .setStrokeStyle(8, 0x000000);

    this.bgReels = this.add.image(
      this.screenWidth / 2,
      (this.screenHeight / 2) * 0.9,
      "bg-reels"
    );
    this.bgReels.setDisplaySize(
      this.bgReels.width * 1.15,
      this.bgReels.height * 1.15
    );
  }

  /**
   * Create a container slot with a mask to hold the reels and symbols.
   */
  private createContainerSlotWithMask() {
    // Generate an array[reel][symbol]
    this.reels = Utility.createFakeReels(
      this.symbols,
      this.numReelPerSlot,
      this.numSymbolsPerReel
    );

    this.createContainersReel();

    this.containerSlot = this.add.container(0, 0, this.containers);

    // create mask
    //-------------------------------------------------------------------------------------
    const shape = this.make.graphics();

    shape.fillStyle(0xffffff, 0.5);
    shape.fillRect(
      (this.screenWidth - this.bgReels.displayWidth) / 2,
      ((this.screenHeight - this.bgReels.displayHeight) / 2) * 0.7,
      this.bgReels.displayWidth,
      this.bgReels.displayHeight * 0.9
    );

    // debug mask
    // this.add.existing(shape);

    const mask = shape.createGeometryMask();
    this.containerSlot.setMask(mask);
    //-------------------------------------------------------------------------------------
  }

  /**
   * Create containers for each reel and populate them with symbols.
   */
  private createContainersReel() {
    // spacing between the reels
    const containerCoordX = [-455, -230, 0, 230, 455];
    // containers array for tweens effect
    this.containers = [];

    for (let i = 0; i < this.reels.length; i++) {
      const images: GameObjects.Image[] = [];
      // Y coordinate of the first image
      let imageCoordY = 150;

      for (let j = 0; j < this.reels[i].length; j++) {
        const symbolsImage = this.add.image(0, imageCoordY, this.reels[i][j]);
        images.push(symbolsImage);

        // decrease Y coordinates to space each image apart

        imageCoordY -= this.heightSymbols;
      }

      // container[i] reel
      const container = this.add.container(
        this.screenWidth / 2 + containerCoordX[i],
        this.screenHeight / 2,
        images
      );
      // array of individual reels to add the effect on click
      this.containers.push(container);
    }
  }

  /**
   * Create the SPIN button with interactive functionality.
   */
  private createButtonSpin() {
    const graphics = this.add.graphics();
    this.drawButtonSpin(graphics, 0xff9a00); // Initial color

    const btnText = this.add.text(0, 0, "Spin!", {
      fontFamily: "Arial Black",
      fontSize: 38,
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 8,
    });
    btnText.setOrigin(0.5);

    this.btnSpin = this.add.container(
      this.screenWidth / 2,
      this.screenHeight * 0.825,
      [graphics, btnText]
    );
    this.btnSpin.setSize(150, 75);

    this.btnSpin
      .setInteractive({ cursor: "pointer" })
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
        this.onButtonDown();
      })
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
        this.drawButtonSpin(graphics, 0xff7500); // Hover color
      })
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
        this.drawButtonSpin(graphics, 0xff9a00); // Original color
      });
  }

  /**
   * Handle the button down event for the SPIN button.
   */
  private onButtonDown() {
    console.log("BOTTONE CLICCATO");

    this.updateReels();

    // Disable the button
    this.btnSpin.disableInteractive();

    // change flag start animation update
    this.isAnimatedLoading = true;

    // Make a request for a user with a given ID
    axios
      .get("http://localhost:8000/api/get-reels-slot")
      .then((response) => {
        // handle success
        if (response.data["status"] === "success") {
          this.backEndSymbolsOld = this.backEndSymbols;
          this.backEndSymbols = response.data["data"];
          console.log(response.data["data"]);
        }

        this.dataReceived = true;
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      })
      .finally(function () {
        // always executed
      });
  }

  update(_time: number, delta: number) {
    if (this.isAnimatedLoading) {
      const yInitial = 450; // Initial y position
      const yFinal = 450 + this.heightSymbols * (this.numSymbolsPerReel - 3); // Final y position
      const duration = 1000; // Duration of the animation in milliseconds
      const moveAmount = ((yFinal - yInitial) / duration) * delta;

      // const moveAmount = (delta / 1000) * this.heightSymbols * 12;
      this.containers.forEach((el, index) => {
        setTimeout(() => {
          el.y += moveAmount;
          if (el.y >= 450 + this.heightSymbols * (this.numSymbolsPerReel - 3)) {
            el.y = 450;
          }
        }, index * 200);
      });
      this.timeAnimation += delta;

      if (this.timeAnimation >= 3000 && this.dataReceived === true) {
        this.updateReels();

        if (
          this.containers[0].y > 450 &&
          this.containers[0].y <
            450 + this.heightSymbols * (this.numSymbolsPerReel - 6) &&
          this.containers[this.containers.length - 1].y > 450 &&
          this.containers[this.containers.length - 1].y <
            450 + this.heightSymbols * (this.numSymbolsPerReel - 6)
        ) {
          this.isAnimatedLoading = false;
          this.dataReceived = false;
          this.timeAnimation = 0;

          this.animateReels();
        }
      }
    }
  }

  /**
   * Update the symbols on the reels with the new data from the backend.
   */
  private updateReels() {
    if (this.backEndSymbols.length !== 0) {
      this.containers.forEach((reel, reelIndex) => {
        const last = reel.list.length;
        (reel.list[last - 3] as Phaser.GameObjects.Image).setTexture(
          this.backEndSymbols[reelIndex][0]
        );
        (reel.list[last - 2] as Phaser.GameObjects.Image).setTexture(
          this.backEndSymbols[reelIndex][1]
        );
        (reel.list[last - 1] as Phaser.GameObjects.Image).setTexture(
          this.backEndSymbols[reelIndex][2]
        );
      });
    }

    if (this.backEndSymbolsOld.length !== 0) {
      this.containers.forEach((reel, reelIndex) => {
        (reel.list[0] as Phaser.GameObjects.Image).setTexture(
          this.backEndSymbolsOld[reelIndex][0]
        );
        (reel.list[1] as Phaser.GameObjects.Image).setTexture(
          this.backEndSymbolsOld[reelIndex][1]
        );
        (reel.list[2] as Phaser.GameObjects.Image).setTexture(
          this.backEndSymbolsOld[reelIndex][2]
        );
      });
    }
  }

  /**
   * Animate the reels to show the new symbols.
   */
  private animateReels() {
    this.containers.forEach((el, index) => {
      this.tweens.add({
        targets: el,
        duration: 1300,
        delay: index * 200,
        y: 450 + this.heightSymbols * (this.numSymbolsPerReel - 5),
        ease: "Linear",
        onComplete: () => {
          this.tweens.add({
            targets: el,
            duration: 700,
            y: 450 + this.heightSymbols * (this.numSymbolsPerReel - 3),
            ease: "Bounce.Out",
          });
          // Re-enable the button when the last reel has finished
          if (index === this.containers.length - 1) {
            this.btnSpin.setInteractive({ cursor: "pointer" });
          }
        },
      });
    });
  }

  /**
   * Draw the SPIN button with a specified color.
   * @param graphics The graphics object used to draw the button.
   * @param color The color to fill the button.
   */
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
