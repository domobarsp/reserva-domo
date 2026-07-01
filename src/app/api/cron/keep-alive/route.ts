import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const started = Date.now();
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("restaurants")
    .select("id")
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[keep-alive] Supabase ping failed:", error.message);
    return NextResponse.json(
      { ok: false, error: error.message, durationMs: Date.now() - started },
      { status: 503 }
    );
  }

  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    restaurantId: data?.id ?? null,
    durationMs: Date.now() - started,
  });
}
