import { NextResponse } from "next/server";
import { lookupPhone } from "@/lib/providers/phone";
import { enrichPerson } from "@/lib/providers/enrich";
import { isPlausiblePhone } from "@/lib/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  if (!q) {
    return NextResponse.json({ error: "Missing phone number." }, { status: 400 });
  }
  if (!isPlausiblePhone(q)) {
    return NextResponse.json({ error: "That doesn't look like a valid phone number." }, { status: 400 });
  }
  const [validation, enrichment] = await Promise.all([
    lookupPhone(q),
    enrichPerson({ phone: q }),
  ]);
  return NextResponse.json({ ...validation, enrichment });
}
