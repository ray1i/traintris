import os
import random
import sys
import pygame as pg #PYGAME: TOP LEFT IS 0,0
import pygame.freetype

from objects import Mino, Board
import pcfinder

default_bag = ['I', 'O', 'T', 'L', 'J', 'Z', 'S']
bag = default_bag.copy()
random.shuffle(bag)

das = 80
arr = 1
sd = 20
gravity = 1200

class Traintris: 
    def __init__(self, WIDTH, HEIGHT, px):
        pg.init()
        
        self.screen = pg.display.set_mode((WIDTH, HEIGHT))
        pg.display.set_caption('traintris gmae')

        self.bg = pg.Surface(self.screen.get_size()).convert()
        self.bg.fill((0, 0, 0))
        self.screen.blit(self.bg, (0, 0))
        pg.display.flip()

        self.px = px
        self.sprites = {}
        blocksheet = pg.image.load(f'{os.path.dirname(__file__)}/blocksheet.png').convert() # 'IOTLJZSGempty'
        for i in range(len(default_bag)):
            temp_sprite = pg.Surface((self.px, self.px))
            temp_sprite.blit(blocksheet, (0, 0), (self.px * i, 0, self.px, self.px))
            self.sprites[default_bag[i]] = temp_sprite.copy()

            ## make a ghost version ##
            temp_sprite.set_alpha(90)
            self.sprites['-' + default_bag[i]] = temp_sprite

        self.clock = pg.time.Clock()
        self.board = Board()
        self.queue = bag.copy()

        self.boardpos = (int(WIDTH / 6), 0)
        self.hold_minopos = [0, self.px * 2]
        self.queuepos = [0, self.px * 2]

        self.score = 0
        self.lines = 0
        self.pieces = 0

        self.fontsize = HEIGHT // 12
        self.FONT = pg.freetype.SysFont('Arial', self.fontsize)

        self.das_start = 0
        self.arr_start = 0
        self.sd_start = 0
        self.ctrl_queue = {'DOWN':False, 'LEFT':False, 'RIGHT':False}

        self.gravity_start = 0

        self.curr_mino = Mino(self.queue.pop(0), 4, 19, 0) #STARTS AT (19, 4)
        self.hold_mino = None
        self.already_held = False

        self.possibletemp = 0

    def handle_controls(self):
        #### CONTROLS ####            
        for event in pg.event.get():
            if event.type == pg.QUIT:
                sys.exit()
            elif event.type == pg.KEYDOWN:
                ### ROTATION ###
                if event.key == pg.K_z: #Z
                    self.curr_mino.rotate(-1, self.board)
                elif event.key == pg.K_x: #X
                    self.curr_mino.rotate(1, self.board)
                elif event.key == pg.K_UP: #UP
                    self.curr_mino.rotate(2, self.board)
                
                ### MOVEMENT ###
                elif event.key == pg.K_DOWN: #DOWN
                    self.curr_mino.move(0, -1, self.board)
                    self.ctrl_queue['DOWN'] = True
                    self.sd_start = pg.time.get_ticks()
                elif event.key == pg.K_LEFT: #LEFT
                    self.curr_mino.move(-1, 0, self.board)
                    self.ctrl_queue['LEFT'] = True
                    self.das_start = pg.time.get_ticks()
                elif event.key == pg.K_RIGHT: #RIGHT
                    self.curr_mino.move(1, 0, self.board)
                    self.ctrl_queue['RIGHT'] = True
                    self.das_start = pg.time.get_ticks()
                
                ### HARD DROP ### 
                elif event.key == pg.K_SPACE: #SPACE
                    self.board.place_mino(self.curr_mino.get_bottommost_pos(self.board))
                    self.curr_mino = Mino(self.queue.pop(0), 4, 19, 0)
                    self.already_held = False
                    self.pieces += 1 #might need to remove later
                
                ### HOLD ###
                elif event.key == pg.K_LCTRL: #LCTRL
                    if not self.already_held:
                        if not self.hold_mino is None:
                            self.hold_mino, self.curr_mino = Mino(self.curr_mino.type, 1, 20, 0), Mino(self.hold_mino.type, 4, 19, 0)
                        else:
                            self.hold_mino = Mino(self.curr_mino.type, 1, 20, 0)
                            self.curr_mino = Mino(self.queue.pop(0), 4, 19, 0)
                    self.already_held = True
            
            elif event.type == pg.KEYUP:
                if event.key == pg.K_DOWN: #DOWN
                    self.ctrl_queue['DOWN'] = False
                    self.sd_start = 0
                elif event.key == pg.K_LEFT: #LEFT
                    self.ctrl_queue['LEFT'] = False
                    self.arr_start = 0
                elif event.key == pg.K_RIGHT: #RIGHT
                    self.ctrl_queue['RIGHT'] = False
                    self.arr_start = 0
            
            elif event.type == pg.MOUSEBUTTONUP: #TEMPORARY HACK
                if 5*self.px + self.boardpos[0]+self.px*12 <= pg.mouse.get_pos()[0] <= 5*self.px + self.boardpos[0]+self.px*13 and 4*self.fontsize <= pg.mouse.get_pos()[1] <= 5*self.fontsize:
                    self.possibletemp -= 1
                elif 5*self.px + self.boardpos[0]+self.px*14 <= pg.mouse.get_pos()[0] <= 5*self.px + self.boardpos[0]+self.px*15 and 4*self.fontsize <= pg.mouse.get_pos()[1] <= 5*self.fontsize:
                    self.possibletemp += 1


    def handle_movement(self):
        if self.arr_start > 0:
            if pg.time.get_ticks() >= self.arr_start + arr:
                if self.ctrl_queue['LEFT']:
                    self.curr_mino.move(-1, 0, self.board)
                if self.ctrl_queue['RIGHT']:
                    self.curr_mino.move(1, 0, self.board)
                self.arr_start += arr
        elif self.ctrl_queue['LEFT'] or self.ctrl_queue['RIGHT']:
            if pg.time.get_ticks() >= self.das_start + das:
                self.arr_start = pg.time.get_ticks()
        if self.ctrl_queue['DOWN']:
            if pg.time.get_ticks() >= self.sd_start + sd:
                self.curr_mino.move(0, -1, self.board)
                self.sd_start += sd
        else:
            if pg.time.get_ticks() >= self.gravity_start + gravity:
                self.curr_mino.move(0, -1, self.board)
                self.gravity_start += gravity

    def handle_logic(self):

        conditions = len(self.board.clearrows())
        self.lines += conditions
        self.score += conditions

        ### self.queue ###
        if len(self.queue) < 5:
            global bag
            random.shuffle(bag)
            self.queue += bag
        
    def draw_background(self):
        self.screen.blit(self.bg, (0, 0))

    def draw_board(self):
        self.screen.blit(self.board.image, (self.boardpos[0], self.boardpos[1]))
        for i in range(len(self.board.blocks)):
            for j in range(len(self.board.blocks[i])):
                if not self.board.types[i][j] is None:
                    self.screen.blit(self.sprites[self.board.types[i][j]], (j * self.px + self.boardpos[0], i * self.px - 20*self.px + self.boardpos[1]))

        ### draw ghost piece ###
        self.curr_mino.get_bottommost_pos(self.board).draw(self.screen, self.sprites['-' + self.curr_mino.type], self.boardpos[0], self.boardpos[1], self.px)

    def draw_stats(self):
        self.FONT.render_to(self.screen, (5*self.px + self.boardpos[0]+self.px*10, 0), f'Score: {self.score}', (255, 255, 255))
        self.FONT.render_to(self.screen, (5*self.px + self.boardpos[0]+self.px*10, 1*self.fontsize), f'Lines: {self.lines}', (255, 255, 255))
        self.FONT.render_to(self.screen, (5*self.px + self.boardpos[0]+self.px*10, 2*self.fontsize), f'Pieces: {self.pieces}', (255, 255, 255))

    def draw_gui(self):
        self.FONT.render_to(self.screen, (5*self.px + self.boardpos[0]+self.px*12, 4*self.fontsize), '<', (255, 255, 255)) #TEMPORARY
        self.FONT.render_to(self.screen, (5*self.px + self.boardpos[0]+self.px*14, 4*self.fontsize), '>', (255, 255, 255))

    def draw_minos(self):
        self.curr_mino.draw(self.screen, self.sprites[self.curr_mino.type], self.boardpos[0], self.boardpos[1], self.px)

        ### draw hold mino
        if not self.hold_mino is None:
            #centering hold mino: #REFACTOR THSI, maybe with sets
            if self.hold_mino.type in ['O', 'I']: #WIDTH 2, 4
                self.hold_minopos[0] = int(self.boardpos[0] / 2 - (self.px * 2))
            elif self.hold_mino.type in ['L', 'J', 'T', 'S', 'Z']: #WIDTH 3
                self.hold_minopos[0] = int(self.boardpos[0] / 2 - (self.px * 1.5))
            
            self.hold_mino.draw(self.screen, self.sprites[self.hold_mino.type], self.hold_minopos[0], self.hold_minopos[1], self.px)
        
        ### draw self.queue
        for m in range(5):
            tq_mino = Mino(self.queue[m], 1, 20, 0) #temp queue mino

            if self.queue[m] in ['O', 'I']: #WIDTH 2, 4
                self.queuepos[0] = int(self.boardpos[0] / 2 - (self.px * 2))
            elif self.queue[m] in ['L', 'J', 'T', 'S', 'Z']: #WIDTH 3
                self.queuepos[0] = int(self.boardpos[0] / 2 - (self.px * 1.5))
            
            tq_mino.draw(self.screen, self.sprites[tq_mino.type], self.boardpos[0]+self.px*10 + self.queuepos[0], self.queuepos[1] + (4*m*self.px), self.px)
        
        
        pcfinder.possible_positions(self.curr_mino.type, self.board, 4)[self.possibletemp].draw(self.screen, self.sprites[self.curr_mino.type], self.boardpos[0], self.boardpos[1], self.px)

    def draw_all(self):
        self.draw_background()
        self.draw_board()
        self.draw_stats()
        self.draw_gui()
        self.draw_minos()

        pg.display.flip()

    def update(self):
        self.handle_controls()
        self.handle_movement()
        self.handle_logic()
        self.draw_all()
        self.clock.tick(60)

if __name__ == '__main__':
    blocksize = 32
    WIDTH = blocksize * 30
    HEIGHT = blocksize * 20
    game = Traintris(WIDTH, HEIGHT, blocksize)
    while True:
        game.update()
