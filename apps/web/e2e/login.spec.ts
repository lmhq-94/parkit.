import { test, expect } from "@playwright/test";

test.describe("Página de login", () => {
  test("carga el formulario de login con email y contraseña", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByLabel(/correo electrónico|email/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("textbox", { name: /contraseña|password/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /iniciar sesión|sign in/i })).toBeVisible();
  });

  test("enlace olvidé contraseña lleva a /forgot-password", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: /olvidaste|forgot/i }).click();
    await expect(page).toHaveURL(/\/forgot-password/);
  });

  test("mostrar error al enviar credenciales inválidas", async ({ page }) => {
    await page.goto("/login");

    await page.route("**/auth/login", async (route) => {
      await route.fulfill({ status: 401, body: JSON.stringify({ message: "Invalid credentials" }) });
    });

    await page.getByLabel(/correo electrónico|email/i).fill("wrong@test.com");
    await page.getByRole("textbox", { name: /contraseña|password/i }).fill("wrongpassword");
    await page.getByRole("button", { name: /iniciar sesión|sign in/i }).click();

    await expect(page.getByText(/invalid|incorrecto|error|credentials/i)).toBeVisible({ timeout: 10000 });
  });
});
