import { createScramble } from "@/lib/cube/scramble";

export async function GET() {
  return Response.json(createScramble(), {
    headers: { "Cache-Control": "no-store" },
  });
}
