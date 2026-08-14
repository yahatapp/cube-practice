import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { TimerWorkspace } from "@/features/timer/components/timer-workspace";
import { createWebScramble } from "@/features/scramble/create-web-scramble";
import { scrambleQueryKey } from "@/features/scramble/scramble-query";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: scrambleQueryKey,
    queryFn: () => createWebScramble(),
  });

  return (
    <main className="shell">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <TimerWorkspace />
      </HydrationBoundary>
    </main>
  );
}
