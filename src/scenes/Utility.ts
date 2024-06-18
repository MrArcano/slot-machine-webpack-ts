export class Utility{

    /**
         * Generates a 2D array representing the reels of a slot machine with symbols.
         * 
         * @param symbols Array of symbols to be used in the reels.
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
    public static createFakeReels(symbols: string[], reelCount: number, symbolCount: number): string[][] {
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
}
