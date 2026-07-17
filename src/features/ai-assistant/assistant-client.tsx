"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { getClientServices } from "@/features/shared/client-services";
import { cn } from "@/lib/utils";
import { sendAssistantMessage } from "./assistant-service";

const SUGGESTED_PROMPTS = [
  "Summarize my symptoms",
  "Help me prepare questions for my doctor",
  "Explain my timeline",
  "Summarize this research note",
  "Create a non-medical appointment checklist"
] as const;

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  blocked?: boolean;
};

export function AssistantClient() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localMode, setLocalMode] = useState(false);
  const [localInteractionLogging, setLocalInteractionLogging] = useState(
    process.env.NEXT_PUBLIC_ENDOGUIDE_LOCAL_AI_LOGGING === "true"
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    async function loadMode() {
      try {
        const { storage } = await getClientServices();
        setLocalMode(storage.mode === "local");
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Unable to initialize the assistant.");
      }
    }
    void loadMode();
  }, []);

  async function submitMessage(message: string) {
    const trimmed = message.trim();
    if (!trimmed || loading) return;

    setMessages((current) => [...current, {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed
    }]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const { user, storage } = await getClientServices();
      const result = await sendAssistantMessage(storage, user.id, trimmed, {
        localInteractionLogging
      });
      setMessages((current) => [...current, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: result.message,
        blocked: result.status === "blocked"
      }]);
      if (result.status === "unavailable" || result.status === "error") {
        setError(result.message);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The assistant request failed.");
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitMessage(input);
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader><CardTitle>Safe suggested prompts</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {SUGGESTED_PROMPTS.map((prompt) => (
            <Button
              disabled={loading}
              key={prompt}
              onClick={() => void submitMessage(prompt)}
              size="sm"
              type="button"
              variant="secondary"
            >
              {prompt}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Conversation</CardTitle>
          <p className="text-sm leading-6 text-muted-foreground">
            Only the message you submit is sent to the configured provider. EndoGuide does not automatically attach your stored health records, and chat content is not persisted.
          </p>
        </CardHeader>
        <CardContent>
          <div aria-live="polite" className="mb-5 grid min-h-48 gap-3 rounded-md border bg-muted/40 p-4">
            {messages.length === 0 ? (
              <p className="text-sm text-muted-foreground">Ask for educational explanation, organization, summaries, or questions for a clinician.</p>
            ) : null}
            {messages.map((message) => (
              <div
                className={cn(
                  "max-w-[90%] whitespace-pre-wrap rounded-lg p-3 text-sm leading-6",
                  message.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "mr-auto border bg-card",
                  message.blocked && "border-destructive"
                )}
                key={message.id}
              >
                <span className="sr-only">{message.role === "user" ? "You" : "Assistant"}: </span>
                {message.content}
              </div>
            ))}
            {loading ? <p className="text-sm text-muted-foreground">Assistant is preparing a safety-checked response...</p> : null}
          </div>

          <form className="grid gap-3" onSubmit={handleSubmit}>
            <Textarea
              aria-label="Message"
              disabled={loading}
              maxLength={4000}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask EndoGuide to organize or explain information..."
              ref={textareaRef}
              value={input}
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">{input.length}/4000</span>
              <Button disabled={loading || !input.trim()} type="submit">
                {loading ? "Sending..." : "Send message"}
              </Button>
            </div>
          </form>

          {localMode ? (
            <label className="mt-5 flex items-start gap-3 rounded-md border p-3 text-sm leading-6">
              <input
                checked={localInteractionLogging}
                className="mt-1"
                onChange={(event) => setLocalInteractionLogging(event.target.checked)}
                type="checkbox"
              />
              <span>
                Save non-sensitive interaction metadata in this browser. Disabled by default; messages and responses are never stored.
              </span>
            </label>
          ) : null}

          {error ? <p className="mt-4 text-sm text-destructive" role="alert">{error}</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}

export { SUGGESTED_PROMPTS };
