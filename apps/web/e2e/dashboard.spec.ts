import { test, expect } from "@playwright/test";

test.describe("Dashboard (ruta protegida)", () => {
  test("sin autenticación redirige a /login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("página de login es accesible", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole("button", { name: /iniciar sesión|sign in/i })).toBeVisible();
  });
});
