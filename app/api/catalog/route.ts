import { getCatalog } from "@/server/catalog";

export async function GET() {
  return Response.json(await getCatalog());
}
