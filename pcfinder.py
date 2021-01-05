# pcfinder.py - module to find all possible perfect clears given a queue and boardstate

from objects import Mino, Board, collision

def possible_positions(type, board, height):
    possible = []
    b = [board.blocks[row] for row in range(-height, 0)]
    
    for perm in range(4):
        for row in range(len(b)):
            for column in range(len(b[row])):
                #try:
                #print(column)
                tempMino = Mino(type, column, row, perm)
                #except IndexError:
                    #break
                tempMino.oy = len(board.blocks) - height + row
                tempMino.new_coords()
                possible.append(tempMino)
    return possible
 
