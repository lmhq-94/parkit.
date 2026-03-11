import { test, expect } from "@playwright/test";

test.describe("Navegación pública", () => {
  test("raíz redirige a dashboard o login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/(login|dashboard)/, { timeout: 10000 });
  });

  test("forgot-password carga el formulario de restablecer", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page.getByLabel(/correo|email/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("button", { name: /enviar enlace|send/i })).toBeVisible();
  });

  test("forgot-password: enviar email muestra mensaje de éxito y enlace a login", async ({ page }) => {
    await page.goto("/forgot-password");
    await page.getByLabel(/correo|email/i).fill("test@example.com");
    await page.getByRole("button", { name: /enviar enlace|send/i }).click();
    await expect(
      page.getByText(/revisa|check.*test@example\.com|correo.*restablecer/i)
    ).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole("link", { name: /volver|back.*iniciar|sign in/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /volver|back.*iniciar|sign in/i })).toHaveAttribute(
      "href",
      "/login"
    );
  });

  test("enlace soporte en forgot-password tiene mailto", async ({ page }) => {
    await page.goto("/forgot-password");
    const supportLink = page.getByRole("link", { name: /soporte|support/i });
    await expect(supportLink).toBeVisible();
    expect(await supportLink.getAttribute("href")).toMatch(/^mailto:/);
  });
});
