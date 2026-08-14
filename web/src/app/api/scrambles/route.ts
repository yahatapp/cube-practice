import { createWebScramble } from "@/features/scramble/create-web-scramble";

export async function GET() {
  return Response.json(createWebScramble(), {
    headers: { "Cache-Control": "no-store" },
  });
}
