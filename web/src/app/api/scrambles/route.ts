import { createWebScramble } from "@/features/scramble/createWebScramble";

export async function GET() {
  return Response.json(createWebScramble(), {
    headers: { "Cache-Control": "no-store" },
  });
}
