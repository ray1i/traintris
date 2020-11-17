import os
import random
import pygame as pg
import sys

import mino_types as types

bag = ['I', 'O', 'T', 'L', 'J', 'Z', 'S']
random.shuffle(bag) 

#PYGAME: TOP LEFT IS 0,0

class Mino:
    def __init__(self, type): #STARTS AT (20, 4)
        self.type = type
        self.perm = 0
        self.ox = 4
        self.oy = 20
        self.image = pg.image.load(f'{os.path.dirname(__file__)}/{type}.png').convert()
        self.newcoords()

    def newcoords(self):
        self.x = [self.ox + s for s in types.init_x(self.type, self.perm)]
        self.y = [self.oy - s for s in types.init_y(self.type, self.perm)] #flipped bc of pygame's weird coords

    def move(self, h, v, check_collision = True): #1 is right, -1 is left; 1 is up, -1 is down
        if not check_collision or not collision((self.copy()).move(h, v, False), Board()):
            self.ox += h
            self.oy -= v #flipped bc of pygame's weird coords
            self.newcoords()

    def rotate(self, dir): #1 is cw, -1 is ccw, 2 is 180
        if not collision(self.copy().rotate(dir), Board()):
            self.perm += dir
            if self.perm < 0:
                self.perm += 4
            elif self.perm > 3:
                self.perm -= 4
            self.newcoords()
    
    def copy(self):
        tempMino = Mino(self.type)
        tempMino.perm = self.perm
        tempMino.ox = self.ox
        tempMino.oy = self.oy
        tempMino.newcoords()
        return tempMino

class Board:
    def __init__(self):
        self.blocks = [[0 for s in range(10)] for t in range(40)]
        self.image = pg.image.load(f'{os.path.dirname(__file__)}/board.png').convert()
        #self.colours = [[]]
    def addblock(self,  x, y):
        self.blocks[y][x] = 1
    def clearrow(self, row):
        pass

def collision(mino, board):
    for p in range(4):
        if board.blocks[mino.y[p]][mino.x[p]]:
            return True
        elif mino.x[p] > 20 or mino.x[p] < 0:
            return True
        elif mino.y[p] < 0:
            return True
    return False

def main(): 
    pg.init()
    screen = pg.display.set_mode((640, 480))
    pg.display.set_caption('traintris gmae')

    bg = pg.Surface(screen.get_size())
    bg = bg.convert()
    bg.fill((0, 0, 0))
    screen.blit(bg, (0, 0))
    pg.display.flip()

    clock = pg.time.Clock()
    board = Board()
    queue = bag
    ingame = True

    das = 100
    arr = 10
    sd = 5
    das_start = 0
    arr_start = 0
    sd_start = 0
    ctrl_q = {'DOWN':False, 'LEFT':False, 'RIGHT':False}

    currMino = Mino(queue.pop(0))
    while True:
        if ingame:

            #### CONTROLS ####            
            for event in pg.event.get():
                if event.type == pg.QUIT:
                    sys.exit()
                elif event.type == pg.KEYDOWN:
                    ### ROTATION ###
                    if event.key == pg.K_z: #Z
                        currMino.rotate(-1)
                    elif event.key == pg.K_x: #X
                        currMino.rotate(1)
                    elif event.key == pg.K_UP: #UP
                        currMino.rotate(2)
                    
                    ### MOVEMENT ###
                    elif event.key == pg.K_DOWN: #DOWN
                        currMino.move(0, -1)
                        ctrl_q['DOWN'] = True
                    elif event.key == pg.K_LEFT: #LEFT
                        currMino.move(-1, 0)
                        ctrl_q['LEFT'] = True
                        das_start = pg.time.get_ticks()
                    elif event.key == pg.K_RIGHT: #RIGHT
                        currMino.move(1, 0)
                        ctrl_q['RIGHT'] = True
                        das_start = pg.time.get_ticks()
                
                elif event.type == pg.KEYUP:
                    if event.key == pg.K_DOWN: #DOWN
                        ctrl_q['DOWN'] = False
                        sd_start = 0
                    elif event.key == pg.K_LEFT: #LEFT
                        ctrl_q['LEFT'] = False
                        arr_start = 0
                    elif event.key == pg.K_RIGHT: #RIGHT
                        ctrl_q['RIGHT'] = False
                        arr_start = 0

            if arr_start > 0:
                if pg.time.get_ticks() >= arr_start + arr:
                    if ctrl_q['LEFT']:
                        currMino.move(-1, 0)
                    if ctrl_q['RIGHT']:
                        currMino.move(1, 0)
                    arr_start += arr
            elif ctrl_q['LEFT'] or ctrl_q['RIGHT']:
                if pg.time.get_ticks() >= das_start + das:
                    arr_start = pg.time.get_ticks()
            if ctrl_q['DOWN']:
                if pg.time.get_ticks() >= sd_start + sd:
                    currMino.move(0, -1)
                    sd_start += sd
                    
            if len(queue) < 5:
                random.shuffle(bag)
                queue += bag

            screen.blit(bg, (0, 0))
            screen.blit(board.image, (0, 0))
            for i in range(4):
                screen.blit(currMino.image, (currMino.x[i] * 12, currMino.y[i] * 12 - 20*12))
        
        pg.display.flip()
        clock.tick(60)

if __name__ == '__main__':
    main()
