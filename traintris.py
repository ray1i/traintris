import os
import random
import pygame as pg
import sys

import mino_types as types

bag = ['I', 'O', 'T', 'L', 'J', 'Z', 'S']

#PYGAME: TOP LEFT IS 0,0

class Mino:
    def __init__(self, type): #STARTS AT (20, 4)
        self.type = type
        self.perm = 0
        self.ox = 20
        self.oy = 4
        self.image = pg.image.load(f'{os.path.dirname(__file__)}/{type}.png').convert()
        self.newcoords()    

    def newcoords(self):
        self.x = [self.ox + s for s in types.init_x(self.type, self.perm)]
        self.y = [self.oy - s for s in types.init_y(self.type, self.perm)] #flipped bc of pygame's weird coords
        return

    def move(self, h, v): #1 is right, -1 is left; 1 is up, -1 is down
        self.ox += h
        self.oy -= v #flipped bc of pygame's weird coords
        self.newcoords()
        return

    def rotate(self, dir): #1 is cw, -1 is ccw, 2 is 180
        self.perm += dir
        if self.perm < 0:
            self.perm += 4
        elif self.perm > 3:
            self.perm -= 4
        self.newcoords()
        return

class Board:
    def __init__(self):
        self.blocks = [[0 for s in range(10)] for t in range(40)]
        #self.colours = [[]]
    def addblock(self,  x, y):
        self.blocks[y][x] = 1

    def clearrow(self, row):
        pass

def check_collision(mino, board):
    pass
    

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
    queue = []
    ingame = True

    currMino = Mino('T')
    while True:
        if ingame:
            for event in pg.event.get():
                if event.type == pg.QUIT:
                    sys.exit()
                elif event.type == pg.KEYDOWN:
                    ### MOVEMENT ###
                    if event.key == 274: #DOWN
                        currMino.move(0, -1)
                    elif event.key == 276: #LEFT
                        currMino.move(-1, 0)
                    elif event.key == 275: #RIGHT
                        currMino.move(1, 0)

                    ### ROTATION ###
                    elif event.key == 122: #Z
                        currMino.rotate(-1)
                    elif event.key == 120: #X
                        currMino.rotate(1)
                    elif event.key == 273: #Z
                        currMino.rotate(2)

            if len(queue) < 5:
                random.shuffle(bag)
                queue += bag

            

            screen.blit(bg, (0, 0))
            for i in range(4):
                screen.blit(currMino.image, (currMino.x[i] * 12, currMino.y[i] * 12))
        
        pg.display.flip()
        clock.tick(60)


if __name__ == '__main__':
    main()
