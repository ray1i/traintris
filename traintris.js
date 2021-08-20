// ---- CANVAS ---- //

var canvas = document.getElementById("board")
var ctx = canvas.getContext("2d"); 

var hold_canvas = document.getElementById("hold");
var hold_ctx = hold_canvas.getContext("2d");

var queue_canvas = document.getElementById("queue");
var queue_ctx = queue_canvas.getContext("2d");

const blocksize = 32;
ctx.scale(blocksize, blocksize);
hold_ctx.scale(blocksize, blocksize);
queue_ctx.scale(blocksize, blocksize);

// ---- OBJECTS --- //

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

const minoindexes = {'I':0, 'O':1, 'T':2, 'L':3, 'J':4, 'Z':5, 'S':6, 'G':7}; // used for blocksheet

// Sprites
const blocksheet = new Image();
blocksheet.src = "img/blocksheet.png";
const boardsprite = new Image();
boardsprite.src = 'img/board.png'

function collide(b, m){
    for (let block of m.blocks){
        if (b.blocks[m.o.y + block[1]] === undefined || b.blocks[m.o.y + block[1]][m.o.x + block[0]] === undefined || b.blocks[m.o.y + block[1]][m.o.x + block[0]]) {
            return true;
        }
    }
    return false;
}

var board = {
    height: 40,
    width: 10,
    blocks: Array.from({length: 40}, () => Array(10).fill(0)),

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
                this.blocks.push(Array(10).fill(0));
                i--;
            }
        }
    },

    reset: function() {
        this.blocks = Array.from({length: 40}, () => Array(10).fill(0));
    },

    draw: function(context=ctx){
        for (let i=0; i<this.blocks.length; i++){
            for (let j=0; j<this.blocks[i].length; j++){
                context.drawImage(blocksheet, blocksize*minoindexes[this.blocks[i][j]], 0, blocksize, blocksize, j, 19 - i, 1, 1);
            }
        }
    }
};

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

var default_queue = {
    base: ['T', 'I', 'O', 'L', 'J', 'S', 'Z'],
    shuffled: function() { //Fisher-Yates shuffle
        var new_queue = [...this.base];
        var remaining = new_queue.length;
        var i;
        while (remaining){
            i = Math.floor(Math.random() * remaining--);
            [new_queue[remaining], new_queue[i]] = [new_queue[i], new_queue[remaining]];
        }   
        return new_queue;
    }
};
var queue = {
    min_length: 5,
    blocks: [], // array of chars
    extend: function() {
        this.blocks = this.blocks.concat(default_queue.shuffled());
    },
    
    draw: function() {
        queue_ctx.clearRect(0, 0, queue_canvas.width, queue_canvas.height);
        for (var i=0; i<this.blocks.length; i++){
            tempMino = new Mino(0, 0, this.blocks[i]);
            tempMino.draw(queue_ctx, 1, i*4 + 1);
        }
    }
};

// ---- GAMEPLAY ---- //

const fps = 60;
var frame;

window.onload = start();
setInterval(update, 1000/fps);

var currMino, holdMino;

function start(){ //and restart
    queue.blocks = default_queue.shuffled();
    currMino = new Mino(4, 20, queue.blocks.shift(), 0);
    holdMino = null;
    board.reset();
    
    frame = 0;
}

function update(){
    frame++;
    
    handle_controls();

    // --- DRAW --- //
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(boardsprite, 0, 0, 10, 20);
    // curr
    currMino.draw();
    // ghost
    ctx.globalAlpha = 0.5;
    currMino.lowest(board).draw();
    ctx.globalAlpha = 1;
    // board
    board.draw();

    // queue
    queue.draw();

    // hold
    hold_ctx.clearRect(0, 0, hold_canvas.width, hold_canvas.height);
    if (holdMino !== null) holdMino.draw(hold_ctx, 1, 1);
}

// ---- CONTROLS ---- //

var keys = new Set();
var das = {'value': 6, 'start': null};
var arr = {'value': 1, 'start': null};

