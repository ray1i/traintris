

var solutions = [];

// when it gets input from the main file, run everything else.
// state.data has b (2d Array of Chars), curr (Char), hold (Char), queue (Array of Chars)
self.onmessage = function (state){

    // if hold exists, append current mino to beginning of queue, otherwise make current mino held
    var new_queue = Array.from(state.data.queue);
    var new_hold;
    if (state.data.hold != null){
        new_queue.splice(0, 0, state.data.curr);
        new_hold = state.data.hold
    }
    else {
        new_hold = state.data.curr
    }

    new_b = copy_board({width: state.data.b[0].length, blocks: state.data.b})


    solutions = []; // this will be Array of Array of Minos if there are solutions, otherwise it will be a string where the string is the error message
    if (is_pcable(new_b, [new_hold].concat(new_queue))){

        console.log('searching for pcs...')

        get_all_pcs(new_b, new_queue.slice(), new_hold, new Array);
    }

    self.postMessage(solutions)

    console.log('finished.')

}

const single_perms = { //to ensure identical minos aren't checked twice (e.g. s-piece flipped 180)
    "I": [0, 1],
    "O": [0],
    "T": [0, 1, 2, 3],
    "L": [0, 1, 2, 3],
    "J": [0, 1, 2, 3],
    "Z": [0, 1],
    "S": [0, 1],
};

function is_lowest(b, m){
    // m is Mino, b is Board
    for (let block of m.blocks){
        if (m.o.y + block[1] === 0){
            return true;
        } 
        else if (b.blocks[m.o.y + block[1] - 1][m.o.x + block[0]]){
            return true;
        }
    }
    return false;
}

function get_all_lowest(m_type, b, height=4){
    // m_type is string (char)
    var result = [];

    for (var perm of single_perms[m_type]){
        for (var x = 0; x < 10; x++){
            for (var y = 0; y < height; y++){
                tempmino = new Mino(x, y, m_type, perm);
                if (!collide(b, tempmino) && is_lowest(b, tempmino) && is_reachable(b, tempmino, 0)){
                    result.push(tempmino);
                }
            }
        }
    }
    return result; //returns array of Minos
}

// b is board, m is Mino
function is_reachable(b, m, iter=0){
    // check if we've already done too much iterations of this
    if (iter > 4){
        return false;
    }
    // check if the mino is already collided with the board
    else if (collide(b, m)){
        return false;
    }
    // check if it can just go straight up
    var can_go_up = true
    for (let block of m.blocks){
        if (can_go_up){
            for (let i=0; i<b.blocks.length; i++){
                try {
                    if (b.blocks[m.o.y + block[1] + i][m.o.x + block[0]]){
                        can_go_up = false;
                        break;
                    }
                } catch (IndexError) {} // pass, means the block is probably above the board
            }
        }
        else break;
    }
    if (can_go_up) return true;
    // check each dir: up, left, right (no down)
    if (is_reachable(b, m.copy(0, 1), iter+1) || is_reachable(b, m.copy(-1, 0), iter+1), is_reachable(b, m.copy(1, 0), iter+1)){
        return true;
    }
    // check each rotation
    else {
        return true;
    }

}

function is_pcable(b, queue, height=4){// check if board is pc-able given queue
    // check if board height is higher than pc height
    for (var i = height; i<b.blocks.length; i++){        
        for (block of b.blocks[i]){
            if (block) {
                solutions = 'Board height is higher than ' + height + '!'
                return false;
            }
        }
    }
    
    // check if number of empty spaces on board is divisible by 4
    var empty_blocks = 0;
    for (var i = 0; i<height; i++){        
        for (block of b.blocks[i]){
            if (!block) empty_blocks++;
        }
    } // TODO: check for each height, not jsut 4
    if (empty_blocks % 4 != 0) {
        solutions = 'Remaining space is not divisible by 4!'
        return false;
    }

    // check if queue length is long enough to pc
    if (empty_blocks / 4 >  queue.length) {
        solutions = 'Queue is not long enough!'
        return false;
    }

    return true;
}

