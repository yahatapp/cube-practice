import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { TimerWorkspace } from "@/components/timer-workspace";
import { createScramble } from "@/lib/cube/scramble";
import { scrambleQueryKey } from "@/lib/queries/scramble";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: scrambleQueryKey,
    queryFn: () => createScramble(),
  });

  return (
    <main className="shell">
      <header className="hero">
        <p className="eyebrow">CUBE PRACTICE / MOBILE FIRST</p>
        <h1>読む力を、タイムに変える。</h1>
        <p>通常計測から X-Cross・F2L #1 の集中練習まで。まずは読みの得意不得意を記録します。</p>
      </header>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <TimerWorkspace />
      </HydrationBoundary>
    </main>
  );
}
