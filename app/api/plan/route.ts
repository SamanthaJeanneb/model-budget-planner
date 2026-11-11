import { z } from "zod";
import { planStream } from "@/server/plan";

const Body = z.object({ brief: z.string().trim().min(10).max(4000), model: z.string().min(1) });

export async function POST(request: Request) {
  const body = Body.safeParse(await request.json().catch(() => null));
  if (!body.success) return Response.json({ error: "invalid-brief" }, { status: 400 });
  const stream = await planStream(body.data.brief, body.data.model, request.signal);
  if (!stream) return Response.json({ error: "unknown-model" }, { status: 400 });
  return new Response(stream, { headers: { "Content-Type": "application/x-ndjson; charset=utf-8" } });
}
