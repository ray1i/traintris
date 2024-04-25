// // eslint-disable-next-line no-restricted-globals
// const ctx: Worker = self as any;

// // Respond to message from parent thread
// ctx.addEventListener("message", (event) => console.log(event));

import { srsOffsets } from '../constants/minodata'
import { getNewMino, getBoardWithPlacedMinos, getMovedMino, getRotatedMino } from './util';
import { minoType, Mino, blockType, Blocks } from '../types/types';
import { containsState, insertState, newNode } from './board-search-tree';

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
onmessage = (msg: MessageEvent) => {
    const state: {b: Blocks, hold: minoType, queue: minoType[]} = msg.data;

    // if hold exists, append current mino to beginning of queue, otherwise make current mino held
    let new_queue = [...state.queue];
    let new_hold: minoType | undefined;

    if (state.hold != null) {
        new_hold = state.hold; 
    } else {
        new_hold = new_queue.shift();
    }

    const stackHeight = state.b.reduce((acc, row, i) => {
        if (row.some(block => block !== '')) {
            return i + 1;
        } else {
            return acc;
        }
    }, 0);
    
    const new_b = JSON.parse(JSON.stringify(state.b)).slice(0, Math.max(stackHeight, 4)); 

    let solutions: Mino[][];
    if (!new_hold || stackHeight === 0) {
        solutions = [];
    } else {
        solutions = getAllPCs(new_b, new_queue, new_hold);
    }

    solutions = eliminate_duplicate_solutions(new_b, solutions);

    postMessage(solutions);
}

function getAllPCs(b: Blocks, queue: minoType[], hold: minoType): Mino[][] {
    let result = [] as Mino[][];

    for (let h = 1; h < 5; h++){
        if (isBoardPCable(b, hold, queue, h)){
            // console.log(`searching for ${h}-height pcs...`)
            result = [...result, ...getAllPCsByHeight(b, queue, hold, h)]; 
        }
    }
    
    return result;
}
// check if board is technically pc-able
const isBoardPCable = (b: Blocks, hold: minoType | null, queue: minoType[], height=4): boolean => {
    // check if board height is higher than pc height
    for (let i = height; i < b.length; i++) {
        for (let block of b[i]){
            if (block) {
                // console.log(`Board height is higher than ${height}!`)
                return false;
            }
        }
    }
    
    // check if number of empty spaces on board is divisible by 4
    let empty_blocks = 0;
    for (let row of b) {
        empty_blocks += row.reduce((acc, block) => acc += (block === '' ? 1 : 0), 0);
    }
    if (empty_blocks % 4 !== 0) {
        // console.log('Remaining space is not divisible by 4!')
        return false;
    }

    // check if queue length (+1 for hold) is long enough to pc
    if (empty_blocks / 4 > queue.length + (hold ? 1 : 0)) {
        // console.log('Queue is not long enough!')
        return false;
    }

    return true;
}

const isMinoLowest = (b: Blocks, m: Mino): boolean => {
    for (let block of m.blocks){
        if (block[1] === 0) {
            return true;
        } 
        else if (b[block[1] - 1][block[0]]) {
            return true;
        }
    }
    return false;
}

const getAllLowestMinos = (b: Blocks, type: minoType, height=4): Mino[] => {
    let result = [];

    for (let perm = 0; perm < 4; perm++){
        for (let x = 0; x < 10; x++){
            for (let y = 0; y < height; y++){
                const tempmino = getRotatedMino(getNewMino(type, x, y), perm);
                if (!collide(b, tempmino) && isMinoLowest(b, tempmino) && isMinoPositionReachable(b, tempmino, 0)){
                    result.push(tempmino);
                }
            }
        }
        if (type === 'O' && perm > 0) break;
    }

    return result;
}

const isMinoPositionReachable = (b: Blocks, m: Mino, iter=0): boolean => {
    // check if we've already done too much iterations of this, currently set to maximum 3 but can add more
    if (iter > 4) return false;

    // check if the mino is already collided with the board
    // this is collide() from main file, modified so blocks above board don't trigger collision
    if (topless_collide(b, m)) return false;

    // check if it can just go straight up
    let can_go_up = true;
    for (let block of m.blocks) {
        if (can_go_up) {
            for (let i = 0; i < b.length; i++) {
                if (b[block[1] + i]?.[block[0]]) {
                    can_go_up = false;
                    break;
                }
            }
        }
        else break;
    }
    if (can_go_up) return true;

    // check each dir: up, left, right (no down)
    if (isMinoPositionReachable(b, getMovedMino(m, 0, 1), iter + 1) ||
        isMinoPositionReachable(b, getMovedMino(m, -1, 0), iter + 1) ||
        isMinoPositionReachable(b, getMovedMino(m, 1, 0), iter + 1)) {
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
                                isMinoPositionReachable(b, possibleOldMino, iter + 1)) {
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
        hold: minoType | null,
        history: Mino[],
    }

    const searchQueue: State[] = [{
        blocks: b,
        queue: queue,
        hold: hold,
        history: []
    }];
    const result: Mino[][] = [];
    const seenStates = newNode();

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
        } else if (currState.queue.length <= 0 && currState.hold === null) {
            // pass
        } else if (containsState(seenStates, new_b, currState.hold, currState.queue)) {
            // pass
        } else {
            insertState(seenStates, new_b, currState.hold, [...currState.queue]);

            // current mino as next
            if (currState.queue.length > 0) {
                for (let m of getAllLowestMinos(new_b, currState.queue[0], currState.blocks.length)) {
                    searchQueue.push({
                        blocks: new_b,
                        queue: currState.queue.slice(1),
                        hold: currState.hold,
                        history: [...currState.history, m]
                    })
                }
            }

            // hold mino as next
            if (currState.hold != null) {
                for (let m of getAllLowestMinos(new_b, currState.hold, currState.blocks.length)) {
                    searchQueue.push({
                        blocks: new_b,
                        queue: currState.queue.slice(1),
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

export { getAllPCs } // for tests
