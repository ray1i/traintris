ix =   [[-1, 0, 1, 2],
        [1, 1, 1, 1],
        [-1, 0, 1, 2],
        [0, 0, 0, 0]]

iy = [[0, 0, 0, 0], 
        [1, 0, -1, -2],
        [-1, -1, -1, -1],
        [1, 0, -1, -2]]

ox = [[0, 1, 0, 1] for s in range(4)]

oy = [[1, 1, 0, 0] for s in range(4)]

zx = [[-1, 0, 0, 1],
        [1, 0, 1, 0],
        [-1, 0, 0, 1],
        [0, -1, 0, -1]]

zy = [[1, 1, 0, 0], 
        [1, 0, 0, -1],
        [0, 0, -1, -1],
        [1, 0, 0, -1]]

sx = [[0, 1, -1, 0],
        [0, 0, 1, 1],
        [0, 1, -1, 0],
        [-1, -1, 0, 0]]

sy = [[1, 1, 0, 0], 
        [1, 0, 0, -1],
        [0, 0, -1, -1],
        [1, 0, 0, -1]]

lx = [[1, -1, 0, 1],
        [0, 0, 0, 1],
        [-1, 0, 1, -1],
        [-1, 0, 0, 0]]

ly = [[1, 0, 0, 0], 
        [1, 0, -1, -1],
        [0, 0, 0, -1],
        [1, 1, 0, -1]]

jx = [[-1, -1, 0, 1],
        [0, 1, 0, 0],
        [-1, 0, 1, 1],
        [-1, 0, 0, 0]]

jy = [[1, 0, 0, 0], 
        [1, 1, 0, -1],
        [0, 0, 0, -1],
        [-1, -1, 0, 1]]

tx = [[0, -1, 0, 1],
        [0, 0, 1, 0],
        [-1, 0, 1, 0],
        [0, -1, 0, 0]]

ty = [[1, 0, 0, 0], 
        [1, 0, 0, -1],
        [0, 0, 0, -1],
        [1, 0, 0, -1]]


def init_x(type, perm):
    if type == 'I':
        return ix[perm]
    if type == 'O':
        return ox[perm]
    if type == 'Z':
        return zx[perm]
    if type == 'S':
        return sx[perm]
    if type == 'L':
        return lx[perm]
    if type == 'J':
        return jx[perm]
    if type == 'T':
        return tx[perm]

def init_y(type, perm):
    if type == 'I':
        return iy[perm]
    if type == 'O':
        return oy[perm]
    if type == 'Z':
        return zy[perm]
    if type == 'S':
        return sy[perm]
    if type == 'L':
        return ly[perm]
    if type == 'J':
        return jy[perm]
    if type == 'T':
        return ty[perm]
