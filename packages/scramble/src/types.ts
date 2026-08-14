export type Scramble = {
  id: string;
  notation: string;
  generatedAt: string;
};

export type ScrambleFace = "U" | "D" | "L" | "R" | "F" | "B";

export type ScrambleSuffix = "" | "'" | "2";

export type ScrambleMove = `${ScrambleFace}${ScrambleSuffix}`;

/**
 * Platform capabilities required to create a complete scramble record.
 *
 * Web and native applications own these adapters so this package does not
 * depend on Web Crypto, Node.js, React Native, or any UUID implementation.
 */
export type ScrambleDependencies = {
  randomInt: (maxExclusive: number) => number;
  createId: () => string;
  now: () => Date;
};

export type CreateScrambleOptions = {
  /** Uses a random length from 20 through 22 when omitted. */
  length?: number;
};
