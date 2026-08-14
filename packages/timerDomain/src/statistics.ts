import type { Solve } from "./solve.ts";

export const WCA_AVERAGE_SIZES = [5, 12, 100] as const;

export type WcaAverageSize = (typeof WCA_AVERAGE_SIZES)[number];

export type SolveStats = {
  best: number | null;
  ao5: number | null;
  ao12: number | null;
  ao100: number | null;
};

type TimedSolve = Pick<Solve, "milliseconds">;

function assertValidAverageSize(size: number): void {
  if (!Number.isSafeInteger(size) || size < 3) {
    throw new RangeError("Average size must be a safe integer of at least 3");
  }
}

/**
 * Calculates a WCA-style trimmed average from the first `size` solves.
 *
 * Callers should supply solves newest-first, matching the application's
 * persisted history. The best and worst 5%, rounded up, are removed. The
 * returned milliseconds remain unrounded to preserve existing behavior.
 */
export function calculateWcaAverage(solves: readonly TimedSolve[], size: number): number | null {
  assertValidAverageSize(size);

  if (solves.length < size) {
    return null;
  }

  const window = solves.slice(0, size).map((solve) => solve.milliseconds);
  const trimCount = Math.ceil(size * 0.05);
  const included = window.sort((left, right) => left - right).slice(trimCount, size - trimCount);
  const total = included.reduce((sum, milliseconds) => sum + milliseconds, 0);

  return total / included.length;
}

/** Calculates the timer values currently displayed by the session UI. */
export function calculateStats(solves: readonly TimedSolve[]): SolveStats {
  let best: number | null = null;

  for (const solve of solves) {
    best = best === null ? solve.milliseconds : Math.min(best, solve.milliseconds);
  }

  return {
    best,
    ao5: calculateWcaAverage(solves, 5),
    ao12: calculateWcaAverage(solves, 12),
    ao100: calculateWcaAverage(solves, 100),
  };
}
