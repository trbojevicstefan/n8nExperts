import { expect, test } from "@playwright/test";

test.describe("Public UI smoke", () => {
  test("renders the public homepage and role-selection path", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Hire n8n experts with less guessing." })).toBeVisible();
    await expect(page.getByRole("link", { name: "Browse Experts" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Find Jobs" }).first()).toBeVisible();

    await page.goto("/auth/role-select");

    await expect(page.getByRole("heading", { name: "Join n8nExperts" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Choose a role to continue" })).toBeDisabled();

    await page.getByRole("button", { name: "I need to hire" }).click();
    await expect(page.getByRole("button", { name: "Continue as Client" })).toBeEnabled();
  });

  test("renders the main public education pages", async ({ page }) => {
    const routes = [
      { path: "/how-it-works", heading: "A simpler path from brief to shortlist to real work." },
      { path: "/for-clients", heading: "Find someone who actually knows n8n." },
      { path: "/for-experts", heading: "Show what you build and get found for the right work." },
      { path: "/trust", heading: "Trust comes from proof, not platform slogans." },
    ];

    for (const route of routes) {
      await page.goto(route.path);
      await expect(page.getByRole("heading", { name: route.heading })).toBeVisible();
    }
  });
});
