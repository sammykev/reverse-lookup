import { NextResponse } from "next/server";
import { lookupUsername } from "@/lib/providers/username";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ error: "Please enter a username." }, { status: 400 });
  }
  const result = await lookupUsername(q);
  return NextResponse.json(result);
}
