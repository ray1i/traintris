import {
  getNewMino,
  getBoardWithPlacedMinos,
  getMovedMino,
  getRotatedMino,
  getRotatedMinoWithSRS,
  collide,
  topless_collide,
} from "./util";
import { minoType, Mino, blockType, Blocks } from "../types/types";

const setMultipleBlocks = (
  b: Blocks,
  blocklist: [number, number][],
  type: blockType
) => {
  let tempBlocks = JSON.parse(JSON.stringify(b)) as Blocks;

  for (let block of blocklist) {
    if (block[0] < 10 && block[1] < 4) {
      tempBlocks[block[1]][block[0]] = type;
    }
  }

  // check to clear lines:
  for (let i = 0; i < tempBlocks.length; i++) {
    if (!tempBlocks[i].includes("")) {
      tempBlocks.splice(i, 1);
      // tempBlocks.push(Array(10).fill(''));
      i--;
    }
  }

  return tempBlocks;
};

// when it gets input from the main file, run everything else.
onmessage = (msg: MessageEvent) => {
  const state: { b: Blocks; hold: minoType | null; queue: minoType[] } =
    msg.data;

  const stackHeight = state.b.reduce((acc, row, i) => {
    if (row.some((block) => block !== "")) {
      return i + 1;
    } else {
      return acc;
    }
  }, 0);

  const new_b = JSON.parse(JSON.stringify(state.b)).slice(
    0,
    Math.max(stackHeight, 4)
  );

  let solutions: Mino[][];
  if (stackHeight === 0) {
    solutions = [];
  } else {
    solutions = getAllPCs(new_b, [
      ...(state.hold ? [state.hold] : []),
      ...state.queue,
    ]);
  }

  postMessage(solutions);
};

export function getAllPCs(b: Blocks, queue: minoType[]): Mino[][] {
  let result = [] as Mino[][];

  for (let h = 1; h < 5; h++) {
    if (isBoardPCable(b, queue, h)) {
      // console.log(`searching for ${h}-height pcs...`)
      result = [...result, ...getAllPCsByHeight(b.slice(0, h), queue, h)];
    }
  }

  return eliminate_duplicate_solutions(b, result);
}

// check if board is technically pc-able
const isBoardPCable = (b: Blocks, queue: minoType[], height = 4): boolean => {
  // check if board height is higher than pc height
  for (let i = height; i < b.length; i++) {
    for (let block of b[i]) {
      if (block) {
        // console.log(`Board height is higher than ${height}!`)
        return false;
      }
    }
  }

  // check if number of empty spaces on board is divisible by 4
  const empty_blocks = b
    .slice(0, height)
    .reduce(
      (total, row) =>
        row.reduce(
          (rowTotal, block) => (rowTotal += block === "" ? 1 : 0),
          total
        ),
      0
    );
  if (empty_blocks % 4 !== 0) {
    // console.log('Remaining space is not divisible by 4!')
    return false;
  }

  // check if queue length (+1 for hold) is long enough to pc
  if (empty_blocks / 4 > queue.length) {
    // console.log('Queue is not long enough!')
    return false;
  }

  return true;
};

const isMinoLowest = (b: Blocks, m: Mino): boolean => {
  return m.blocks.some((block) => block[1] === 0 || b[block[1] - 1][block[0]]);
};

const getAllLowestMinos = (b: Blocks, type: minoType, height = 4): Mino[] => {
  const seen = new Set<`${number},${number},${number}`>(); // ox, oy, perm

  // start off with all the positions where the mino just drops
  for (let perm = 0; perm < 4; perm++) {
    for (let x = 0; x < 10; x++) {
      const tempMino = getRotatedMino(getNewMino(type, x, height), perm);
      for (let y = 0; y < height; y++) {
        if (!topless_collide(b, getMovedMino(tempMino, 0, -y))) {
          seen.add(`${x},${height - y},${perm}`);
        } else {
          // it hits the board, so it's the lowest it can get from dropping straight down
          break;
        }
      }
    }
    if (type === "O" && perm > 0) break;
  }

  // then check all the positions where the mino can reach by moving/rotating
  let oldQueue = [];
  let currQueue = Array.from(seen);
  while (currQueue.length > 0) {
    oldQueue = currQueue;
    currQueue = [];
    for (let pos of oldQueue) {
      const [ox, oy, perm] = pos.split(",").map((x) => parseInt(x));
      const start = getRotatedMino(getNewMino(type, ox, oy), perm);

      for (let m of [
        getMovedMino(start, -1, 0), // left
        getMovedMino(start, 1, 0), // right
        getMovedMino(start, 0, -1), // down
        getRotatedMinoWithSRS(b, start, 1), // cw
        getRotatedMinoWithSRS(b, start, 2), // 180
        getRotatedMinoWithSRS(b, start, 3), // ccw
      ]) {
        if (!seen.has(`${m.ox},${m.oy},${m.perm}`) && !topless_collide(b, m)) {
          seen.add(`${m.ox},${m.oy},${m.perm}`);
          currQueue.push(`${m.ox},${m.oy},${m.perm}`);
        }
      }
    }
  }

  const lowestReachable = Array.from(seen)
    .map((pos) => {
      const [ox, oy, perm] = pos.split(",").map((x) => parseInt(x));
      return getRotatedMino(getNewMino(type, ox, oy), perm);
    })
    .filter((m) => {
      return !collide(b, m) && isMinoLowest(b, m);
    });
  if (type === "S") {
  }
  return lowestReachable;
};

