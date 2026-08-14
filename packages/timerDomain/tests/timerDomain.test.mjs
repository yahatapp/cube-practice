import assert from "node:assert/strict";
import test from "node:test";
import { calculateStats, formatTime } from "../src/index.ts";

function solve(milliseconds) {
  return { id: String(milliseconds), milliseconds, scramble: "", createdAt: "" };
}

void test("formats durations with centisecond precision", () => {
  assert.equal(formatTime(61_239), "1:01.23");
  assert.equal(formatTime(999, true), "0.99s");
});

void test("calculates best and trimmed session averages", () => {
  const solves = Array.from({ length: 100 }, (_, index) => solve((index + 1) * 1_000));
  const stats = calculateStats(solves);

  assert.equal(stats.best, 1_000);
  assert.equal(stats.ao5, 3_000);
  assert.equal(stats.ao12, 6_500);
  assert.equal(stats.ao100, 50_500);
});
