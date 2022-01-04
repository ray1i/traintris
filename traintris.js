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

// Board
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

// Mino
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
    
    move(b, x, y) { // moves mino x right and y down, returns true if successful, false if collision
        if (!collide(b, this.copy(x, y))) {
            this.o.x += x;
            this.o.y += y;
            return true  
        }
        return false
    };

    rotate(n) {
        for (let i=0; i<n; i++){
            for (let j=0; j<this.blocks.length; j++){
                this.blocks[j] = [this.blocks[j][1], -this.blocks[j][0]];
            }
        }
        this.perm = (this.perm + n + 4) % 4
    };

    srs_rotate(b, n) {
        var newperm = (this.perm + n + 4) % 4
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

// Queue
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

// Array of Objects that each contain 1 2d Array (blocks) and 2 Chars (curr, hold)
function get_current_state(){
    if (holdMino === null){
        return({
            blocks: JSON.parse(JSON.stringify(board.blocks)),
            curr: currMino.type,
            hold: null,
            queue: null
        })
    }
    else {
        return ({
            blocks: JSON.parse(JSON.stringify(board.blocks)),
            curr: currMino.type,
            hold: holdMino.type,
            queue: null
        })
    }
}

// ---- GAMEPLAY ---- //

const fps = 60;
var frame;

window.onload = start();
setInterval(update, 1000/fps);

var currMino, holdMino;

function start(){ //and restart
    queue.blocks = default_queue.shuffled();
    currMino = new Mino(4, 20, queue.blocks.shift(), 0);
    holdMino = null; // todo: replace with some sort of null Mino
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

// ---- UNDO/REDO ---- //

const history_size = 50;

// each one is an Array of Objects that each contain 1 2d Array (blocks) and 2 Chars (curr, hold), and one Array of Chars/null (queue)
var undo_history = new Array(); // the end is the most recent
var redo_history = new Array(); // the end is the most recent

function undo() {
    traintris_elem.focus();
    if (undo_history.length === 0){}
    else {
        var state = undo_history.pop()

        if (state.queue === null) {

            redo_history.push(get_current_state())

            board.blocks = state.blocks
            if (holdMino === null || holdMino.type === state.hold) { // i.e. hold mino has not changed
                queue.blocks.unshift(currMino.type)
                currMino = new Mino(4, 20, state.curr, 0)
            }
            else if (state.hold === null){
                queue.blocks.unshift(currMino.type)
                queue.blocks.unshift(holdMino.type)
                holdMino = null
                currMino = new Mino(4, 20, state.curr, 0)
            }
            else {
                queue.blocks.unshift(holdMino.type)
                holdMino = new Mino(0, 0, state.hold);
                currMino = new Mino(4, 20, state.curr, 0)
            }
        }
        else { // undoing queue/hold input

            let temp = get_current_state()
            temp.queue = [...queue.blocks]

            redo_history.push(temp)

            queue.blocks = [...state.queue]
            currMino = new Mino(4, 20, state.curr, 0)
            if (holdMino === null) {
                holdMino = null
            }
            else {
                queue.blocks.unshift(holdMino.type)
                holdMino = new Mino(0, 0, state.hold);
            }

        }
    }
}

function redo() {
    traintris_elem.focus();
    if (redo_history.length === 0){}
    else {
        var state = redo_history.pop()

        if (state.queue === null) {

            undo_history.push(get_current_state())

            board.blocks = state.blocks

            queue.blocks.shift()
            currMino = new Mino(4, 20, state.curr, 0)
            if (state.hold !== null) { // i.e. hold mino has not changed
                holdMino = new Mino(0, 0, state.hold);
            }
        }
        else { // undoing queue/hold input

            let temp = get_current_state()
            temp.queue = [...queue.blocks]

            undo_history.push(temp)

            queue.blocks = [...state.queue]
            currMino = new Mino(4, 20, state.curr, 0)
            if (holdMino === null) {
                holdMino = null
            }
            else {
                queue.blocks.unshift(holdMino.type)
                holdMino = new Mino(0, 0, state.hold);
            }

        }


    }
}

// ---- CONTROLS ---- //

const default_settings = {
    das: 10, 
    arr: 1, 
    sd: 1, 
    left: 'ArrowLeft',
    right: 'ArrowRight',
    ccw: 'z',
    c: 'ArrowUp',
    one_eighty: 'a',
    hold: 'c',
    soft_drop: 'ArrowDown',
    hard_drop: ' ',
    reset: 'F4'
}

var keys = new Set();
var das = {value: 10, start: {left: null, right: null}};
var arr = {value: 1, start: {left: null, right: null}};
var sd = {value: 1, start: null}; // soft drop delay
var recent_direction = null; // so that if both 

//eventually: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/location
var controls = {
    left: 'ArrowLeft',
    right: 'ArrowRight',
    ccw: 'z',
    c: 'x',
    one_eighty: 'ArrowUp',
    hold: 'Control',
    soft_drop: 'ArrowDown',
    hard_drop: ' ',
    reset: 'F4'
}

// get cookies if they exist, if not, set default controls
var current_settings;
if (document.cookie === '') current_settings = JSON.parse(JSON.stringify(default_settings))
else current_settings = JSON.parse(document.cookie)

function cookie_to_settings(){
    settings = current_settings
    das.value = settings.das
    arr.value = settings.arr
    sd.value = settings.sd
    controls.left = settings.left
    controls.right = settings.right
    controls.ccw = settings.ccw
    controls.c = settings.c
    controls.one_eighty = settings.one_eighty
    controls.hold = settings.hold
    controls.soft_drop = settings.soft_drop
    controls.hard_drop = settings.hard_drop
    controls.reset = settings.reset
}

function current_settings_to_cookie(){
    document.cookie = JSON.stringify(current_settings)
}

cookie_to_settings();

function handle_controls(){
    for (let k of keys){
        switch (k){
            case controls.left:
                if (recent_direction === 'left'){
                    if (das.start.left === null) {
                        das.start.left = frame;
                        arr.start.left = das.start.left + das.value;
                        currMino.move(board, -1, 0);
                    } 
                    else if (das.start.left + das.value < frame && frame >= arr.start.left + arr.value){
                        if (arr.value > 0) {
                            arr.start.left += arr.value;
                            currMino.move(board, -1, 0);
                        } else if (arr.value === 0) {
                            // moves mino until it collides with something
                            while (currMino.move(board, -1, 0)){};
                        }
                    }
                }
                break;
            case controls.right:
                if (recent_direction === 'right'){
                    if (das.start.right === null) {
                        das.start.right = frame;
                        arr.start.right = das.start.right + das.value;
                        currMino.move(board, 1, 0);
                    } 
                    else if (das.start.right + das.value < frame && frame >= arr.start.right + arr.value){
                        if (arr.value > 0) {
                            arr.start.right += arr.value;
                            currMino.move(board, 1, 0);
                        } else if (arr.value === 0) {
                            while (currMino.move(board, 1, 0)){};
                        }
                    }
                }
                break;
            case controls.ccw:
                currMino.srs_rotate(board, 3);
                keys.delete(controls.ccw);
                break;
            case controls.c:
                currMino.srs_rotate(board, 1);
                keys.delete(controls.c);
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
            case controls.soft_drop:
                if (sd.start === null) {
                    sd.start = frame;
                    currMino.move(board, 0, -1);
                } 
                else if (sd.start + sd.value < frame){
                    if (sd.value > 0) {
                        sd.start += sd.value;
                        currMino.move(board, 0, -1);
                    } else if (sd.value === 0) {
                        while (currMino.move(board, 0, -1)){};
                    }
                }
                break;
            case controls.hard_drop:
                // clear redo_history
                redo_history = new Array();
                // add to undo_history
                undo_history.push(get_current_state())
                if (undo_history.length > history_size) undo_history.slice(1) // don't store more than size
            
                board.place_mino(currMino.lowest(board));
                board.clear();

                currMino = new Mino(4, 20, queue.blocks.shift(), 0);
                if (queue.blocks.length < queue.min_length) queue.extend();
                
                keys.delete(controls.hard_drop)
                break;
            case controls.reset:
                start();
                keys.delete(controls.reset);
                break;
        }
    }
}

// this is for keyboard controls for the game.
traintris_elem = document.getElementById('traintris-game')
traintris_elem.addEventListener('keydown', function(e){
    if (e.ctrlKey){
        if (e.key === 'z') undo();
        else if (e.key === 'y') redo();
    }
    else {
        if (!e.repeat) keys.add(e.key);
        if (e.key == controls.left){
            recent_direction = 'left'
        }
        else if (e.key == controls.right){
            recent_direction = 'right'
        }
    } 
})
traintris_elem.addEventListener('keyup', function(e){
    keys.delete(e.key);
    if (e.key == controls.left){
        das.start.left = null;
        arr.start.left = null;
        if (keys.has(controls.right)){
            recent_direction = 'right';
        }
    }
    else if (e.key == controls.right) {
        das.start.right = null;
        arr.start.right = null;
        if (keys.has(controls.left)){
            recent_direction = 'left';
        }
    }
    else if (e.key == controls.soft_drop) {
        sd.start = null;
    }
})

// this is for editing the queue and hold
function edit_queue() {
    new_queue_blocks = new Array()

    let new_queue = prompt("Enter the new queue", "TIOSLT")

    if (new_queue === null) return;

    new_queue = new_queue.toUpperCase();

    for (let c of new_queue){
        if ("IOTSZLJ".includes(c)) new_queue_blocks.push(c)
    }

    if (new_queue_blocks.length <= 0) {
        alert("Put at least 1 valid piece")
        return;
    }
    else {
        // add current state to undo history
        let temp_state = get_current_state()
        temp_state.queue = [...queue.blocks]
        undo_history.push(temp_state)

        if (undo_history > history_size) undo_history.shift()

        //currMino = new Mino(4, 20, new_queue_blocks.shift())
        queue.blocks = new_queue_blocks;

        if (queue.blocks.length < queue.min_length) queue.extend();
    }

}

function edit_hold() {
    let new_hold = prompt("Enter the new hold piece", "Z")
    
    if (new_hold === null) return;

    for (let c of new_hold){
        if (new_hold != '' && "IOTSZLJ".includes(c.toUpperCase())) {
            let temp_state = get_current_state()
            temp_state.queue = queue.blocks
            undo_history.push(temp_state)
            if (undo_history > history_size) undo_history.shift()

            holdMino = new Mino(0, 0, c.toUpperCase())

            return;
        }
    }

    holdMino = null
}

// this is for drawing on the board with mouse.
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


// this is for putting text on the controls.
ctrls_buttons = document.getElementsByClassName('controls-button')
for (let i=0; i<ctrls_buttons.length; i++){
    ctrls_buttons[i].innerText = controls[Object.keys(controls)[i]].toUpperCase();
}
// this is for setting new controls
function set_new_key(control){

    ctrls_buttons[control].innerText = '[PRESS NEW KEY]'
    ctrls_buttons[control].addEventListener("keydown", function(e){
        controls[Object.keys(controls)[control]] = e.key;
        current_settings[Object.keys(controls)[control]] = e.key; // for cookie
        current_settings_to_cookie();
        ctrls_buttons[control].innerText = e.key.toUpperCase();
        this.removeEventListener("keydown", arguments.callee);
    })
    //controls[Object.keys(controls)[i]] = k;
}

// this is for putting text on tuning.
tuning_boxes = document.getElementsByClassName('tuning-box')
tuning_boxes[0].value = das.value
tuning_boxes[1].value = arr.value
tuning_boxes[2].value = sd.value
// this is for setting tuning settings.
function save_tuning(){
    if (isNaN(tuning_boxes[0].value) || isNaN(tuning_boxes[1].value) || isNaN(tuning_boxes[2].value)){
        alert('Tuning value must be number!')
    }
    else {
        das.value = parseInt(tuning_boxes[0].value)
        arr.value = parseInt(tuning_boxes[1].value)
        sd.value = parseInt(tuning_boxes[2].value)
        current_settings.das = das.value
        current_settings.arr = arr.value
        current_settings.sd = sd.value
        current_settings_to_cookie();
    }
}

//// =-=-=-= PC-FINDER =-=-=-= ////

// ---- DISPLAY ---- //

var pc_canvas = document.getElementById('pc-canvas');
var pc_ctx = pc_canvas.getContext('2d');
pc_ctx.scale(blocksize, blocksize);

window.onload = draw_bg();

function draw_bg(){
    pc_ctx.drawImage(boardsprite, 0, 0, 10, 20);
}

var result = {
    board: board.blocks.map(row => row.slice()),
    solutions: [],
    index: 0,
    error: false,
    error_message: '',
    draw(){
        // -- draw existing pieces -- //
        pc_ctx.globalAlpha = 1;
        for (let i=0; i<this.board.length; i++){
            for (let j=0; j<this.board[i].length; j++){
                pc_ctx.drawImage(blocksheet, blocksize*minoindexes[this.board[i][j]], 0, blocksize, blocksize, j, 19 - i, 1, 1);
            }
        }
        
        // -- draw solution pieces -- //
        pc_ctx.globalAlpha = 0.5;
        var new_b = Array.from({length: 4}, () => Array(10).fill(0)) // fills with blocks to draw later
        
        // offset is to cover for if any lines are cleared in the middle of the solution
        var offset = Array(4).fill(0);
        var cleared = Array(4).fill(false)
        for (let m of this.solutions[this.index]){

            for (let i=0; i<m.blocks.length; i++){
                new_b[m.o.y + m.blocks[i][1] + offset[m.o.y + m.blocks[i][1]]][m.o.x + m.blocks[i][0]] = m.type;
            }

            // check if any lines have been cleared, if so, modify offset appropriately
            var new_offset = offset.slice()
            for (let row=3; row>=0; row--){
                if (!cleared[row]){
                    let sum = 0;
                    for (let block=0; block<10; block++){
                        if (this.board[row][block] != 0 || new_b[row][block] != 0){
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
        for (var row = 0; row<4; row++){
            for (var column=0; column<10; column++){
                pc_ctx.drawImage(blocksheet, blocksize*minoindexes[new_b[row][column]], 0, blocksize, blocksize, 
                    column, 19 - row, 1, 1);
            }
        }

        pc_ctx.globalAlpha = 1;
    },
    index_subtract() {
        traintris_elem.focus();

        this.index--;
        if (this.index < 0) this.index = this.solutions.length - 1;
        draw_all();
    },
    index_add() {
        traintris_elem.focus();
        
        this.index++;
        if (this.index >= this.solutions.length) this.index = 0;
        draw_all();
    }
};

function draw_all(){

    pc_ctx.globalAlpha = 1;
    pc_ctx.clearRect(0, 0, pc_canvas.width, pc_canvas.height);
    draw_bg();

    if (result.solutions.length > 0){
        result.draw();
    }

    if (result.solutions.length > 0){
        document.getElementById('pc-result').innerText = 'Solution ' + (result.index + 1).toString() + ' of ' + result.solutions.length;
    } else if (result.error) {
        document.getElementById('pc-result').innerText = result.error_message;
    } else {
        document.getElementById('pc-result').innerText = 'No solutions found!';
    }
}

var pc_worker; 

function start_pc_worker(){
    //document.getElementById("pc-start-button").blur();
    traintris_elem.focus();

    // check if web workers are supported by browser
    if (typeof(Worker) !== 'undefined'){

        // check if there is already another worker active
        if (pc_worker == null) {

            document.getElementById('pc-result').innerText = "Searching...";

            pc_worker = new Worker("pc-finder.js");

            result.error = false;
            result.error_message = '';
            result.solutions = [];
            result.board = board.blocks.map(row => row.slice()); // this copies the blocks of board
            result.index = 0;

            if (holdMino === null){
                pc_worker.postMessage({b: board.blocks, curr: currMino.type, hold: null, queue: queue.blocks})
            }
            else {
                pc_worker.postMessage({b: board.blocks, curr: currMino.type, hold: holdMino.type, queue: queue.blocks})
            }
            

            pc_worker.addEventListener("message", function(e){ 

                if (typeof(e.data) == "string") {
                    result.error = true;
                    result.error_message = e.data;
                }
                else {
                    result.solutions = e.data;
                }
                
                draw_all();

                // kill worker
                pc_worker.terminate();
                pc_worker = null;
            });
        }
        else {
            document.getElementById('pc-result').innerText = "Another search is in progress!";
        }
    }

    else {
        document.getElementById('pc-result').innerText = "Web Workers aren't supported by your browser! :(";
    }
}