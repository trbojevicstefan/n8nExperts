import { expect, test } from "@playwright/test";

const baseUrlConfigured = Boolean(process.env.E2E_BASE_URL);

const login = async (page, username: string, password: string) => {
  await page.goto("/auth/login");
  await page.locator("input").nth(0).fill(username);
  await page.locator("input").nth(1).fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL("**/");
};

test.describe("Workspace smoke", () => {
  test.skip(!baseUrlConfigured, "Set E2E_BASE_URL and running frontend/backend to execute smoke tests.");

  test("expert can open workspace and switch context to client view", async ({ page }) => {
    await login(
      page,
      process.env.E2E_EXPERT_USER || "expert.demo@n8nexperts.com",
      process.env.E2E_EXPERT_PASS || "Password123!"
    );

    await page.goto("/workspace");

    await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
    await expect(page.getByRole("button", { name: "Expert" })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("link", { name: /find work/i })).toBeVisible();
    await expect(page.getByText(/earnings this month/i)).toBeVisible();

    await page.getByRole("button", { name: "Client" }).click();
    await expect(page.getByRole("button", { name: "Client" })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText(/spending this month/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /post project/i })).toBeVisible();
  });

  test("client can open workspace notifications center", async ({ page }) => {
    await login(
      page,
      process.env.E2E_CLIENT_USER || "client.demo@n8nexperts.com",
      process.env.E2E_CLIENT_PASS || "Password123!"
    );

    await page.goto("/workspace");

    await expect(page.getByRole("button", { name: "Client" })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("heading", { name: /notifications/i })).toBeVisible();

    await page.getByRole("link", { name: /view all/i }).click();
    await expect(page).toHaveURL(/\/notifications$/);
    await expect(page.getByRole("heading", { name: /activity center/i })).toBeVisible();
  });
});
