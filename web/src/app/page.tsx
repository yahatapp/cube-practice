import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import TimerWorkspace from "@/features/timer/components/TimerWorkspace";
import { createWebScramble } from "@/features/scramble/createWebScramble";
import { scrambleQueryKey } from "@/features/scramble/scrambleQuery";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: scrambleQueryKey,
    queryFn: () => createWebScramble(),
  });

  return (
    <main className="mx-auto w-full max-w-5xl px-3.5 py-5 pb-10 max-sm:px-2.5 md:pt-8">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <TimerWorkspace />
      </HydrationBoundary>
    </main>
  );
}
