import { PageShell } from "@/components/layout/page-shell";
import { AssistantClient } from "@/features/ai-assistant/assistant-client";

export default function AssistantPage() {
  return (
    <PageShell
      title="AI Assistant"
      description="Educational and organizational help with safety checks before and after every model call. The assistant does not diagnose or recommend care."
    >
      <AssistantClient />
    </PageShell>
  );
}
