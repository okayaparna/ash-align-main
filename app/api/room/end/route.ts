import { NextResponse } from "next/server";
import { z } from "zod";

import { createServerClient } from "@/lib/supabase-server";
import { endRoom } from "@/lib/room";

const schema = z.object({
  participantId: z.string().uuid(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.parse(body);
    const db = createServerClient();
    await endRoom(db, parsed.participantId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to end session";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
