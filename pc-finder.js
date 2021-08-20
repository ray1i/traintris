// ---- DISPLAY ---- //

var pc_canvas = document.getElementById('pc-canvas');
var pc_ctx = pc_canvas.getContext('2d');
pc_ctx.scale(blocksize, blocksize);

window.onload = draw_bg();

function draw_bg(){
    pc_ctx.drawImage(boardsprite, 0, 0, 10, 20);
}

var result = {
    board: copy_board(board),
    solutions: [],
    index: 0,
    error: false,
    error_message: '',
    draw(){
        // -- draw existing pieces -- //
        pc_ctx.globalAlpha = 1;
        for (let i=0; i<this.board.blocks.length; i++){
            for (let j=0; j<this.board.blocks[i].length; j++){
                pc_ctx.drawImage(blocksheet, blocksize*minoindexes[this.board.blocks[i][j]], 0, blocksize, blocksize, j, 19 - i, 1, 1);
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
                        if (this.board.blocks[row][block] != 0 || new_b[row][block] != 0){
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
        this.index--;
        if (this.index < 0) this.index = this.solutions.length - 1;
        draw_all();
    },
    index_add() {
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

function find_all_pcs(b, curr, hold, queue){
    
    // if hold exists, append current mino to beginning of queue, otherwise make current mino held
    var new_queue = Array.from(queue);
    var new_hold;
    if (hold != null){
        new_queue.splice(0, 0, curr.type);
        new_hold = hold.type
    }
    else {
        new_hold = curr.type
    }

    result.error = false;
    result.error_message = '';
    if (is_pcable(b, [new_hold].concat(new_queue))){
        result.solutions = [];
        result.board = copy_board(board);

        get_all_pcs(b, new_queue.slice(), new_hold, new Array);
    }

    result.index = 0;
    draw_all();
}

// ---- PC FINDING ---- //

const single_perms = { //to ensure identical minos aren't checked twice (e.g. s-piece flipped 180)
    "I": [0, 1],
    "O": [0],
    "T": [0, 1, 2, 3],
    "L": [0, 1, 2, 3],
    "J": [0, 1, 2, 3],
    "Z": [0, 1],
    "S": [0, 1],
};
function get_all_lowest(m_type, b, height=4){
    // m_type is string (char)
    var result = [];

    for (var perm of single_perms[m_type]){
        for (var x = 0; x < 10; x++){
            for (var y = 0; y < height; y++){
                tempmino = new Mino(x, y, m_type, perm);
                if (!collide(b, tempmino) && is_lowest(b, tempmino)){
                    result.push(tempmino);
                }
            }
        }
    }

    return result; //returns array of Minos
}

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

function is_pcable(b, queue, height=4){// check if board is pc-able given queue
    // check if board height is higher than pc height
    for (var i = height; i<b.blocks.length; i++){        
        for (block of b.blocks[i]){
            if (block) {
                result.error = true;
                result.error_message = 'Board height is higher than ' + height + '!'
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
        result.error = true;
        result.error_message = 'Remaining space is not divisible by 4!'
        return false;
    }

    // check if queue length is long enough to pc
    if (empty_blocks / 4 >  queue.length) {
        result.error = true;
        result.error_message = 'Queue is not long enough!'
        return false;
    }

    return true;
}

function get_all_pcs(b, queue, hold, history, height=4) {
    //console.count('pc')
    // history is history of placed minos

    var new_b = copy_board(b, height);

    //console.log(history)
    //console.table(new_b.blocks)

    if (history != 0){
        new_b.place_mino(history[history.length - 1]);
        new_b.clear();
    }

    // if the board is empty i.e. if it's a pc
    if (new_b.height === 0) {
        result.solutions.push(history);
        return;
    }
    else if (queue.length <= 0) {
        return;
    }
    else {
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

function is_reachable(b, m){
    //tood: add reachable check
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