//eventually: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/location
var controls = {
    left: 'ArrowLeft',
    right: 'ArrowRight',
    soft_drop: 'ArrowDown',
    hard_drop: ' ',
    c: 'x',
    ccw: 'z',
    one_eighty: 'ArrowUp',
    hold: 'Control',
    reset: 'F4'
}

function handle_controls(){
    for (let k of keys){
        switch (k){
            case controls.left:
                if (das.start === null) {
                    das.start = frame;
                    arr.start = das.start + das.value;
                    currMino.move(board, -1, 0);
                } 
                else if (das.start + das.value < frame && frame >= arr.start + arr.value){
                    arr.start += arr.value;
                    currMino.move(board, -1, 0);
                }
                break;
            case controls.right:
                if (das.start === null) {
                    das.start = frame;
                    arr.start = das.start + das.value;
                    currMino.move(board, 1, 0);
                } 
                else if (das.start + das.value < frame && frame >= arr.start + arr.value){
                    arr.start += arr.value;
                    currMino.move(board, 1, 0);
                }
                break;
            case controls.soft_drop:
                currMino.move(board, 0, -1);
                break;
            case controls.hard_drop:
                board.place_mino(currMino.lowest(board));
                board.clear();

                currMino = new Mino(4, 20, queue.blocks.shift(), 0);
                if (queue.blocks.length < queue.min_length) queue.extend();
                
                keys.delete(controls.hard_drop)
                break;
            case controls.c:
                currMino.srs_rotate(board, 1);
                keys.delete(controls.c);
                break;
            case controls.ccw:
                currMino.srs_rotate(board, 3);
                keys.delete(controls.ccw);
                break;
            case controls.one_eighty:
                currMino.srs_rotate(board, 2);
                keys.delete(controls.one_eighty);
                break;
            case controls.hold:
                if (holdMino === null) {
                    holdMino = new Mino(0, 0, currMino.type);
                    currMino = new Mino(4, 20, queue.blocks.shift());
                } else {
                    var temp = holdMino.type;
                    holdMino = new Mino(0, 0, currMino.type);
                    currMino = new Mino(4, 20, temp);
                }
                keys.delete(controls.hold);
                break;
            case controls.reset:
                start();
                keys.delete(controls.reset);
                break;
        }
    }
}

window.addEventListener('keydown', function(e){
    if (!e.repeat) keys.add(e.key);
})
window.addEventListener('keyup', function(e){
    keys.delete(e.key);
    if (e.key == controls.left || e.key == controls.right) {
        das.start = null;
        arr.start = null;   
    }
})

var board_elem = document.getElementById('board');
var drawing = false; // 1 for drawing, 2 for erasing
board_elem.addEventListener("mousedown", (e) => {
    if (board.blocks[19 - Math.floor(e.offsetY/blocksize)][Math.floor(e.offsetX/blocksize)]) {
        board.blocks[19 - Math.floor(e.offsetY/blocksize)][Math.floor(e.offsetX/blocksize)] = 0;
        drawing = 2;
    }
    else {
        board.blocks[19 - Math.floor(e.offsetY/blocksize)][Math.floor(e.offsetX/blocksize)] = 'G';
        drawing = 1;
    }
});

board_elem.addEventListener("mousemove", (e) => {
    if (drawing === 1){
        if (19 - Math.floor(e.offsetY/blocksize) < board.height && Math.floor(e.offsetX/blocksize) < board.width){
            board.blocks[19 - Math.floor(e.offsetY/blocksize)][Math.floor(e.offsetX/blocksize)] = 'G'
        }
    }
    else if (drawing === 2){
        if (19 - Math.floor(e.offsetY/blocksize) < board.height && Math.floor(e.offsetX/blocksize) < board.width){
            board.blocks[19 - Math.floor(e.offsetY/blocksize)][Math.floor(e.offsetX/blocksize)] = 0
        }
    }
});

board_elem.addEventListener("mouseup", (e) => {
    drawing = false;
});