import { NextResponse } from "next/server";

import { createServerClient } from "@/lib/supabase-server";

export async function POST() {
  try {
    const db = createServerClient();
    const { data, error } = await db.from("rooms").insert({}).select("id").single();
    if (error) throw new Error(`Failed to create room: ${error.message}`);
    return NextResponse.json({ roomId: data.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create room";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
