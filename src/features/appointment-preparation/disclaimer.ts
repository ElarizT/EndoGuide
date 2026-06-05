import { MEDICAL_OUTPUT_DISCLAIMER } from "@/lib/safety";

export function renderMedicalDisclaimer() {
  return MEDICAL_OUTPUT_DISCLAIMER;
}

export function renderDisclaimerHtml() {
  return `<p class="medical-disclaimer">${escapeHtml(renderMedicalDisclaimer())}</p>`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
