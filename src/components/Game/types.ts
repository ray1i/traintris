
export type minoType = 'I' | 'O' | 'T' | 'L' | 'J' | 'Z' | 'S';

export interface Mino {
    blocks: [number, number][],
    type: minoType;
    perm: number;
    ox: number,
    oy: number,
}

export interface BoardProps {
    blocks: string[][],
    currMino?: Mino,
    setBlock?: (x: number, y: number, type: string) => void,
}