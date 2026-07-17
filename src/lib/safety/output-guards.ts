import type { AISafetyClassification } from "@/lib/domain";

const unsafeOutputPatterns = [
  /\byou (?:definitely|certainly|clearly|probably|likely) have\b/i,
  /\b(?:your|the) diagnosis is\b/i,
  /\bthis (?:confirms|proves|means) (?:that )?you have\b/i,
  /\b(?:this|your symptoms?|your history) (?:sounds|looks|appears) (?:like|consistent with)\b/i,
  /\b(?:i recommend|you should) .{0,50}\b(?:medication|medicine|drug|hormone|treatment|therapy)\b/i,
  /\b(?:start|stop|discontinue|increase|decrease|switch) (?:your )?(?:medication|medicine|hormones?|treatment|therapy|dose|dosage)\b/i,
  /\b(?:take|use) \d+(?:\.\d+)?\s*(?:mg|mcg|g|ml)\b/i,
  /\b(?:take|start|stop|use|avoid|switch to) (?:ibuprofen|naproxen|paracetamol|acetaminophen|aspirin|dienogest|elagolix|relugolix|norethindrone|birth control|oral contraceptives?|hormones?)\b/i,
  /\b(?:take|start|stop|use|avoid|switch to)\b.{0,50}\b(?:for (?:your )?(?:pain|symptoms|endometriosis)|to treat|daily|per day)\b/i,
  /\b(?:the )?best (?:treatment|medication|therapy) (?:is|for you is)\b/i,
  /\b(?:you should|i recommend) (?:get|have|avoid) surgery\b/i,
  /\b(?:consider|choose|have|get|avoid) (?:surgery|a laparoscopy)\b.{0,30}\b(?:for you|for your symptoms|to treat)\b/i,
  /\bsurgery is (?:the )?(?:right|best|necessary) (?:choice|option) for you\b/i
];

export function classifyAIOutput(output: string): AISafetyClassification {
  if (!output.trim()) return "needs-review";
  return unsafeOutputPatterns.some((pattern) => pattern.test(output))
    ? "blocked-unsafe-output"
    : "allowed";
}
