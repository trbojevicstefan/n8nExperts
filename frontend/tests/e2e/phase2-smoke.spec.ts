import { expect, test } from "@playwright/test";

const baseUrlConfigured = Boolean(process.env.E2E_BASE_URL);

const login = async (page, username, password) => {
  await page.goto("/auth/login");
  await page.locator("input").nth(0).fill(username);
  await page.locator("input").nth(1).fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL("**/");
};

test.describe("Phase 2 smoke", () => {
  test.skip(!baseUrlConfigured, "Set E2E_BASE_URL and running frontend/backend to execute smoke tests.");

  test("client can access applicant pipeline and client profile routes", async ({ page }) => {
    await login(
      page,
      process.env.E2E_CLIENT_USER || "client.demo@n8nexperts.com",
      process.env.E2E_CLIENT_PASS || "Password123!"
    );

    await page.goto("/my-jobs");
    await expect(page.getByRole("heading", { name: /my jobs/i })).toBeVisible();

    await page.goto("/client/profile");
    await expect(page.getByRole("heading", { name: /company and hiring profile/i })).toBeVisible();
  });

  test("expert can access applications and invitations routes", async ({ page }) => {
    await login(
      page,
      process.env.E2E_EXPERT_USER || "expert.demo@n8nexperts.com",
      process.env.E2E_EXPERT_PASS || "Password123!"
    );

    await page.goto("/my-applications");
    await expect(page.getByRole("heading", { name: /my applications/i })).toBeVisible();

    await page.goto("/invitations");
    await expect(page.getByRole("heading", { name: /invitation inbox/i })).toBeVisible();
  });
});
