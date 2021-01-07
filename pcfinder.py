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
 
def findpc(curr, queue, board, height):
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

                if cleared == 4:
                    return [arrangement]
                    
            
            for m in possible_positions(mino_type, tempboard, height - cleared):
                temparr.append(arrangement + [m])
        arrangements = deepcopy(temparr)
    
    return arrangements