function get_all_pcs(b, queue, hold, history, height=4) {
    // history is history of placed minos

    var new_b = copy_board(b, height);

    if (history != 0){
        new_b.place_mino(history[history.length - 1]);
        new_b.clear();
    }

    // if the board is empty i.e. if it's a pc
    if (new_b.height === 0) {
        solutions.push(history);
        return;
    }
    else if (queue.length <= 0) {
        return;
    }
    else {
        // TODO: account for case where both the curr and hold mino need to be used
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

function copy_board(b, height=4){
    //does not copy reset(), draw()

    var tempB = {
        width: b.width,
        height: height,
        blocks: new Array,
    
        place_mino: function(m){
            for (let block of m.blocks){
                this.blocks[m.o.y + block[1]][m.o.x + block[0]] = m.type;
            }
        },
    
        clear: function(){
            for (var i=0; i<this.blocks.length; i++){
                var sum = 0;
                for (let block of this.blocks[i]) {
                    if (block) sum++;
                }
                if (sum === this.width) {
                    this.blocks.splice(i, 1);
                    i--;
                    this.height--;
                }
            }
        }
    };

    for (var i=0; i<height; i++){
        tempB.blocks.push(b.blocks[i].slice());
    }

    return tempB;
}


// --- Stuff copied from traintris.js --- //

const types = {
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
const offsets = {
    'I': [
        [[ 0, 0], [-1, 0], [+2, 0], [-1, 0], [+2, 0]],
        [[-1, 0], [ 0, 0], [ 0, 0], [ 0,+1], [ 0,-2]],
        [[-1, +1], [+1,+1], [-2,+1], [+1, 0], [-2, 0]],
        [[ 0,+1], [ 0,+1], [ 0,+1], [ 0,-1], [ 0,+2]]
    ],
    'O': [
        [[ 0, 0]],
        [[ 0,-1]],
        [[-1,-1]],
        [[-1, 0]]
    ]
};
['T', 'L', 'J', 'Z', 'S'].forEach((t) => {
    offsets[t] = [
        [[ 0, 0], [ 0, 0], [ 0, 0], [ 0, 0], [ 0, 0]],
        [[ 0, 0], [+1, 0], [+1,-1], [ 0,+2], [+1,+2]],
        [[ 0, 0], [ 0, 0], [ 0, 0], [ 0, 0], [ 0, 0]],
        [[ 0, 0], [-1, 0], [-1,-1], [ 0,+2], [-1,+2]]
    ]
});

class Mino {
    constructor(ox, oy, type, perm = 0) {
        this.o = {
            x: ox,
            y: oy
        };
        this.type = type;
        //this.perm = perm - (Math.floor(perm/4) * 4) 
        this.perm = 0;

        this.blocks = Array.from(types[this.type]);
        this.rotate(perm - (Math.floor(perm/4) * 4));
    };
    
    move(b, x, y) {
        if (!collide(b, this.copy(x, y))) {
            this.o.x += x;
            this.o.y += y;   
        }
    };

    rotate(n) {
        for (let i=0; i<n; i++){
            for (let j=0; j<this.blocks.length; j++){
                this.blocks[j] = [this.blocks[j][1], -this.blocks[j][0]];
            }
        }
        this.perm = this.perm + n - (Math.floor((this.perm + n)/4) * 4) // dumb math stuff just converts values that are <0 or >3
    };

    srs_rotate(b, n) {
        var newperm = this.perm + n - (Math.floor((this.perm + n)/4) * 4)
        for (let i=0; i<5; i++){
            let offset = [offsets[this.type][this.perm][i][0] - offsets[this.type][newperm][i][0], offsets[this.type][this.perm][i][1] - offsets[this.type][newperm][i][1]]
            if (!collide(b, this.copy(offset[0], offset[1], n))){
                this.o.x += offset[0];
                this.o.y += offset[1];
                this.rotate(n);
                break;
            }
        }
    }

    lowest(b) {
        let i = -1;
        while (!collide(b, this.copy(0, i))){
            i--;
        }
        return this.copy(0, i + 1);
    }

    draw(context=ctx, x=0, y=0) { //x and y are the origin
        if (y === 0) {
            for (let i=0; i<this.blocks.length; i++){
                context.drawImage(blocksheet, blocksize*minoindexes[this.type], 0, blocksize, blocksize, 
                                  this.o.x + this.blocks[i][0] + x, 19 - (this.o.y + this.blocks[i][1]), 1, 1);
            }
        } else {
            for (let i=0; i<this.blocks.length; i++){
                context.drawImage(blocksheet, blocksize*minoindexes[this.type], 0, blocksize, blocksize, 
                                  x + this.blocks[i][0], y - this.blocks[i][1], 1, 1);
            }
        }
        
    };

    copy(movex, movey, rotation=0) {
        return new Mino(this.o.x + movex, this.o.y + movey, this.type, this.perm + rotation);
    }
}

function collide(b, m){ // this function is copied from the main file
    for (let block of m.blocks){
        if (b.blocks[m.o.y + block[1]] === undefined || b.blocks[m.o.y + block[1]][m.o.x + block[0]] === undefined || b.blocks[m.o.y + block[1]][m.o.x + block[0]]) {
            return true;
        }
    }
    return false;
}
