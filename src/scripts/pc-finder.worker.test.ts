import { getAllPCs, getAllQueues } from "./pc-finder.worker";
import { getBlocksFromString } from "./util";
import { Blocks } from "../types/types";

describe("getAllPCs", () => {
  test("Finds the quad", () => {
    // prettier-ignore
    const testBoard = 
        "GGGGGG GGG\n" + 
        "GGGGGG GGG\n" + 
        "GGGGGG GGG\n" + 
        "GGGGGG GGG";
    const blocks: Blocks = getBlocksFromString(testBoard);
    expect(getAllPCs(blocks, ["I"]).length).toEqual(1);
  });
  test("Spins J into slot", () => {
    // prettier-ignore
    const testBoard = 
        "          \n" + 
        "          \n" + 
        " GGGGGGGGG\n" + 
        "   GGGGGGG"
    const blocks: Blocks = getBlocksFromString(testBoard);
    expect(getAllPCs(blocks, ["J"]).length).toEqual(1);
  });
  test("Doesn't 180 J when not possible", () => {
    // prettier-ignore
    const testBoard = 
        "          \n" + 
        "GGGGGGGGG \n" + 
        "GGGGGGGGG \n" + 
        "GGGGGGGG  "
    const blocks: Blocks = getBlocksFromString(testBoard);
    expect(getAllPCs(blocks, ["J"]).length).toEqual(0);
  });
  test("Spins Z into slot", () => {
    // prettier-ignore
    const testBoard = 
        "          \n" + 
        "          \n" + 
        "  GGGGGGGG\n" + 
        "G  GGGGGGG"
    const blocks: Blocks = getBlocksFromString(testBoard);
    expect(getAllPCs(blocks, ["Z"]).length).toEqual(1);
  });
  test("Returns solution to PCO with queue ZSJ", () => {
    // prettier-ignore
    const testBoard = 
        "GGGG    GG\n" + 
        "GGGG   GGG\n" + 
        "GGGG  GGGG\n" + 
        "GGGG   GGG"
    const blocks: Blocks = getBlocksFromString(testBoard);
    expect(getAllPCs(blocks, ["J", "Z", "S"]).length).toBeGreaterThanOrEqual(1);
  });
  test("Returns nothing to PCO with queue ZSL", () => {
    // prettier-ignore
    const testBoard = 
        "GGGG    GG\n" + 
        "GGGG   GGG\n" + 
        "GGGG  GGGG\n" + 
        "GGGG   GGG"
    const blocks: Blocks = getBlocksFromString(testBoard);
    expect(getAllPCs(blocks, ["L", "Z", "S"]).length).toEqual(0);
  });
  test("Returns solution to jaws with queue LOTJSO", () => {
    // prettier-ignore
    const testBoard = 
        "ILLL      \n" + 
        "ILZ       \n" + 
        "IZZSS     \n" + 
        "IZSS      "
    const blocks: Blocks = getBlocksFromString(testBoard);
    expect(
      getAllPCs(blocks, ["L", "O", "T", "J", "S", "O"]).length
    ).toEqual(2);
  });
  test("Returns solution to half-PCO with queue LZJZOZT", () => {
    // prettier-ignore
    const testBoard = 
        "         I\n" + 
        "T        I\n" + 
        "TTSS   OOI\n" + 
        "TSS    OOI"
    const blocks: Blocks = getBlocksFromString(testBoard);
    expect(
      getAllPCs(blocks, ["L", "Z", "J", "S", "O", "Z", "T"]).length
    ).toEqual(3);
  });
  test("Returns correct number of solutions to 3x4 box with queue LTJ", () => {
    // prettier-ignore
    const testBoard = 
        "GGGG   GGG\n" + 
        "GGGG   GGG\n" + 
        "GGGG   GGG\n" + 
        "GGGG   GGG"
    const blocks: Blocks = getBlocksFromString(testBoard);
    expect(getAllPCs(blocks, ["L", "T", "J"]).length).toBeGreaterThanOrEqual(6);
  });
});

describe("getAllQueues", () => {
  test("Empty input should return empty", () => {
    expect(getAllQueues([])).toEqual([[]]);
  });
  test("One mino should return that mino", () => {
    expect(getAllQueues(["I"])).toEqual([["I"]]);
  });
  test("Two minos should return two permutations", () => {
    const result = getAllQueues(["Z", "S"]);
    expect(result).toContainEqual(["Z", "S"]);
    expect(result).toContainEqual(["S", "Z"]);
    expect(result.length).toEqual(2);
    // expect(getAllQueues(["Z", "S"])).toContainEqual
  });
});
