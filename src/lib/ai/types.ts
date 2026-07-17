import type { AISafetyClassification } from "@/lib/domain";

export type AIProviderName = string;
export type AIFeature = "assistant";

export type AIMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AITokenUsage = {
  input?: number;
  output?: number;
  total?: number;
};

export type AIProviderRequest = {
  systemPrompt: string;
  messages: AIMessage[];
  maxOutputTokens: number;
};

export type AIProviderResult = {
  text: string;
  model: string;
  tokenUsage?: AITokenUsage;
};

export interface AIProvider {
  readonly name: AIProviderName;
  readonly model: string;
  isAvailable(): boolean;
  generate(request: AIProviderRequest): Promise<AIProviderResult>;
}

export type AISafetyStage = "input" | "output" | "routing";

export type AISafetyDecisionEvent = {
  requestId: string;
  feature: AIFeature;
  stage: AISafetyStage;
  classification: AISafetyClassification;
  blocked: boolean;
  provider?: AIProviderName;
  model?: string;
};

export type AISafetyDecisionLogger = (event: AISafetyDecisionEvent) => void | Promise<void>;

export type AIInteractionMetadata = {
  requestId: string;
  feature: AIFeature;
  provider?: AIProviderName;
  model?: string;
  safetyClassification: AISafetyClassification;
  blocked: boolean;
  disclaimerIncluded: boolean;
  tokenUsage?: AITokenUsage;
  promptStored: false;
  responseStored: false;
};

export type AIClientStatus = "allowed" | "blocked" | "unavailable" | "error";

export type AIClientResult = {
  status: AIClientStatus;
  message: string;
  metadata: AIInteractionMetadata;
};

export type AIClientConfig = {
  maxOutputTokens: number;
};

export type AIProviderFactoryContext = {
  env: Record<string, string | undefined>;
  fetchImpl?: typeof fetch;
};

export type AIProviderRegistration = {
  id: AIProviderName;
  autoSelect?(env: Record<string, string | undefined>): boolean;
  create(context: AIProviderFactoryContext): AIProvider;
};
