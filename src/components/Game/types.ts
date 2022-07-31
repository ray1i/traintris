
export interface Mino {
    blocks: [number, number][],
    type: string;
    perm: number;
    ox: number,
    oy: number,
}

export interface BoardProps {
    blocks: string[][],
    currMino?: Mino,
    setBlock?: (x: number, y: number, type: string) => void,
}