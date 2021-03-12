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
        self.cleared = [] #array of chars
    
    def updatecleared(self):
        pass
        #for row in board.

def findallpcs(curr, hold, queue, board, maxheight_tocheck=4):
    # Make sure the height of the stack is less than the max height to check:
    for row in range(len(board.blocks) - maxheight_tocheck):
        if board.blocks[row] != [0 for c in range(len(board.blocks[row]))]:
            print(f'Board is higher than {maxheight_tocheck}!')
            return

    # Get the max height of the stack:
    maxheight = maxheight_tocheck
    for row in range(len(board.blocks) - maxheight_tocheck, len(board.blocks)):
        if board.blocks[row] != [0 for c in range(len(board.blocks[row]))]:
            break
        else:
            maxheight -= 1
    
    # Find possible PCs from max height of stack to max height to check
    final_arrangements = []
    for height in range(maxheight, maxheight_tocheck):
        # Make sure the board is pc-able with the given height:
        blockcount = 0
        for row_index in range(-height, 0):
            blockcount += board.blocks[row_index].count(1)
        if (height * 10 - blockcount) % 4 == 0 and (height * 10 - blockcount) // 4 >= len([curr] + [hold] + queue):
            final_arrangements += findpc(curr, hold, queue, board, height)
    
    return final_arrangements

def findpc(curr, hold, queue, board, height):
    print(f'Searching for PC of height {height}...')
        
    seen = []
    q = [State(curr, hold, queue, board)] # This is not the in-game queue, it is the queue for BFS
    arrangements = []
    for m in possible_positions(curr.type, board, height):
        arrangements.append([m])

    while queue != []:
        for m in possible_positions(curr.type, board, height):
            pass

    return arrangements # list of arrays of strings