import "server-only";

import { createScramble, type Scramble } from "@cube-practice/scramble";

function randomInt(maxExclusive: number): number {
  const limit = Math.floor(0x1_0000_0000 / maxExclusive) * maxExclusive;
  const values = new Uint32Array(1);

  do {
    crypto.getRandomValues(values);
  } while (values[0] >= limit);

  return values[0] % maxExclusive;
}

export function createWebScramble(): Scramble {
  return createScramble({
    randomInt,
    createId: () => crypto.randomUUID(),
    now: () => new Date(),
  });
}
