import os
import random
import sys
import pygame as pg #PYGAME: TOP LEFT IS 0,0
import pygame.freetype

from objects import Mino, Board

px = 24

default_bag = ['I', 'O', 'T', 'L', 'J', 'Z', 'S']
bag = default_bag.copy()
random.shuffle(bag)

das = 80
arr = 1
sd = 20
gravity = 1200

class Traintris: 
    def __init__(self, WIDTH, HEIGHT):
        pg.init()
        
        self.screen = pg.display.set_mode((WIDTH, HEIGHT))
        pg.display.set_caption('traintris gmae')

        self.bg = pg.Surface(self.screen.get_size()).convert()
        self.bg.fill((0, 0, 0))
        self.screen.blit(self.bg, (0, 0))
        pg.display.flip()

        self.sprites = {}
        blocksheet = pg.image.load(f'{os.path.dirname(__file__)}/blocksheet.png').convert() # 'IOTLJZSGempty'
        for i in range(len(default_bag)):
            temp_sprite = pg.Surface((px, px))
            temp_sprite.blit(blocksheet, (0, 0), (px * i, 0, px, px))
            self.sprites[default_bag[i]] = temp_sprite.copy()

            ## make a ghost version ##
            temp_sprite.set_alpha(90)
            self.sprites['-' + default_bag[i]] = temp_sprite

        self.clock = pg.time.Clock()
        self.board = Board()
        self.queue = bag.copy()

        self.boardpos = (int(WIDTH / 6), 0)
        self.hold_minopos = [0, px * 2]
        self.queuepos = [0, px * 2]

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

        self.curr_mino = Mino(self.queue.pop(0))
        self.hold_mino = None
        self.already_held = False

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
                    self.curr_mino = Mino(self.queue.pop(0))
                    self.already_held = False
                    self.pieces += 1 #might need to remove later
                
                ### HOLD ###
                elif event.key == pg.K_LCTRL: #LCTRL
                    if not self.already_held:
                        if not self.hold_mino is None:
                            self.hold_mino, self.curr_mino = Mino(self.curr_mino.type), Mino(self.hold_mino.type)
                        else:
                            self.hold_mino = Mino(self.curr_mino.type)
                            self.curr_mino = Mino(self.queue.pop(0))
                        self.hold_mino.ox = 1
                        self.hold_mino.oy = 20
                        self.hold_mino.new_coords()
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

        conditions = self.board.clearrows()
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
                    self.screen.blit(self.sprites[self.board.types[i][j]], (j * px + self.boardpos[0], i * px - 20*px + self.boardpos[1]))

        ### draw ghost piece ###
        for i in range(4):
            self.screen.blit(self.sprites['-' + self.curr_mino.type], (self.curr_mino.get_bottommost_pos(self.board).x[i] * px + self.boardpos[0], self.curr_mino.get_bottommost_pos(self.board).y[i] * px - 20*px + self.boardpos[1]))

    def draw_stats(self):
        self.FONT.render_to(self.screen, (5*px + self.boardpos[0]+px*10, 0), f'Score: {self.score}', (255, 255, 255))
        self.FONT.render_to(self.screen, (5*px + self.boardpos[0]+px*10, 1*self.fontsize), f'Lines: {self.lines}', (255, 255, 255))
        self.FONT.render_to(self.screen, (5*px + self.boardpos[0]+px*10, 2*self.fontsize), f'Pieces: {self.pieces}', (255, 255, 255))

    def draw_minos(self):
        for i in range(4):
            self.screen.blit(self.sprites[self.curr_mino.type], (self.curr_mino.x[i] * px + self.boardpos[0], self.curr_mino.y[i] * px - 20*px + self.boardpos[1]))

        ### draw hold mino
        if not self.hold_mino is None:
            #centering hold mino: #REFACTOR THSI, maybe with sets
            if self.hold_mino.type in ['O', 'I']: #WIDTH 2, 4
                self.hold_minopos[0] = int(self.boardpos[0] / 2 - (px * 2))
            elif self.hold_mino.type in ['L', 'J', 'T', 'S', 'Z']: #WIDTH 3
                self.hold_minopos[0] = int(self.boardpos[0] / 2 - (px * 1.5))
            
            for i in range(4):
                self.screen.blit(self.sprites[self.hold_mino.type], (self.hold_mino.x[i] * px + self.hold_minopos[0], self.hold_mino.y[i] * px - 20*px + self.hold_minopos[1]))
        
        ### draw self.queue
        for m in range(5):
            tq_mino = Mino(self.queue[m]) #temp self.queue mino
            tq_mino.ox = 1
            tq_mino.oy = 20
            tq_mino.new_coords()

            if self.queue[m] in ['O', 'I']: #WIDTH 2, 4
                self.queuepos[0] = int(self.boardpos[0] / 2 - (px * 2))
            elif self.queue[m] in ['L', 'J', 'T', 'S', 'Z']: #WIDTH 3
                self.queuepos[0] = int(self.boardpos[0] / 2 - (px * 1.5))
            
            for i in range(4):
                self.screen.blit(self.sprites[tq_mino.type], (tq_mino.x[i]*px + self.queuepos[0] + self.boardpos[0]+px*10, tq_mino.y[i]*px - 20*px + self.queuepos[1] + (4*m*px)))

    def draw_all(self):
        self.draw_background()
        self.draw_board()
        self.draw_stats()
        self.draw_minos()

        pg.display.flip()

    def update(self):
        self.handle_controls()
        self.handle_movement()
        self.handle_logic()
        self.draw_all()
        self.clock.tick(60)

