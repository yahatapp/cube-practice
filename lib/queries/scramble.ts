import type { Scramble } from "@/lib/cube/scramble";

export const scrambleQueryKey = ["scramble", "333"] as const;

export async function fetchScramble(): Promise<Scramble> {
  const response = await fetch("/api/scrambles", { cache: "no-store" });
  if (!response.ok) throw new Error("スクランブルを取得できませんでした");
  return response.json() as Promise<Scramble>;
}
