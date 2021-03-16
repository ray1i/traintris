# pcfinder.py - module to find all possible perfect clears given a queue and boardstate

from copy import deepcopy

from objects import Mino, Board, collision

def possible_positions(type, board, height):
    possible = []
    b = [board.blocks[row] for row in range(height)]
    
    for perm in range(4):
        for row in range(len(b)):
            for column in range(len(b[row])):
                tempMino = Mino(type, column, row, perm)
                if not collision(tempMino, b) and tempMino.oy == tempMino.get_bottommost_pos(board).oy:
                    possible.append(tempMino)
    return possible # a list of Minos

class State:
    def __init__(self, curr, hold, queue, board, height):
        self.curr = curr #char
        self.hold = hold #char
        self.queue = queue #list of chars
        self.board = board #Board
        self.cleared = [[None for s in range(10)] for t in range(height)] #array of chars
        self.cleared_offset = [0 for s in range(height)]
        self.height = height #int
    
    def clearrows(self):
        notallchecked = True
        while notallchecked:
            for i in range(len(self.board.blocks)):
                if self.board.blocks[i] == [1 for s in range(10)]:
                    self.cleared[i + self.cleared_offset[i]] = self.board.types[i]
                    self.cleared_offset.pop(i)
                    for j in range(i, len(self.cleared_offset)):
                        self.cleared_offset[j] += 1
                    self.board.blocks.pop(i)
                    self.board.types.pop(i)
                    self.height -= 1
                    break
                if i == len(self.board.blocks) - 1:
                    notallchecked = False
    
    def copy(self):
        tempState = State(self.curr, self.hold, self.queue.copy(), self.board.copy(), self.height)
        tempState.cleared = deepcopy(self.cleared)
        tempState.cleared_offset = self.cleared_offset.copy()
        return tempState

def findallpcs(curr, hold, queue, board, maxheight_tocheck=4):
    # Make sure the height of the stack is less than the max height to check:
    for row in range(maxheight_tocheck, len(board.blocks)):
        if board.blocks[row] != [0 for c in range(len(board.blocks[row]))]:
            print(f'Board is higher than {maxheight_tocheck}!')
            return

    # Get the max height of the stack:
    maxheight = board.height
    for row in range(board.height - 1, -1, -1):
        if board.blocks[row] != [0 for c in range(board.width)]:
            break
        maxheight -= 1

    # Find possible PCs from max height of stack to max height to check
    final_arrangements = []
    for height in range(maxheight, maxheight_tocheck + 1):
        # Make sure the board is pc-able with the given height:
        blockcount = 0
        for row_index in range(height):
            blockcount += board.blocks[row_index].count(1)
        if (height * 10 - blockcount) % 4 == 0 and (height * 10 - blockcount) / 4 <= len([curr] + [hold] + queue):
            # Search for all pcs with the given height, append to final_arrangements:
            final_arrangements += findpc(curr, hold, queue, board, height)

    print(f'{len(final_arrangements)} PCs found!')
    return final_arrangements #list of 2d array of chars

def findpc(curr, hold, queue, board, height):
    print(f'Searching for PC of height {height}...')
        
    seen = []
    q = [State(curr, hold, queue.copy(), board.copy(), height), State(curr, hold, queue.copy(), board.copy(), height)]
    arrangements = []

    while q != []:
        for m in possible_positions(q[0].curr, q[0].board, q[0].height):
            tempState = q[0].copy()
            tempState.board.place_mino(m)
            tempState.clearrows()
            tempState.curr = tempState.queue.pop(0)

            if tempState.height <= 0:
                arrangements.append(deepcopy(tempState.cleared))
            else:
                if tempState not in seen:
                    q.append(tempState.copy())
                tempState.curr, tempState.hold = tempState.hold, tempState.curr # Swap hold and curr
                if tempState not in seen:
                    q.append(tempState.copy())
        seen.append(q.pop(0))

    return arrangements # list of arrays of chars