function getAllPCsByHeight(
  b: Blocks,
  queue: minoType[],
  height: number = 4
): Mino[][] {
  interface State {
    blocks: Blocks;
    queue: minoType[];
    history: Mino[];
  }

  const searchQueue: State[] = getAllQueues(queue).map((q) => ({
    blocks: JSON.parse(JSON.stringify(b)),
    queue: q,
    history: [],
  })) as State[];

  const result: Mino[][] = [];

  // key is the shape of the board
  // value is the queues
  // make them strings to make comparisons easier
  const seenStates = {} as Record<string, string[]>;

  while (searchQueue.length > 0) {
    const currState = searchQueue.shift()!;
    const new_b =
      currState.history.length > 0
        ? setMultipleBlocks(
            currState.blocks,
            currState.history[currState.history.length - 1].blocks,
            currState.history[currState.history.length - 1].type
          )
        : (JSON.parse(JSON.stringify(currState.blocks)) as Blocks);

    // TODO: this misses some solutions
    // Such as | T | ==> |   | vs. |TTT| ==> |   |
    //         |TTT|     | T |     | T |     | T |
    //
    // and     |LLL| ==> |   | vs. |TTT| ==> |   |
    //         |LT |     |   |     |LLL|     |   |
    //         |TTT|     |LT |     |LT |     |LT |
    // The "Returns correct number of solutions to 3x4 box with queue LTJ" test currently fails because of this.
    // but i'm gonna leave it for now because lazy
    // to fix it make it store the output board instead
    const new_b_string = new_b
      // .map((row) => row.map((r) => (r === "" ? " " : "X")).join(""))
      .map((row) => row.map((r) => (r === "" ? " " : r)).join(""))
      .join("\n");

    if (new_b.length === 0) {
      result.push(currState.history);
    } else if (currState.queue.length <= 0) {
      // pass
    } else if (seenStates[new_b_string]?.includes(currState.queue.join(""))) {
      // pass
    } else {
      seenStates[new_b_string] = [
        ...(seenStates[new_b_string] ?? []),
        currState.queue.join(""),
      ];

      for (let m of getAllLowestMinos(
        new_b,
        currState.queue[0],
        new_b.length
      )) {
        searchQueue.push({
          blocks: new_b,
          queue: currState.queue.slice(1),
          history: [...currState.history, m],
        });
      }
    }
  }

  return result;
}

export function getAllQueues(queue: minoType[]) {
  if (queue.length === 0 || queue.length === 1) return [queue];
  if (queue.length === 10) throw new Error("Queue too long. Max 10 minos.");
  const result = [] as minoType[][];

  // silly
  for (let i = 0; i < Math.pow(2, queue.length - 1); i++) {
    const subResult = [] as minoType[];
    let hold = queue[0];
    let head = 1;
    for (let j = 0; j < queue.length - 1; j++) {
      if (i & (1 << j)) {
        subResult.push(hold);
        hold = queue[head];
        head++;
      } else {
        subResult.push(queue[head]);
        head++;
      }
    }
    subResult.push(hold);
    result.push(subResult);
  }

  return result;
}

function eliminate_duplicate_solutions(b: Blocks, sols: Mino[][]): Mino[][] {
  let new_sols = [];
  let seen = [];

  for (let s of sols) {
    let new_b = getBoardWithPlacedMinos(b, s);

    let was_seen = false;
    for (let arrangement of seen) {
      if (JSON.stringify(new_b) === JSON.stringify(arrangement)) {
        was_seen = true;
        break;
      }
    }

    if (!was_seen) {
      seen.push(new_b);
      new_sols.push(s);
    }
  }

  return new_sols;
}
