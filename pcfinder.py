# pcfinder.py - module to find all possible perfect clears given a queue and boardstate

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
    return possible
 
def findpc(type, board, height):
    removed = [[] for row in range(height)]
    