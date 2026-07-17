import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { aiClientResultSchema, aiChatRequestSchema, createAIClient } from "@/lib/ai";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const input = aiChatRequestSchema.parse(await request.json());
    const result = aiClientResultSchema.parse(await createAIClient().send(input));
    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" }
    });
  } catch (cause) {
    const message = cause instanceof ZodError
      ? cause.issues[0]?.message ?? "Invalid assistant request."
      : "Unable to process the assistant request.";
    return NextResponse.json({ error: message }, {
      status: cause instanceof ZodError ? 400 : 500,
      headers: { "Cache-Control": "no-store" }
    });
  }
}
