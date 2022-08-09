export {}

// // eslint-disable-next-line no-restricted-globals
// const ctx: Worker = self as any;

// // Respond to message from parent thread
// ctx.addEventListener("message", (event) => console.log(event));

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

export const minoTypes = {
    "I": [[-1, 0], [ 0, 0], [ 1, 0], [ 2, 0]],

    "O": [         [ 0, 1], [ 1, 1], 
                   [ 0, 0], [ 1, 0]],

    "T": [         [ 0, 1], 
          [-1, 0], [ 0, 0], [ 1, 0]],

    "L": [                  [ 1, 1], 
          [-1, 0], [ 0, 0], [ 1, 0]],

    "J": [[-1, 1], 
          [-1, 0], [ 0, 0], [ 1, 0]],

    "Z": [[-1, 1], [ 0, 1], 
                   [ 0, 0], [ 1, 0]],

    "S": [         [ 0, 1], [ 1, 1], 
          [-1, 0], [ 0, 0]],
};


// SRS
export const srsOffsets = {
    I: [
        [[ 0, 0], [-1, 0], [+2, 0], [-1, 0], [+2, 0]],
        [[-1, 0], [ 0, 0], [ 0, 0], [ 0,+1], [ 0,-2]],
        [[-1, +1], [+1,+1], [-2,+1], [+1, 0], [-2, 0]],
        [[ 0,+1], [ 0,+1], [ 0,+1], [ 0,-1], [ 0,+2]]
    ],
    O: [
        [[ 0, 0]],
        [[ 0,-1]],
        [[-1,-1]],
        [[-1, 0]]
    ],
    T: [
        [[ 0, 0], [ 0, 0], [ 0, 0], [ 0, 0], [ 0, 0]],
        [[ 0, 0], [+1, 0], [+1,-1], [ 0,+2], [+1,+2]],
        [[ 0, 0], [ 0, 0], [ 0, 0], [ 0, 0], [ 0, 0]],
        [[ 0, 0], [-1, 0], [-1,-1], [ 0,+2], [-1,+2]]
    ],
    L: [
        [[ 0, 0], [ 0, 0], [ 0, 0], [ 0, 0], [ 0, 0]],
        [[ 0, 0], [+1, 0], [+1,-1], [ 0,+2], [+1,+2]],
        [[ 0, 0], [ 0, 0], [ 0, 0], [ 0, 0], [ 0, 0]],
        [[ 0, 0], [-1, 0], [-1,-1], [ 0,+2], [-1,+2]]
    ],
    J: [
        [[ 0, 0], [ 0, 0], [ 0, 0], [ 0, 0], [ 0, 0]],
        [[ 0, 0], [+1, 0], [+1,-1], [ 0,+2], [+1,+2]],
        [[ 0, 0], [ 0, 0], [ 0, 0], [ 0, 0], [ 0, 0]],
        [[ 0, 0], [-1, 0], [-1,-1], [ 0,+2], [-1,+2]]
    ],
    Z: [
        [[ 0, 0], [ 0, 0], [ 0, 0], [ 0, 0], [ 0, 0]],
        [[ 0, 0], [+1, 0], [+1,-1], [ 0,+2], [+1,+2]],
        [[ 0, 0], [ 0, 0], [ 0, 0], [ 0, 0], [ 0, 0]],
        [[ 0, 0], [-1, 0], [-1,-1], [ 0,+2], [-1,+2]]
    ],
    S: [
        [[ 0, 0], [ 0, 0], [ 0, 0], [ 0, 0], [ 0, 0]],
        [[ 0, 0], [+1, 0], [+1,-1], [ 0,+2], [+1,+2]],
        [[ 0, 0], [ 0, 0], [ 0, 0], [ 0, 0], [ 0, 0]],
        [[ 0, 0], [-1, 0], [-1,-1], [ 0,+2], [-1,+2]]
    ],
};

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
    for (let block of m.blocks){
        if (block[1] >= b.length){}
        else if (b[block[1]]?.[block[0]] === undefined || b[block[1]][block[0]]) {
            return true;
        }
    }
    return false
}

const lowest = (b: Blocks, m: Mino): Mino => {
    let i = -1
    let tempMino = getMovedMino(m, 0, i);

    while (!collide(b, tempMino)){
        i--;
        tempMino = getMovedMino(m, 0, i);
    }

    return getMovedMino(m, 0, i + 1);
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
            tempBlocks.push(Array(10).fill(''));
            i--;
        }
    }

    return tempBlocks;
}

// when it gets input from the main file, run everything else.
// state.data has b (2d Array of Chars), curr (Char), hold (Char), queue (Array of Chars)
onmessage = (state) => {
    // if hold exists, append current mino to beginning of queue, otherwise make current mino held
    let new_queue = [...state.data.queue];
    let new_hold: minoType;

    if (state.data.hold != null){
        new_queue.splice(0, 0, state.data.curr);
        new_hold = state.data.hold
    }
    else {
        new_hold = state.data.curr
    }

    const stackHeight = 
    
    let new_b = copy_board({width: state.data.b[0].length, blocks: state.data.b})

    for (let h=1; h<5; h++){
        
        console.log('searching for ' + h + '-height pcs...')

        if (is_pcable(new_b, [new_hold].concat(new_queue), h)){
            get_all_pcs(new_b, new_queue.slice(), new_hold, new Array, h);     
        }

    }

    solutions = eliminate_duplicate_solutions(new_b, solutions);

    self.postMessage(solutions)

    console.log('finished.')
}

