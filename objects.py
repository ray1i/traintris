import os
import pygame as pg

import mino_types as types
import srs

class Mino:
    def __init__(self, type, ox, oy, perm): #STARTS AT (19, 4)
        self.type = type
        self.ox = ox
        self.oy = oy
        self.perm = perm
        self.new_coords()

    def new_coords(self):
        self.x = [self.ox + s for s in types.init_x(self.type, self.perm)]
        self.y = [self.oy - s for s in types.init_y(self.type, self.perm)] #flipped bc of pygame's weird coords

    def move(self, h, v, b): #1 is right, -1 is left; 1 is up, -1 is down
        tempMino = self.copy()
        tempMino.ox += h
        tempMino.oy -= v #flipped bc of pygame's weird coords
        tempMino.new_coords()
        if not collision(tempMino, b.blocks):
            self.ox += h
            self.oy -= v #flipped bc of pygame's weird coords
            self.new_coords()

    def rotate(self, dir, b): #1 is cw, -1 is ccw, 2 is 180
        tempMino = self.copy()
        tempMino.perm += dir
        if tempMino.perm < 0:
            tempMino.perm += 4
        elif tempMino.perm > 3:
            tempMino.perm -= 4

        for offset in srs.get_offsets(tempMino.type, self.perm, tempMino.perm):
            tempMino.ox = self.ox + offset[0]
            tempMino.oy = self.oy - offset[1]
            tempMino.new_coords()

            if not collision(tempMino, b.blocks):
                self.perm = tempMino.perm
                self.ox = tempMino.ox
                self.oy = tempMino.oy
                self.new_coords()
                break

    def copy(self):
        tempMino = Mino(self.type, self.ox, self.oy, self.perm)
        return tempMino
    
    def get_bottommost_pos(self, b):
        m = self.copy()
        lower_m = m.copy()
        while not collision(lower_m, b.blocks):
            m = lower_m.copy()
            lower_m.oy += 1
            lower_m.new_coords()
        return m

    def draw(self, screen, sprite, x, y, px):
        for block in range(len(self.x)):
            screen.blit(sprite, (self.x[block] * px + x, self.y[block] * px + y - 20*px))

class Board:
    def __init__(self):
        self.blocks = [[0 for s in range(10)] for t in range(40)]
        self.image = pg.image.load(f'{os.path.dirname(__file__)}/board.png').convert_alpha()
        self.types = [[None for s in range(10)] for t in range(40)]

    def place_mino(self, mino):
        for i in range(len(mino.x)):
            self.blocks[mino.y[i]][mino.x[i]] = 1
            self.types[mino.y[i]][mino.x[i]] = mino.type

    def clearrows(self): #returns indexes of rows cleared
        cleared = []
        for i in range(len(self.blocks)):
            if self.blocks[i] == [1 for s in range(10)]:
                self.blocks.pop(i)
                self.blocks.insert(0, [0 for s in range(10)])
                self.types.pop(i)
                self.types.insert(1, [None for s in range(10)])
                cleared.append(i)
        return cleared

def collision(mino, blocks):
    for p in range(4):
        try:
            if blocks[mino.y[p]][mino.x[p]] == 1:
                return True
            elif mino.x[p] > 20 or mino.x[p] < 0:
                return True
            elif mino.y[p] < 0:
                return True
        except IndexError:
            return True
    return False
