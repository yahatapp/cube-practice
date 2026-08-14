import assert from "node:assert/strict";
import test from "node:test";
import { createScramble, generateScrambleMoves } from "../src/index.ts";

void test("generates the requested number of moves without consecutive axes", () => {
  let value = 0;
  const moves = generateScrambleMoves((maximum) => value++ % maximum, 20);
  const axis = { U: 0, D: 0, L: 1, R: 1, F: 2, B: 2 };

  assert.equal(moves.length, 20);
  for (let index = 1; index < moves.length; index += 1) {
    assert.notEqual(axis[moves[index - 1][0]], axis[moves[index][0]]);
  }
});

void test("uses injected platform capabilities", () => {
  let value = 0;
  const scramble = createScramble(
    {
      randomInt: (maximum) => value++ % maximum,
      createId: () => "scramble-id",
      now: () => new Date("2026-08-13T00:00:00.000Z"),
    },
    { length: 3 },
  );

  assert.equal(scramble.id, "scramble-id");
  assert.equal(scramble.generatedAt, "2026-08-13T00:00:00.000Z");
  assert.equal(scramble.notation.split(" ").length, 3);
});
