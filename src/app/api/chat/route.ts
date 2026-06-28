// src/app/api/chat/route.ts

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { chatWithAI } from "@/lib/ai";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const MAX_MESSAGES = 40;
const MAX_MESSAGE_CONTENT = 2000;

const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(MAX_MESSAGE_CONTENT),
});

const ChatRequestSchema = z.object({
  messages: z.array(ChatMessageSchema).max(MAX_MESSAGES),
  context: z.string().max(2000).optional(),
});

export async function POST(request: NextRequest) {
  // Auth check — only signed-in users can spend tokens
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized. Please sign in to use AI chat." },
      { status: 401 }
    );
  }

  // Rate limit: 20 messages / minute per IP (chat is more interactive)
  const ip = getClientIp(request);
  const rl = rateLimit({ key: `chat:${ip}`, limit: 20, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
        },
      }
    );
  }

  // Validate request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body." },
      { status: 400 }
    );
  }

  const parsed = ChatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid request.",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  try {
    const response = await chatWithAI(parsed.data.messages, parsed.data.context);

    // Save chat to history (best-effort, do not fail the request if DB is down)
    try {
      await supabase.from("chat_messages").insert({
        user_id: user.id,
        role: "user",
        content:
          parsed.data.messages[parsed.data.messages.length - 1]?.content ??
          "",
      });
      await supabase.from("chat_messages").insert({
        user_id: user.id,
        role: "assistant",
        content: response,
      });
    } catch (dbErr) {
      console.warn("Failed to persist chat messages (non-fatal):", dbErr);
    }

    return NextResponse.json({ message: response });
  } catch (error) {
    console.error("Chat Error:", error);
    return NextResponse.json(
      { error: "Failed to get response. Please try again." },
      { status: 500 }
    );
  }
}