function getAllPCs(b: Blocks, queue: minoType[], curr: minoType): Mino[][] {
    let result = [] as Mino[][];

    for (let h = 1; h < 5; h++){
        console.log('searching for ' + h + '-height pcs...')

        if (is_pcable(b, queue, h)){
            result = [...result, ...get_all_pcs(b, queue, curr, new Array, h)]; 
        }
    }
    
    return result;
}

function is_pcable(b: Blocks, queue: minoType[], height=4): boolean{// check if board is pc-able given queue
    // check if board height is higher than pc height
    for (let i = height; i < b.length; i++){        
        for (let block of b[i]){
            if (block) {
                console.log('Board height is higher than ' + height + '!')
                return false;
            }
        }
    }
    
    // check if number of empty spaces on board is divisible by 4
    let empty_blocks = 0;
    for (let i = 0; i < height; i++){        
        for (let block of b[i]){
            if (!block) empty_blocks++;
        }
    }
    if (empty_blocks % 4 != 0) {
        console.log('Remaining space is not divisible by 4!')
        return false;
    }

    // check if queue length is long enough to pc
    if (empty_blocks / 4 > queue.length) {
        console.log('Queue is not long enough!')
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
    else if (m.type != 'O'){
        return false;
        for (let rot = 1; rot < 4; rot++){
            for (let os = 0; os < 5; os++){
                // setting up the offset values
                let oldperm = (m.perm + rot + 4) % 4
                let offset = [
                    srsOffsets[m.type][oldperm][os][0] - srsOffsets[m.type][m.perm][os][0],
                    srsOffsets[m.type][oldperm][os][1] - srsOffsets[m.type][m.perm][os][1]
                ] as [number, number];
               /* 
                // creating copy of m rotate it and apply proper offset
                let new_m = getRotatedMino(getMovedMino(m, -offset[0], -offset[1]), rot); 
                
                // create copy of rotated m so we can check if the spin is actually what happens
                let rotated_new_m = new_m.copy(0, 0)
                rotated_new_m.srs_rotate(b, -rot + 4) //-rot + 4 undoes rotation

                if (JSON.stringify(rotated_new_m.o) === JSON.stringify(m.o)){ // check if the spin is actually possible
                    if (is_reachable(b, new_m, iter+1)) {
                        return true;
                    }
                }*/
            }
        }
    }
    else {
        return false;
    }

}

function get_all_pcs(b: Blocks, queue: minoType[], hold: minoType, height=4): Mino[][] {

    interface State {
        blocks: Blocks,
        queue: minoType[],
        hold: minoType,
        height: number, // number of lines left to clear
        history: Mino[],
    }

    const searchQueue: State[] = [{
        blocks: b,
        queue: queue,
        hold: hold,
        height: height,
        history: []
    }];
    const result: Mino[][] = [];

    while (searchQueue.length > 0) {
        const { blocks, queue, hold, height, history } = searchQueue.shift()!;
        
        if (height === 0) {
            result.push(history);
        } else {
            
        }
    }  

    let new_b = setMultipleBlocks(b, history[history.length - 1].blocks, history[history.length - 1].type);

    // if the board is empty i.e. if it's a pc
    if (new_b.height === 0) {
        result.push(history);
        return;
    }
    else if (queue.length <= 0 && hold === null) {
        return;
    }
    else if (seen_boards.includes(JSON.stringify([queue[0], ...new_b.blocks]))){
        return;
    }
    else {
        seen_boards.push(JSON.stringify([queue[0], ...new_b.blocks]))

        // current mino as next
        for (let mino of get_all_lowest(queue[0], new_b, new_b.height)){
            new_new_b = copy_board(new_b, new_b.height)
            get_all_pcs(new_new_b, queue.slice(1), hold, history.concat(mino), new_new_b.height)
        }

        // hold mino as next
        for (let mino of get_all_lowest(hold, new_b, new_b.height)){
            new_new_b = copy_board(new_b, new_b.height)
            get_all_pcs(new_new_b, queue.slice(1), queue[0], history.concat(mino), new_new_b.height)
        }
    }
}

function eliminate_duplicate_solutions(b, sols){
    let new_sols = new Array;
    let seen = new Array;

    for (let s of sols){

        let new_b = Array.from({length: 4}, () => Array(10).fill(0)) // fills with blocks
         // offset is to cover for if any lines are cleared in the middle of the solution
        let offset = Array(4).fill(0);
        let cleared = Array(4).fill(false)
        for (let m of s){

            for (let i=0; i<m.blocks.length; i++){
                new_b[m.o.y + m.blocks[i][1] + offset[m.o.y + m.blocks[i][1]]][m.o.x + m.blocks[i][0]] = m.type;
            }

            // check if any lines have been cleared, if so, modify offset appropriately
            let new_offset = offset.slice()
            for (let row=3; row>=0; row--){
                if (!cleared[row]){
                    let sum = 0;
                    for (let block=0; block<10; block++){
                        if (b.blocks[row][block] != 0 || new_b[row][block] != 0){
                            sum++;
                        }
                    }
                    if (sum === 10){
                        // modifying offset
                        new_offset.splice(row-offset[row], 1)
                        for (let i=row-offset[row]; i<new_offset.length; i++){
                            new_offset[i]++;
                        }
                        new_offset.push(new_offset[new_offset.length - 1])
                        cleared[row] = true
                    }
                }       
            }
            offset = new_offset.slice()
        }

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

