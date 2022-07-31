import { minoTypes, minoIndexes, blocksize } from "../../data/minodata";

import { Mino, minoType } from "./types";

import blocksheet from '../../img/blocksheet.png'

export const collide = (b: string[][], m: Mino): boolean => {

    for (let block of m.blocks) {
        if (b[block[1]]?.[block[0]] === undefined || b[block[1]][block[0]]) {
            return true;
        }
    }
    return false;
}

export const getNewMino = (type: keyof typeof minoTypes, ox = 0, oy = 0): Mino => {
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
    let newBlocks = m.blocks.map(block => [block[0] + x, block[1] + y] as [number, number])
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
        perm: numRotations
    }
}

export const lowest = (b: string[][], m: Mino): Mino => {
    let i = -1
    let tempMino = getMovedMino(m, 0, i);

    while (!collide(b, tempMino)){
        i--;
        tempMino = getMovedMino(m, 0, i);
    }

    return getMovedMino(m, 0, i + 1);
}

const blocksheetSprite = new Image();
blocksheetSprite.src = blocksheet;
export const drawMino = (ctx: CanvasRenderingContext2D, m: Mino) => {
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