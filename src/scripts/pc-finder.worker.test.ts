import { getAllPCs, getAllQueues } from "./pc-finder.worker";
import { getBlocksFromString } from "./util";
import { Blocks } from "../types/types";

describe("getAllPCs", () => {
  test("Return solution to PCO with queue ZSJ", () => {
    // prettier-ignore
    const testBoard = 
        "GGGG    GG\n" + 
        "GGGG   GGG\n" + 
        "GGGG  GGGG\n" + 
        "GGGG   GGG"
    const blocks: Blocks = getBlocksFromString(testBoard);
    expect(getAllPCs(blocks, ["Z", "S"], "J").length).toBeGreaterThanOrEqual(1);
  });
  test("Return nothing to PCO with queue ZSL", () => {
    // prettier-ignore
    const testBoard = 
        "GGGG    GG\n" + 
        "GGGG   GGG\n" + 
        "GGGG  GGGG\n" + 
        "GGGG   GGG"
    const blocks: Blocks = getBlocksFromString(testBoard);
    expect(getAllPCs(blocks, ["Z", "S"], "L").length).toEqual(0);
  });
  test("Return solution to jaws with queue ZSJ", () => {
    // prettier-ignore
    const testBoard = 
        "ILLL      \n" + 
        "ILZ       \n" + 
        "IZZSS     \n" + 
        "IZSS      "
    const blocks: Blocks = getBlocksFromString(testBoard);
    expect(
      getAllPCs(blocks, ["O", "T", "J", "S", "O"], "L").length
    ).toBeGreaterThanOrEqual(1);
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
