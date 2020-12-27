from traintris import Traintris

WIDTH = 640
HEIGHT = 480

def main(): 
    game = Traintris(WIDTH, HEIGHT)
    while True:
        game.update()

if __name__ == '__main__':
    main()
