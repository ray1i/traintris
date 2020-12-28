from traintris import Traintris

blocksize = 32
WIDTH = blocksize * 30
HEIGHT = blocksize * 20

def main(): 
    game = Traintris(WIDTH, HEIGHT, blocksize)
    while True:
        game.update()

if __name__ == '__main__':
    main()
