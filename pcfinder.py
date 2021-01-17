# pcfinder.py - module to find all possible perfect clears given a queue and boardstate

from copy import deepcopy

from objects import Mino, Board, collision

def possible_positions(type, board, height):
    possible = []
    b = [board.blocks[row] for row in range(-height, 0)]
    
    for perm in range(4):
        for row in range(len(b)):
            for column in range(len(b[row])):
                tempMino = Mino(type, column, row, perm)
                if not collision(tempMino, b):
                    tempMino.oy = len(board.blocks) - height + row
                    tempMino.new_coords()
                    
                    if tempMino.oy == tempMino.get_bottommost_pos(board).oy:
                        possible.append(tempMino)
    return possible # a list of Minos

class State:
    def __init__(self, curr, hold, queue, board):
        self.curr = curr #char
        self.hold = hold #char
        self.queue = queue #list of chars
        self.board = board #Board
        self.cleared = [] #list of chars


def findpc(curr, queue, board, height):
    # Make sure the board is pc-able with the height of the stack:
    height = 100
    blockcount = 0
    for row_index in range(len(board.blocks)):
        blockcount += board.blocks[row_index].count(1)
        if board.blocks[row_index].count(1) > 0 and row_index < height:
            height = len(board.blocks) - row_index
    if blockcount > blockcount or blockcount % 2 != 0:
        return 'Odd amount of blocks!'
    elif (height * 10 - blockcount) // 4 > len([curr] + queue):
        return 'Queue not long enough!'

    print('Searching for PC...')
    final_arrangements = []
    seen = []
    while not (height * 10 - blockcount) // 4 > len([curr] + queue) and height <= 4: # Maximum height to check is 4
        arrangements = []
        for m in possible_positions(curr.type, board, height):
            arrangements.append([m])

        for mino_type in queue:
            temparr = []
            for arrangement in arrangements:
                tempboard = board.copy()
                cleared = 0
                for m in arrangement:
                    tempboard.place_mino(m)
                    cleared += len(tempboard.clearrows())

                    if cleared == height:
                        final_arrangements.append(arrangement)
                        break
                        
                
                for m in possible_positions(mino_type, tempboard, height - cleared):
                    temparr.append(arrangement + [m])
            arrangements = deepcopy(temparr)

        final_arrangements += arrangements
        height += 1
    
    return final_arrangements