import { NextResponse } from "next/server";
import { supabaseServerClient } from "@/lib/supabase";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const conversationId = typeof body.conversationId === "string" ? body.conversationId : null;

  if (!conversationId) {
    return NextResponse.json({ error: "conversationId required" }, { status: 400 });
  }

  try {
    // Delete messages first, then the conversation
    await supabaseServerClient.from("messages").delete().eq("conversation_id", conversationId);
    await supabaseServerClient.from("conversations").delete().eq("id", conversationId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
