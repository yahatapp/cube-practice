import type {
  CreateScrambleOptions,
  Scramble,
  ScrambleDependencies,
  ScrambleFace,
  ScrambleMove,
  ScrambleSuffix,
} from "./types.ts";

const FACES = ["U", "D", "L", "R", "F", "B"] as const satisfies readonly ScrambleFace[];
const SUFFIXES = ["", "'", "2"] as const satisfies readonly ScrambleSuffix[];
const AXIS: Readonly<Record<ScrambleFace, number>> = {
  U: 0,
  D: 0,
  L: 1,
  R: 1,
  F: 2,
  B: 2,
};

export const DEFAULT_SCRAMBLE_LENGTH = 20;
export const SCRAMBLE_LENGTH_VARIATION = 3;

type RandomInt = ScrambleDependencies["randomInt"];

function getRandomIndex(randomInt: RandomInt, maxExclusive: number): number {
  const index = randomInt(maxExclusive);

  if (!Number.isInteger(index) || index < 0 || index >= maxExclusive) {
    throw new RangeError(
      `randomInt(${maxExclusive}) must return an integer from 0 through ${maxExclusive - 1}`,
    );
  }

  return index;
}

function assertValidLength(length: number): void {
  if (!Number.isSafeInteger(length) || length <= 0) {
    throw new RangeError("Scramble length must be a positive safe integer");
  }
}

/**
 * Generates moves without reading any platform globals.
 * Consecutive moves never use the same axis.
 */
export function generateScrambleMoves(randomInt: RandomInt, length: number): ScrambleMove[] {
  assertValidLength(length);

  const moves: ScrambleMove[] = [];
  let previousFace: ScrambleFace | undefined;

  while (moves.length < length) {
    const face = FACES[getRandomIndex(randomInt, FACES.length)]!;

    if (previousFace !== undefined && AXIS[face] === AXIS[previousFace]) {
      continue;
    }

    const suffix = SUFFIXES[getRandomIndex(randomInt, SUFFIXES.length)]!;
    moves.push(`${face}${suffix}`);
    previousFace = face;
  }

  return moves;
}

/** Creates a serializable scramble using only explicitly supplied capabilities. */
export function createScramble(
  dependencies: ScrambleDependencies,
  options: CreateScrambleOptions = {},
): Scramble {
  const length =
    options.length ??
    DEFAULT_SCRAMBLE_LENGTH + getRandomIndex(dependencies.randomInt, SCRAMBLE_LENGTH_VARIATION);
  const notation = generateScrambleMoves(dependencies.randomInt, length).join(" ");

  return {
    id: dependencies.createId(),
    notation,
    generatedAt: dependencies.now().toISOString(),
  };
}
