import { NextRequest, NextResponse } from "next/server";

import { createServerClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = createServerClient();
    const now = new Date();

    // Delete completed sessions older than 24h
    const completedCutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const { data: completedRooms } = await db
      .from("rooms")
      .delete()
      .not("completed_at", "is", null)
      .lt("completed_at", completedCutoff)
      .select("id");

    // Delete abandoned sessions older than 48h (never completed)
    const abandonedCutoff = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();
    const { data: abandonedRooms } = await db
      .from("rooms")
      .delete()
      .is("completed_at", null)
      .lt("created_at", abandonedCutoff)
      .select("id");

    return NextResponse.json({
      deleted: {
        completed: completedRooms?.length ?? 0,
        abandoned: abandonedRooms?.length ?? 0,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Cleanup failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
