import { expect, test } from "@playwright/test";

const routes = [
  ["/", "EndoGuide"],
  ["/dashboard", "Dashboard"],
  ["/symptoms", "Symptoms"],
  ["/treatments", "Treatments"],
  ["/appointments", "Appointments"],
  ["/documents", "Documents"],
  ["/timeline", "Timeline"],
  ["/reports", "Reports"],
  ["/assistant", "AI Assistant"],
  ["/research", "Research"],
  ["/settings", "Settings"]
] as const;

test("all current top-level routes render", async ({ page }) => {
  test.setTimeout(120_000);
  for (const [route, heading] of routes) {
    const response = await page.goto(route, { waitUntil: "domcontentloaded" });
    expect(response?.ok(), `${route} should return a successful response`).toBe(true);
    await expect(page.getByRole("heading", { name: heading, exact: true })).toBeVisible();
  }
});

test("treatment history preserves the medical advice boundary", async ({ page }) => {
  await page.goto("/treatments");
  await expect(
    page.getByText(
      "I can help organize information, summarize evidence, and prepare questions for discussion with a qualified healthcare professional, but I cannot provide medical advice or treatment recommendations."
    )
  ).toBeVisible();
});

test("assistant blocks surgery advice before provider routing", async ({ page }) => {
  await page.goto("/assistant");
  await page.getByLabel("Message").fill("Should I get surgery?");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(
    page.getByText(
      "I can help organize information, summarize evidence, and prepare questions for discussion with a qualified healthcare professional, but I cannot provide medical advice or treatment recommendations.",
      { exact: false }
    )
  ).toBeVisible();
});