if __name__ == '__main__':
    WIDTH = 640
    HEIGHT = 480
    game = Traintris(WIDTH, HEIGHT)
    while True:
        game.update()
=======
import os
import random
import sys
import pygame as pg #PYGAME: TOP LEFT IS 0,0
import pygame.freetype

from objects import Mino, Board

WIDTH = 640
HEIGHT = 480

default_bag = ['I', 'O', 'T', 'L', 'J', 'Z', 'S']
bag = default_bag.copy()
random.shuffle(bag)
sprites = {}

def main(): 
    pg.init()
    px = 24
    screen = pg.display.set_mode((WIDTH, HEIGHT))
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
        temp_sprite.set_alpha(90)
        sprites['-' + default_bag[i]] = temp_sprite
    
    boardpos = (int(WIDTH / 6), 0)
    hold_minopos = [0, px * 2]
    queuepos = [0, px * 2]

    score = 0
    lines = 0
    pieces = 0

    fontsize = HEIGHT // 12
    FONT = pg.freetype.SysFont('Arial', fontsize)

    das = 80
    arr = 1
    sd = 20
    das_start = 0
    arr_start = 0
    sd_start = 0
    ctrl_queue = {'DOWN':False, 'LEFT':False, 'RIGHT':False}

    gravity = 1200
    gravity_start = 0

    curr_mino = Mino(queue.pop(0))
    hold_mino = None
    already_held = False
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
                        board.place_mino(curr_mino.get_bottommost_pos(board))
                        curr_mino = Mino(queue.pop(0))
                        already_held = False
                        pieces += 1 #might need to remove later
                    
                    ### HOLD ###
                    elif event.key == pg.K_LCTRL: #LCTRL
                        if not already_held:
                            if not hold_mino is None:
                                hold_mino, curr_mino = Mino(curr_mino.type), Mino(hold_mino.type)
                            else:
                                hold_mino = Mino(curr_mino.type)
                                curr_mino = Mino(queue.pop(0))
                            hold_mino.ox = 1
                            hold_mino.oy = 20
                            hold_mino.new_coords()
                        already_held = True
                
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
            else:
                if pg.time.get_ticks() >= gravity_start + gravity:
                    curr_mino.move(0, -1, board)
                    gravity_start += gravity

            #### LOGIC ####

            ### score, lines, clear board
            conditions = board.clearrows()
            lines += conditions
            score += conditions

            ### queue ###
            if len(queue) < 5:
                random.shuffle(bag)
                queue += bag
            

            #### DRAW ####
            screen.blit(bg, (0, 0))

            ### draw board ###
            screen.blit(board.image, (boardpos[0], boardpos[1]))
            for i in range(len(board.blocks)):
                for j in range(len(board.blocks[i])):
                    if not board.types[i][j] is None:
                        screen.blit(sprites[board.types[i][j]], (j * px + boardpos[0], i * px - 20*px + boardpos[1]))

            ### draw ghost piece ###
            for i in range(4):
                screen.blit(sprites['-' + curr_mino.type], (curr_mino.get_bottommost_pos(board).x[i] * px + boardpos[0], curr_mino.get_bottommost_pos(board).y[i] * px - 20*px + boardpos[1]))

            ### draw mino ###
            for i in range(4):
                screen.blit(sprites[curr_mino.type], (curr_mino.x[i] * px + boardpos[0], curr_mino.y[i] * px - 20*px + boardpos[1]))

            ### draw hold mino
            if not hold_mino is None:
                #centering hold mino: #REFACTOR THSI, maybe with sets
                if hold_mino.type in ['O', 'I']: #WIDTH 2, 4
                    hold_minopos[0] = int(boardpos[0] / 2 - (px * 2))
                elif hold_mino.type in ['L', 'J', 'T', 'S', 'Z']: #WIDTH 3
                    hold_minopos[0] = int(boardpos[0] / 2 - (px * 1.5))
                
                for i in range(4):
                    screen.blit(sprites[hold_mino.type], (hold_mino.x[i] * px + hold_minopos[0], hold_mino.y[i] * px - 20*px + hold_minopos[1]))
            
            ### draw queue
            for m in range(5):
                tq_mino = Mino(queue[m]) #temp queue mino
                tq_mino.ox = 1
                tq_mino.oy = 20
                tq_mino.new_coords()

                if queue[m] in ['O', 'I']: #WIDTH 2, 4
                    queuepos[0] = int(boardpos[0] / 2 - (px * 2))
                elif queue[m] in ['L', 'J', 'T', 'S', 'Z']: #WIDTH 3
                    queuepos[0] = int(boardpos[0] / 2 - (px * 1.5))
                
                for i in range(4):
                    screen.blit(sprites[tq_mino.type], (tq_mino.x[i]*px + queuepos[0] + boardpos[0]+px*10, tq_mino.y[i]*px - 20*px + queuepos[1] + (4*m*px)))
            
            ### draw stats ###
            FONT.render_to(screen, (5*px + boardpos[0]+px*10, 0), f'Score: {score}', (255, 255, 255))
            FONT.render_to(screen, (5*px + boardpos[0]+px*10, 1*fontsize), f'Lines: {lines}', (255, 255, 255))
            FONT.render_to(screen, (5*px + boardpos[0]+px*10, 2*fontsize), f'Pieces: {pieces}', (255, 255, 255))

        pg.display.flip()
        clock.tick(60)

if __name__ == '__main__':
    main()
