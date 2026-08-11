export type Scramble = {
  id: string;
  notation: string;
  generatedAt: string;
};

const FACES = ["U", "D", "L", "R", "F", "B"] as const;
const SUFFIXES = ["", "'", "2"] as const;
const AXIS: Record<(typeof FACES)[number], number> = { U: 0, D: 0, L: 1, R: 1, F: 2, B: 2 };

function randomIndex(length: number): number {
  return crypto.getRandomValues(new Uint32Array(1))[0] % length;
}

export function createScramble(length = 20): Scramble {
  const moves: string[] = [];
  let previousFace: (typeof FACES)[number] | undefined;

  while (moves.length < length) {
    const face = FACES[randomIndex(FACES.length)];
    if (previousFace && AXIS[face] === AXIS[previousFace]) continue;
    moves.push(`${face}${SUFFIXES[randomIndex(SUFFIXES.length)]}`);
    previousFace = face;
  }

  return {
    id: crypto.randomUUID(),
    notation: moves.join(" "),
    generatedAt: new Date().toISOString(),
  };
}
