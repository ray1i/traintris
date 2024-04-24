import { blockType, Blocks, minoType } from "../types/types"

export type Input = {
    hold: minoType | null;
    queue: minoType[];
}

const areInputsEqual = (a: Input, b: Input): boolean => {
    // check length sizes are equal
    if (a.queue.length + (a.hold === null ? 0 : 1) != b.queue.length + (b.hold === null ? 0 : 1)) {
        return false;
    }

    // if only one or fewer pieces
    if (a.queue.length + (a.hold === null ? 0 : 1) <= 1) {
        return (a.hold === b.hold && a.queue[0] === b.queue[0]) || (a.hold == b.queue[0] && a.queue[0] == b.hold);
    }
    
    // check first and hold pieces are equal
    if (!(a.hold === b.hold && a.queue[0] === b.queue[0]) && !(a.hold === b.queue[0] && a.queue[0] === b.hold)) {
        return false;
    }

    for (let i = 1; i < Math.max(a.queue.length, b.queue.length); i++) {
        if (a.queue[i] !== b.queue[i]) return false;
    }

    return true;
}

export type Node = {
    [key in blockType]: Node | null;
} & {
    end: Input[] | null;
};

export const newNode = (): Node => {
    return {
        I: null,
        O: null,
        T: null,
        L: null,
        J: null,
        Z: null,
        S: null,
        G: null, 
        '': null,
        end: null
    } as Node;
}

// creates the Node if not found
const findNode = (n: Node, b: Blocks): Node => {
    let currNode = n;
    for (let row of b) {
        for (let block of row) {
            if (currNode[block] === null) {
                currNode[block] = newNode();
            }

            currNode = currNode[block] as Node;
        }
    }

    return currNode;
}

export const insertState = (n: Node, b: Blocks, hold: minoType | null, queue: minoType[]) => {
    const newInput: Input = {
        hold: hold,
        queue: queue
    }

    let currNode = findNode(n, b);

    if (currNode.end === null) currNode.end = [];

    for (let i of currNode.end) {
        if (areInputsEqual(i, newInput)) return;
    }

    currNode.end.push(newInput);
}

export const containsState = (n: Node, b: Blocks, hold: minoType | null, queue: minoType[]): boolean => {
    const newInput: Input = {
        hold: hold,
        queue: queue
    }

    let currNode = findNode(n, b);

    if (currNode.end === null) return false;

    for (let i of currNode.end) {
        if (areInputsEqual(i, newInput)) return true;
    }

    return false;
}


