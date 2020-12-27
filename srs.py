# srs.py - the offsets for the super rotation system

offsets = {
    'JLSTZ' : [
        [(0, 0), ( 0, 0), ( 0, 0), ( 0, 0), ( 0, 0)], #0
        [(0, 0), (+1, 0), (+1,-1), ( 0,+2), (+1,+2)], #1
        [(0, 0), ( 0, 0), ( 0, 0), ( 0, 0), ( 0, 0)], #2
        [(0, 0), (-1, 0), (-1,-1), ( 0,+2), (-1,+2)] #3
    ],

    'I' : [
        [(0, 0), (-1, 0), (+2, 0), (-1, 0), (+2, 0)],
        [(0, 0), (+1, 0), (+1, 0), (+1,+1), (+1,-2)],
        [(0, 0), (+2, 0), (-1, 0), (+2,-1), (-1,-1)],
        [(0, 0), ( 0, 0), ( 0, 0), ( 0,-2), ( 0,+1)]
    ],
}


def get_offsets(type, prev_perm, cur_perm):
    if type in ['J', 'L', 'S', 'T', 'Z']:
        new_type = 'JLSTZ'
    elif type == 'I':
        new_type = 'I'
    elif type == 'O':
        return [(0, 0)]
    else:
        print('invalid Mino type')
        return

    templist = []
    for o in range(len(offsets[new_type][cur_perm])):
        templist.append( (offsets[new_type][prev_perm][o][0] - offsets[new_type][cur_perm][o][0], offsets[new_type][prev_perm][o][1] - offsets[new_type][cur_perm][o][1]) )
    
    return templist
