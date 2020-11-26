import os
import random
import pygame as pg #PYGAME: TOP LEFT IS 0,0
import sys

import mino_types as types

default_bag = ['I', 'O', 'T', 'L', 'J', 'Z', 'S']
bag = default_bag.copy()
random.shuffle(bag)
sprites = {}

class Mino:
    def __init__(self, type): #STARTS AT (20, 4)
        self.type = type
        self.perm = 0
        self.ox = 4
        self.oy = 20
        self.image = sprites[type]
        self.new_coords()

    def new_coords(self):
        self.x = [self.ox + s for s in types.init_x(self.type, self.perm)]
        self.y = [self.oy - s for s in types.init_y(self.type, self.perm)] #flipped bc of pygame's weird coords

    def move(self, h, v, b): #1 is right, -1 is left; 1 is up, -1 is down
        tempMino = self.copy()
        tempMino.ox += h
        tempMino.oy -= v #flipped bc of pygame's weird coords
        tempMino.new_coords()
        if not collision(tempMino, b):
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
        tempMino.new_coords()
        if not collision(tempMino, b):
            self.perm += dir
            if self.perm < 0:
                self.perm += 4
            elif self.perm > 3:
                self.perm -= 4
            self.new_coords()
    
    def copy(self):
        tempMino = Mino(self.type)
        tempMino.perm = self.perm
        tempMino.ox = self.ox
        tempMino.oy = self.oy
        tempMino.new_coords()
        return tempMino

class Board:
    def __init__(self):
        self.blocks = [[0 for s in range(10)] for t in range(40)]
        self.image = pg.image.load(f'{os.path.dirname(__file__)}/board.png').convert_alpha()
        self.types = [[None for s in range(10)] for t in range(40)]
    def place_mino(self, mino):
        for i in range(len(mino.x)):
            self.blocks[mino.y[i]][mino.x[i]] = 1
            self.types[mino.y[i]][mino.x[i]] = mino.type
    def clearrow(self, row):
        pass

def collision(mino, b):
    for p in range(4):
        try:
            if b.blocks[mino.y[p]][mino.x[p]] == 1:
                return True
            elif mino.x[p] > 20 or mino.x[p] < 0:
                return True
            elif mino.y[p] < 0:
                return True
        except IndexError:
            return True
    return False

def get_bottommost_pos(mino, b):
    m = mino.copy()
    while True:
        lower_m = m.copy()
        lower_m.oy += 1
        lower_m.new_coords()
        if collision(lower_m, b):
            break
        else:
            m = lower_m
    return m

def main(): 
    pg.init()
    px = 24
    screen = pg.display.set_mode((640, 480))
    pg.display.set_caption('traintris gmae')

    bg = pg.Surface(screen.get_size()).convert()
    bg.fill((0, 0, 0))
    screen.blit(bg, (0, 0))
    pg.display.flip()

    clock = pg.time.Clock()
    board = Board()
    queue = bag.copy()
    ingame = True

    blocksheet = pg.image.load(f'{os.path.dirname(__file__)}/blocksheet.png').convert() # 'IOTLJZSGempty'
    for i in range(len(default_bag)):
        temp_sprite = pg.Surface((px, px))
        temp_sprite.blit(blocksheet, (0, 0), (px * i, 0, px, px))
        sprites[default_bag[i]] = temp_sprite.copy()

        ## make a ghost version ##
        temp_sprite.set_alpha(75)
        sprites['-' + default_bag[i]] = temp_sprite

    das = 140
    arr = 30
    sd = 100
    das_start = 0
    arr_start = 0
    sd_start = 0
    ctrl_queue = {'DOWN':False, 'LEFT':False, 'RIGHT':False}

    gravity = 10

    curr_mino = Mino(queue.pop(0))
    hold_mino = None
    while True:
        if ingame:

            #### CONTROLS ####            
            for event in pg.event.get():
                if event.type == pg.QUIT:
                    sys.exit()
                elif event.type == pg.KEYDOWN:
                    ### ROTATION ###
                    if event.key == pg.K_z: #Z
                        curr_mino.rotate(-1, board)
                    elif event.key == pg.K_x: #X
                        curr_mino.rotate(1, board)
                    elif event.key == pg.K_UP: #UP
                        curr_mino.rotate(2, board)
                    
                    ### MOVEMENT ###
                    elif event.key == pg.K_DOWN: #DOWN
                        curr_mino.move(0, -1, board)
                        ctrl_queue['DOWN'] = True
                        sd_start = pg.time.get_ticks()
                    elif event.key == pg.K_LEFT: #LEFT
                        curr_mino.move(-1, 0, board)
                        ctrl_queue['LEFT'] = True
                        das_start = pg.time.get_ticks()
                    elif event.key == pg.K_RIGHT: #RIGHT
                        curr_mino.move(1, 0, board)
                        ctrl_queue['RIGHT'] = True
                        das_start = pg.time.get_ticks()
                    
                    ### HARD DROP ###
                    elif event.key == pg.K_SPACE: #SPACE
                        board.place_mino(get_bottommost_pos(curr_mino, board))
                        curr_mino = Mino(queue.pop(0))
                    
                    ### HOLD ###
                    elif event.key == pg.K_LCTRL: #LCTRL
                        if not hold_mino is None:
                            hold_mino, curr_mino = Mino(curr_mino.type), Mino(hold_mino.type)
                        else:
                            hold_mino = Mino(curr_mino.type)
                            curr_mino = Mino(queue.pop(0))
                
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

            ### das/arr/sd ###
            if arr_start > 0:
                if pg.time.get_ticks() >= arr_start + arr:
                    if ctrl_queue['LEFT']:
                        curr_mino.move(-1, 0, board)
                    if ctrl_queue['RIGHT']:
                        curr_mino.move(1, 0, board)
                    arr_start += arr
            elif ctrl_queue['LEFT'] or ctrl_queue['RIGHT']:
                if pg.time.get_ticks() >= das_start + das:
                    arr_start = pg.time.get_ticks()
            if ctrl_queue['DOWN']:
                if pg.time.get_ticks() >= sd_start + sd:
                    curr_mino.move(0, -1, board)
                    sd_start += sd

            ### queue ###
            if len(queue) < 5:
                random.shuffle(bag)
                queue += bag
            
            #### DRAW ####
            screen.blit(bg, (0, 0))

            ### draw board ###
            screen.blit(board.image, (0, 0))
            for i in range(len(board.blocks)):
                for j in range(len(board.blocks[i])):
                    if not board.types[i][j] is None:
                        screen.blit(sprites[board.types[i][j]], (j * px, i * px - 20*px))
            
            ### draw ghost piece ###
            for i in range(4):
                screen.blit(sprites['-' + curr_mino.type], (get_bottommost_pos(curr_mino, board).x[i] *px, get_bottommost_pos(curr_mino, board).y[i] * px - 20*px))

            ### draw mino ###
            for i in range(4):
                screen.blit(curr_mino.image, (curr_mino.x[i] * px, curr_mino.y[i] * px - 20*px))

            ### draw hold mino
            if not hold_mino is None:
                for i in range(4):
                    screen.blit(hold_mino.image, (hold_mino.x[i] * px, hold_mino.y[i] * px - 20*px))
            
        
        pg.display.flip()
        clock.tick(60)

if __name__ == '__main__':
    main()
