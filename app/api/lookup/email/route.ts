import { NextResponse } from "next/server";
import { lookupEmail } from "@/lib/providers/email";
import { enrichPerson } from "@/lib/providers/enrich";
import { lookupBreaches } from "@/lib/providers/breaches";
import { discoverSocialAccounts } from "@/lib/providers/social-discovery";
import { isValidEmailFormat } from "@/lib/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  if (!q) {
    return NextResponse.json({ error: "Missing email address." }, { status: 400 });
  }
  if (!isValidEmailFormat(q)) {
    return NextResponse.json({ error: "That doesn't look like a valid email address." }, { status: 400 });
  }
  const [validation, enrichment, breaches, socialDiscovery] = await Promise.all([
    lookupEmail(q),
    enrichPerson({ email: q }),
    lookupBreaches(q),
    discoverSocialAccounts(q),
  ]);
  return NextResponse.json({ ...validation, enrichment, breaches, socialDiscovery });
}
