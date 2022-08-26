import { minoTypes, minoIndexes, blocksize } from "../constants/minodata";

import { Mino, minoType, Blocks } from "../types/types";

import blocksheet from '../img/blocksheet.png'

export const collide = (b: Blocks, m: Mino): boolean => {

    for (let block of m.blocks) {
        if (b[block[1]]?.[block[0]] === undefined || b[block[1]][block[0]]) {
            return true;
        }
    }
    return false;
}

export const getNewMino = (type: minoType, ox = 0, oy = 0): Mino => {
    let blocks = minoTypes[type].map(block => [ox + block[0], oy + block[1]] as [number, number]);

    return {
        blocks: blocks,
        type: type,
        perm: 0,
        ox: ox,
        oy: oy
    }
}

export const getMovedMino = (m: Mino, x: number, y: number) : Mino => {
    const newBlocks = m.blocks.map(block => [block[0] + x, block[1] + y] as [number, number])
    return {
        ...m,
        blocks: newBlocks,
        ox: m.ox + x,
        oy: m.oy + y
    }
}

export const getRotatedMino = (m: Mino, n: number) : Mino => {
    const numRotations = ((n % 4) + 4) % 4
    let newBlocks = m.blocks;

    for (let i = 0; i < numRotations; i++){
        newBlocks = newBlocks.map((block => [(block[1] - m.oy) + m.ox, -(block[0] - m.ox) + m.oy] as [number, number]))
    }

    return {
        ...m,
        blocks: newBlocks,
        perm: (m.perm + numRotations) % 4
    }
}

export const lowest = (b: Blocks, m: Mino): Mino => {
    let i = -1
    let tempMino = getMovedMino(m, 0, i);

    while (!collide(b, tempMino)){
        i--;
        tempMino = getMovedMino(m, 0, i);
    }

    return getMovedMino(m, 0, i + 1);
}

export const drawMino = (ctx: CanvasRenderingContext2D, m: Mino) => {
    const blocksheetSprite = new Image();
    blocksheetSprite.src = blocksheet;

    const heightOffset = ctx.canvas.height / blocksize - 1; 

    for (let block of m.blocks) {
        ctx.drawImage(
            blocksheetSprite,
            blocksize * minoIndexes[m.type as keyof typeof minoIndexes],
            0,
            blocksize,
            blocksize, 
            block[0] * blocksize,
            (heightOffset - block[1]) * blocksize,
            blocksize,
            blocksize
        );
    }
}

export const getShuffledQueue = (): minoType[] => {
    //Fisher-Yates shuffle
    let base = ['T', 'I', 'O', 'L', 'J', 'S', 'Z'] as minoType[];
    let remaining = base.length;
    
    let i;
    while (remaining){
        i = Math.floor(Math.random() * remaining--);
        [base[remaining], base[i]] = [base[i], base[remaining]];
    }

    return base;
}

// used for drawing in hold and queue:
export const getMinoWidth = (m: Mino): number => {
    const seen: number[] = [];
    m.blocks.forEach(block => {
        if (!seen.includes(block[0])) {
            seen.push(block[0]);
        }
    })
    return seen.length;
}

export const getMinoHeight = (m: Mino): number => {
    const seen: number[] = [];
    m.blocks.forEach(block => {
        if (!seen.includes(block[1])) {
            seen.push(block[1]);
        }
    })
    return seen.length;
}

export const getBoardWithPlacedMinos = (b: Blocks, minos: Mino[]): Blocks => {
    
    const new_b: Blocks = Array.from({ length: 4 }, () => Array(10).fill('')) // fills with blocks
    // offset is to cover for if any lines are cleared in the middle of the solution
    let offset = Array(4).fill(0);
    const cleared = Array(4).fill(false)

    for (let m of minos) {

        for (let block of m.blocks) {
            new_b[block[1] + offset[block[1]]][block[0]] = m.type;
        }

        // check if any lines have been cleared, if so, modify offset appropriately
        let new_offset = offset.slice()

        for (let row = 3; row >= 0; row--) {
            if (!cleared[row]) {
                let sum = 0;
                for (let block = 0; block < 10; block++) {
                    if (b[row][block] !== '' || new_b[row][block] !== '') {
                        sum++;
                    }
                }

                if (sum === 10) {
                    // modifying offset
                    new_offset.splice(row - offset[row], 1)
                    for (let i = row - offset[row]; i < new_offset.length; i++) {
                        new_offset[i]++;
                    }
                    new_offset.push(new_offset[new_offset.length - 1])
                    cleared[row] = true
                }
            }
        }

        offset = new_offset.slice()
    }

    return new_b;
}