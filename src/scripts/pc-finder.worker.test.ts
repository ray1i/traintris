import { getAllPCs } from "./pc-finder.worker";
import { getBlocksFromString } from "./util";
import { minoType, Blocks } from "../types/types";

describe('getAllPCs', () => {
    test('Return solution when it exists', () => {
        const testBoard = 
`GGGG    GG
GGGG   GGG
GGGG  GGGG
GGGG   GGG`
        const blocks: Blocks = getBlocksFromString(testBoard);
        expect(getAllPCs(blocks, ['Z', 'S'], 'J').length).toBeGreaterThanOrEqual(1);
    })
    test('Return nothing when solution doesn\'t exist', () => {
        const testBoard = 
`GGGG    GG
GGGG   GGG
GGGG  GGGG
GGGG   GGG`
        const blocks: Blocks = getBlocksFromString(testBoard);
        expect(getAllPCs(blocks, ['Z', 'S'], 'L').length).toEqual(0);
    })
})



