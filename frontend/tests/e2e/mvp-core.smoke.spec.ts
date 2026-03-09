import { expect, test } from "@playwright/test";

const baseUrlConfigured = Boolean(process.env.E2E_BASE_URL);

const login = async (page, username, password) => {
  await page.goto("/auth/login");
  await page.locator("input").nth(0).fill(username);
  await page.locator("input").nth(1).fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL("**/");
};

test.describe("MVP core smoke", () => {
  test.skip(!baseUrlConfigured, "Set E2E_BASE_URL and running frontend/backend to execute smoke tests.");

  test("client can post a job", async ({ page }) => {
    const title = `E2E Client Job ${Date.now()}`;

    await login(
      page,
      process.env.E2E_CLIENT_USER || "client.demo@n8nexperts.com",
      process.env.E2E_CLIENT_PASS || "Password123!"
    );

    await page.goto("/post-project");
    await page.getByLabel(/project title/i).fill(title);
    await page
      .getByLabel(/project description/i)
      .fill("Need an end-to-end n8n workflow for lead routing, retries, and support escalation with full handoff docs.");
    await page.getByLabel(/budget/i).fill("1800");
    await page.getByLabel(/skills/i).fill("n8n, webhooks, hubspot");
    await page.getByRole("button", { name: /publish project/i }).click();

    await page.waitForURL("**/my-jobs");
    await expect(page.getByRole("heading", { name: /my jobs/i })).toBeVisible();
    await expect(page.getByRole("button", { name: title })).toBeVisible();
  });

  test("expert can publish profile and service", async ({ page }) => {
    const serviceTitle = `E2E Service ${Date.now()}`;

    await login(
      page,
      process.env.E2E_EXPERT_USER || "expert.demo@n8nexperts.com",
      process.env.E2E_EXPERT_PASS || "Password123!"
    );

    await page.goto("/expert/setup");
    await page.getByLabel("Headline").fill("E2E n8n Automation Expert");
    await page
      .getByLabel("Bio")
      .fill("I build resilient n8n automations with retry logic, alerting, and maintainable operational documentation.");
    await page.getByLabel("Hourly Rate").fill("110");
    await page.getByLabel(/Skills \(comma separated\)/i).fill("n8n, webhooks, api integration");
    await page.getByRole("button", { name: /save profile/i }).click();
    await expect(page.getByText(/profile saved/i)).toBeVisible();

    await page.goto("/expert/services");
    await page.getByLabel(/^Title$/).fill(serviceTitle);
    await page
      .getByLabel(/^Description$/)
      .fill("Production n8n workflow implementation with retry strategy, observability, and post-launch support.");
    await page.getByLabel(/^Short Title$/).fill("Reliable n8n delivery");
    await page.getByLabel(/^Short Description$/).fill("Resilient n8n setup with docs.");
    await page.getByLabel(/^Price$/).fill("1400");
    await page.getByLabel(/^Delivery Days$/).fill("9");
    await page.getByRole("button", { name: /publish service/i }).click();

    await expect(page.getByText(serviceTitle)).toBeVisible();
  });

  test("expert can apply to a newly posted job", async ({ page }) => {
    const title = `E2E Apply Job ${Date.now()}`;

    await login(
      page,
      process.env.E2E_CLIENT_USER || "client.demo@n8nexperts.com",
      process.env.E2E_CLIENT_PASS || "Password123!"
    );

    await page.goto("/post-project");
    await page.getByLabel(/project title/i).fill(title);
    await page
      .getByLabel(/project description/i)
      .fill("Looking for a robust n8n implementation with webhook validation, retries, and incident alerting coverage.");
    await page.getByLabel(/budget/i).fill("1600");
    await page.getByLabel(/skills/i).fill("n8n, slack, webhooks");
    await page.getByRole("button", { name: /publish project/i }).click();
    await page.waitForURL("**/my-jobs");

    await login(
      page,
      process.env.E2E_EXPERT_USER || "expert.demo@n8nexperts.com",
      process.env.E2E_EXPERT_PASS || "Password123!"
    );

    await page.goto("/jobs");
    await page.getByPlaceholder(/search jobs/i).fill(title);
    await expect(page.getByText(title)).toBeVisible();
    await page.getByText(title).first().click();
    await page
      .getByLabel("Proposal")
      .fill("I can deliver this with resilient workflow design, robust error handling, and clear handoff documentation.");
    await page.getByRole("button", { name: /submit proposal/i }).click();

    await page.goto("/my-applications");
    await expect(page.getByRole("heading", { name: /my applications/i })).toBeVisible();
    await expect(page.getByText(title)).toBeVisible();
  });
});
