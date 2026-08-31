import { NextRequest, NextResponse } from "next/server";

import { createServerClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  try {
    const roomId = request.nextUrl.searchParams.get("roomId");
    if (!roomId) return NextResponse.json({ error: "Missing roomId" }, { status: 400 });

    const db = createServerClient();
    const { data: room } = await db.from("rooms").select("id, phase").eq("id", roomId).single();
    if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

    const { data: participants } = await db
      .from("participants")
      .select("name, role")
      .eq("room_id", roomId)
      .order("created_at", { ascending: true });

    const creator = participants?.find((p: { role: string }) => p.role === "partner_a");

    return NextResponse.json({
      phase: room.phase,
      creatorName: creator?.name || null,
      participantCount: participants?.length || 0,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch room info" }, { status: 500 });
  }
}
