import { NextResponse } from "next/server";
import { lookupPeople } from "@/lib/providers/people";
import { isPlausibleName } from "@/lib/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const state = (searchParams.get("state") || "").trim() || undefined;
  if (!q) {
    return NextResponse.json({ error: "Missing name." }, { status: 400 });
  }
  if (!isPlausibleName(q)) {
    return NextResponse.json({ error: "Please enter a full name." }, { status: 400 });
  }
  const result = await lookupPeople(q, state);
  return NextResponse.json(result);
}
