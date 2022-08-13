// // eslint-disable-next-line no-restricted-globals
// const ctx: Worker = self as any;

// // Respond to message from parent thread
// ctx.addEventListener("message", (event) => console.log(event));

import { minoTypes, srsOffsets } from '../data/minodata'
import { getBoardWithPlacedMinos } from './util';

type minoType = 'I' | 'O' | 'T' | 'L' | 'J' | 'Z' | 'S';

interface Mino {
    blocks: [number, number][],
    type: minoType;
    perm: number;
    ox: number,
    oy: number,
}

type blockType = minoType | 'G' | ''

type Blocks = blockType[][]

const getNewMino = (type: minoType, ox = 0, oy = 0): Mino => {
    let blocks = minoTypes[type].map(block => [ox + block[0], oy + block[1]] as [number, number]);

    return {
        blocks: blocks,
        type: type,
        perm: 0,
        ox: ox,
        oy: oy
    }
}

const getMovedMino = (m: Mino, x: number, y: number) : Mino => {
    const newBlocks = m.blocks.map(block => [block[0] + x, block[1] + y] as [number, number])
    return {
        ...m,
        blocks: newBlocks,
        ox: m.ox + x,
        oy: m.oy + y
    }
}

const getRotatedMino = (m: Mino, n: number) : Mino => {
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

const collide = (b: Blocks, m: Mino): boolean => {
    for (let block of m.blocks) {
        if (b[block[1]]?.[block[0]] === undefined || b[block[1]][block[0]]) {
            return true;
        }
    }
    return false;
}

function topless_collide(b: Blocks, m: Mino): boolean{ // collide that doesn't trigger on top undefined
    for (let block of m.blocks) {
        if (block[1] >= b.length && (0 <= block[0] && block[0] < 10)) {}
        else if (b[block[1]]?.[block[0]] === undefined || b[block[1]][block[0]]) {
            return true;
        }
    }
    return false
}

const setMultipleBlocks = (b: Blocks, blocklist: [number, number][], type: blockType) => {
    let tempBlocks = JSON.parse(JSON.stringify(b)) as Blocks;
    
    for (let block of blocklist) {
        if (block[0] < 10 && block[1] < 4) {
            tempBlocks[block[1]][block[0]] = type;
        }
    }

    // check to clear lines:
    for (let i = 0; i < tempBlocks.length; i++){
        if (!tempBlocks[i].includes('')) {
            tempBlocks.splice(i, 1);
            // tempBlocks.push(Array(10).fill(''));
            i--;
        }
    }

    return tempBlocks;
}

// when it gets input from the main file, run everything else.
// state.data has b (2d Array of Chars), curr (Char), hold (Char), queue (Array of Chars)
onmessage = (msg: MessageEvent) => {
    console.log('message received');
    const state: {b: Blocks, hold: minoType, queue: minoType[]} = msg.data;

    // if hold exists, append current mino to beginning of queue, otherwise make current mino held
    let new_queue = [...state.queue];
    let new_hold: minoType | undefined;

    if (state.hold != null) {
        new_hold = state.hold; 
    }
    else {
        new_hold = new_queue.shift();
    }

    const stackHeight = state.b.reduce((acc, row, i) => {
        if (row.some(block => block !== '')) {
            return i + 1;
        } else {
            return acc;
        }
    }, 0);
    
    const new_b = JSON.parse(JSON.stringify(state.b)).slice(0, stackHeight); 

    let solutions: Mino[][];
    if (!new_hold || stackHeight === 0) {
        solutions = [];
    } else {
        solutions = getAllPCs(new_b, new_queue, new_hold);
    }

    solutions = eliminate_duplicate_solutions(new_b, solutions);

    postMessage(solutions);

    console.log('finished.')
}

function getAllPCs(b: Blocks, queue: minoType[], hold: minoType): Mino[][] {
    let result = [] as Mino[][];

    for (let h = 1; h < 5; h++){
        if (is_pcable(b, queue, h)){
            // console.log(`searching for ${h}-height pcs...`)
            result = [...result, ...getAllPCsByHeight(b, queue, hold, h)]; 
        }
    }
    
    return result;
}

function is_pcable(b: Blocks, queue: minoType[], height=4): boolean{// check if board is pc-able given queue
    // check if board height is higher than pc height
    for (let i = height; i < b.length; i++){        
        for (let block of b[i]){
            if (block) {
                // console.log(`Board height is higher than ${height}!`)
                return false;
            }
        }
    }
    
    // check if number of empty spaces on board is divisible by 4
    let empty_blocks = 0;
    for (let row of b){        
        empty_blocks += row.reduce((acc, block) => acc += (block === '' ? 1 : 0), 0);
    }
    if (empty_blocks % 4 !== 0) {
        // console.log('Remaining space is not divisible by 4!')
        return false;
    }

    // check if queue length is long enough to pc
    if (empty_blocks / 4 > queue.length) {
        // console.log('Queue is not long enough!')
        return false;
    }

    return true;
}

function is_lowest(b: Blocks, m: Mino){
    for (let block of m.blocks){
        if (block[1] === 0){
            return true;
        } 
        else if (b[block[1] - 1][block[0]]){
            return true;
        }
    }
    return false;
}

function get_all_lowest(b: Blocks, type: minoType, height=4): Mino[] {
    let result = [];

    for (let perm = 0; perm < 4; perm++){
        for (let x = 0; x < 10; x++){
            for (let y = 0; y < height; y++){
                const tempmino = getRotatedMino(getNewMino(type, x, y), perm);
                if (!collide(b, tempmino) && is_lowest(b, tempmino) && is_reachable(b, tempmino, 0)){
                    result.push(tempmino);
                }
            }
        }
        if (type === 'O' && perm > 0) break;
    }

    return result;
}

function is_reachable(b: Blocks, m: Mino, iter=0): boolean {
    // check if we've already done too much iterations of this, currently set to maximum 3 but can add more
    if (iter > 4){
        return false;
    }

    // check if the mino is already collided with the board
    // this is collide() from main file, modified so blocks above board don't trigger collision
    if (topless_collide(b, m)){
        return false;
    }

    // check if it can just go straight up
    let can_go_up = true;
    for (let block of m.blocks){
        if (can_go_up){
            for (let i = 0; i < b.length; i++){
                if (b[block[1] + i]?.[block[0]]){
                    can_go_up = false;
                    break;
                }
            }
        }
        else break;
    }
    if (can_go_up) return true;

    // check each dir: up, left, right (no down)
    if (is_reachable(b, getMovedMino(m, 0, 1), iter + 1) ||
        is_reachable(b, getMovedMino(m, -1, 0), iter + 1) ||
        is_reachable(b, getMovedMino(m, 1, 0), iter + 1)) {
        return true;
    }
    // check each rotation, don't check if O piece
    else if (m.type !== 'O'){
        for (let rot = 1; rot < 4; rot++) {
            // check each offset:
            for (let os = 0; os < 5; os++) {
                // setting up the offset values
                let oldperm = (m.perm + rot + 4) % 4
                let offset = [
                    srsOffsets[m.type][oldperm][os][0] - srsOffsets[m.type][m.perm][os][0],
                    srsOffsets[m.type][oldperm][os][1] - srsOffsets[m.type][m.perm][os][1]
                ] as [number, number];
                
                // create copy of m, rotate it, and apply reversed offset
                const possibleOldMino = getRotatedMino(getMovedMino(m, -offset[0], -offset[1]), rot); 
                
                if (!topless_collide(b, possibleOldMino)) {
                    // rotate the possible old mino to check if the spin is actually what happens
                    const currOffset = srsOffsets[possibleOldMino.type];
                    const rotatedOldMino = getRotatedMino(possibleOldMino, -rot + 4); // -rot + 4 undoes rotation

                    for (let i = 0; i < currOffset[possibleOldMino.perm].length; i++) {
                        const offset = [
                            currOffset[possibleOldMino.perm][i][0] - currOffset[rotatedOldMino.perm][i][0],
                            currOffset[possibleOldMino.perm][i][1] - currOffset[rotatedOldMino.perm][i][1]
                        ]
                        const offsetMino = getMovedMino(rotatedOldMino, offset[0], offset[1])

                        // check if the rotated old mino becomes the mino we want
                        if (!topless_collide(b, offsetMino)) {
                            if (offsetMino.ox === m.ox && offsetMino.oy === m.oy &&
                                is_reachable(b, possibleOldMino, iter + 1)) {
                                return true;
                            } else {
                                break;
                            }
                        }
                    }
                }
            }
        }
    }

    return false;
}

function getAllPCsByHeight(b: Blocks, queue: minoType[], hold: minoType, height: number = 4): Mino[][] {

    interface State {
        blocks: Blocks,
        queue: minoType[],
        hold: minoType,
        history: Mino[],
    }

    const searchQueue: State[] = [{
        blocks: b,
        queue: queue,
        hold: hold,
        history: []
    }];
    const result: Mino[][] = [];

    while (searchQueue.length > 0) {
        const currState = searchQueue.shift()!;
        const new_b = currState.history.length > 0 ? 
        setMultipleBlocks(
            currState.blocks, 
            currState.history[currState.history.length - 1].blocks, 
            currState.history[currState.history.length - 1].type
        ) :
        JSON.parse(JSON.stringify(currState.blocks)) as Blocks;

        if (new_b.length === 0) {
            result.push(currState.history);

            // if (result.length % 10 === 0) console.log(`found ${result.length} solutions...`);
        } else {
            if (currState.queue.length <= 0 && currState.hold === null) {
                // pass
            }
            // else if (seen_boards.includes(JSON.stringify([queue[0], ...new_b.blocks]))){
            //     // pass
            // }
            else {
                // seen_boards.push(JSON.stringify([queue[0], ...new_b.blocks]))

                // current mino as next
                for (let m of get_all_lowest(new_b, currState.queue[0], currState.blocks.length)) {
                    searchQueue.push({
                        blocks: new_b,
                        queue: currState.queue.slice(1),
                        hold: currState.hold,
                        history: [...currState.history, m]
                    })
                }

                // hold mino as next
                for (let m of get_all_lowest(new_b, currState.hold, currState.blocks.length)) {
                    searchQueue.push({
                        blocks: new_b,
                        queue: [...currState.queue],
                        hold: currState.queue[0],
                        history: [...currState.history, m]
                    })

                }
            }
        }
    }

    return result;
}

function eliminate_duplicate_solutions(b: Blocks, sols: Mino[][]): Mino[][] {
    let new_sols = []; 
    let seen = []; 

    for (let s of sols){

        let new_b = getBoardWithPlacedMinos(b, s);

        let was_seen = false; 
        for (let arrangement of seen){
            if (JSON.stringify(new_b) === JSON.stringify(arrangement)) {
                was_seen = true;
                break;
            }
        }

        if (!was_seen){
            seen.push(new_b);
            new_sols.push(s);
        }
    }

    return new_sols;
}

export {}