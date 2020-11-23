import os
import random
import pygame as pg #PYGAME: TOP LEFT IS 0,0
import sys

import mino_types as types

bag = ['I', 'O', 'T', 'L', 'J', 'Z', 'S']
random.shuffle(bag) 
sprites = {}

class Mino:
    def __init__(self, type): #STARTS AT (20, 4)
        self.type = type
        self.perm = 0
        self.ox = 4
        self.oy = 20
        self.image = sprites[type]
        self.newcoords()

    def newcoords(self):
        self.x = [self.ox + s for s in types.init_x(self.type, self.perm)]
        self.y = [self.oy - s for s in types.init_y(self.type, self.perm)] #flipped bc of pygame's weird coords

    def move(self, h, v): #1 is right, -1 is left; 1 is up, -1 is down
        tempMino = self.copy()
        tempMino.ox += h
        tempMino.oy -= v #flipped bc of pygame's weird coords
        tempMino.newcoords()
        if not collision(tempMino, Board()):
            self.ox += h
            self.oy -= v #flipped bc of pygame's weird coords
            self.newcoords()

    def rotate(self, dir): #1 is cw, -1 is ccw, 2 is 180
        tempMino = self.copy()
        tempMino.perm += dir
        if tempMino.perm < 0:
            tempMino.perm += 4
        elif tempMino.perm > 3:
            tempMino.perm -= 4
        tempMino.newcoords()
        if not collision(tempMino, Board()):
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
        try:
            if board.blocks[mino.y[p]][mino.x[p]]:
                return True
            elif mino.x[p] > 20 or mino.x[p] < 0:
                return True
            elif mino.y[p] < 0:
                return True
        except IndexError:
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
    for i in bag:
        sprites[i] = pg.image.load(f'{os.path.dirname(__file__)}/{i}.png').convert()

    das = 100
    arr = 10
    sd = 5
    das_start = 0
    arr_start = 0
    sd_start = 0
    ctrl_queue = {'DOWN':False, 'LEFT':False, 'RIGHT':False}

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
                        ctrl_queue['DOWN'] = True
                    elif event.key == pg.K_LEFT: #LEFT
                        currMino.move(-1, 0)
                        ctrl_queue['LEFT'] = True
                        das_start = pg.time.get_ticks()
                    elif event.key == pg.K_RIGHT: #RIGHT
                        currMino.move(1, 0)
                        ctrl_queue['RIGHT'] = True
                        das_start = pg.time.get_ticks()
                
                elif event.type == pg.KEYUP:
                    if event.key == pg.K_DOWN: #DOWN
                        ctrl_queue['DOWN'] = False
                        sd_start = 0
                    elif event.key == pg.K_LEFT: #LEFT
                        ctrl_queue['LEFT'] = False
                        arr_start = 0
                    elif event.key == pg.K_RIGHT: #RIGHT
                        ctrl_queue['RIGHT'] = False
                        arr_start = 0

            if arr_start > 0:
                if pg.time.get_ticks() >= arr_start + arr:
                    if ctrl_queue['LEFT']:
                        currMino.move(-1, 0)
                    if ctrl_queue['RIGHT']:
                        currMino.move(1, 0)
                    arr_start += arr
            elif ctrl_queue['LEFT'] or ctrl_queue['RIGHT']:
                if pg.time.get_ticks() >= das_start + das:
                    arr_start = pg.time.get_ticks()
            if ctrl_queue['DOWN']:
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
