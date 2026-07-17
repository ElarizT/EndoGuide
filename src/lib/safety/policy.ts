import type { AISafetyClassification } from "@/lib/domain";
import { TREATMENT_RECOMMENDATION_REFUSAL } from "./constants";

export type SafetyClassification = AISafetyClassification;

const inputRules: Array<{
  classification: Exclude<AISafetyClassification, "allowed" | "blocked-unsafe-output" | "needs-review">;
  patterns: RegExp[];
}> = [
  {
    classification: "blocked-diagnosis",
    patterns: [
      /\b(do|could|might) i (definitely )?have\b/i,
      /\bdo i (definitely|certainly|really) have\b/i,
      /\bis this (endometriosis|a diagnosis|cancer|a disease|a condition)\b/i,
      /\bdoes this mean (?:that )?i have\b/i,
      /\b(?:are|do) my symptoms (?:consistent with|mean|prove|confirm)\b/i,
      /\bdiagnose me\b/i,
      /\bwhat(?:'s| is) my diagnosis\b/i
    ]
  },
  {
    classification: "blocked-surgery",
    patterns: [
      /\bshould i (get|have|avoid) surgery\b/i,
      /\bdo i need surgery\b/i,
      /\brecommend (?:that i )?(?:get|have|avoid)? ?surgery\b/i,
      /\bis surgery (?:right|best|necessary) for me\b/i,
      /\bshould i (?:get|have|avoid) (?:a )?laparoscopy\b/i
    ]
  },
  {
    classification: "blocked-dosage-advice",
    patterns: [
      /\bwhat (dose|dosage) should i (take|use)\b/i,
      /\bhow (?:many|much) .{0,30} should i take\b/i,
      /\b(?:recommend|suggest) (?:a )?(dose|dosage)\b/i,
      /\bshould i (?:increase|decrease|change) (?:my )?(dose|dosage)\b/i
    ]
  },
  {
    classification: "blocked-start-stop-treatment",
    patterns: [
      /\bcan i (start|stop|quit|discontinue) (?:my )?(?:treatment|therapy|medication|medicine|hormones?|pills?)\b/i,
      /\bshould i (start|stop|quit|discontinue|continue) (?:my )?(?:treatment|therapy|medication|medicine|hormones?|pills?)\b/i,
      /\btell me (?:whether|if) to (start|stop|continue)\b/i
    ]
  },
  {
    classification: "blocked-treatment-ranking",
    patterns: [
      /\b(which|what) treatment is best\b/i,
      /\brank (?:the )?(?:treatments|medications|therapies|options)\b/i,
      /\bbest (?:treatment|medication|therapy|option) for me\b/i,
      /\bcompare .{0,40} and tell me which (?:is|one is) better\b/i
    ]
  },
  {
    classification: "blocked-medication",
    patterns: [
      /\bwhat (medication|medicine|drug|pill|hormone) should i take\b/i,
      /\b(?:should|can) i take (?!notes?\b|my (?:notes|records|report)\b).+/i,
      /\bwhich (medication|medicine|drug|pill|hormone) should i (take|use|choose)\b/i,
      /\b(?:recommend|prescribe|suggest) (?:a |some )?(medication|medicine|drug|pill|hormone)\b/i
    ]
  },
  {
    classification: "blocked-treatment-advice",
    patterns: [
      /\bgive me (?:a )?personalized treatment plan\b/i,
      /\bcreate (?:a )?(?:personalized|personalised) (?:care|treatment) plan\b/i,
      /\bwhat treatment should i (?:get|choose|try|use)\b/i,
      /\b(?:recommend|suggest) (?:a )?(?:treatment|therapy)\b/i,
      /\bshould i (?:try|choose|avoid) (?:this |a )?(?:treatment|therapy)\b/i
    ]
  }
];

export function classifyUserMedicalRequest(input: string): SafetyClassification {
  const normalized = input.trim().replace(/\s+/g, " ");
  for (const rule of inputRules) {
    if (rule.patterns.some((pattern) => pattern.test(normalized))) {
      return rule.classification;
    }
  }
  return "allowed";
}

export function getSafetyResponseForRequest(input: string): string | null {
  const classification = classifyUserMedicalRequest(input);
  if (classification !== "allowed") {
    return TREATMENT_RECOMMENDATION_REFUSAL;
  }
  return null;
}
