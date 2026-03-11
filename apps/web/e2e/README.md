# Tests E2E (Playwright)

Los tests E2E se ejecutan contra la app Next.js en `http://localhost:3000`.

## Primera vez: instalar navegadores

En tu máquina hay que bajar Chromium una vez:

```bash
cd apps/web
npm run test:e2e:install
```

(o `npx playwright install` para instalar todos los navegadores).

## Cómo ejecutar

```bash
npm run test:e2e
```

Playwright arranca el servidor (`npm run dev`) si no hay nada en el puerto 3000. Si ya tienes `npm run dev` en otra terminal, lo reutiliza.

## Interfaz gráfica

```bash
npm run test:e2e:ui
```

## Estructura

- `login.spec.ts` – Página de login, enlaces y error con credenciales incorrectas (API mockeada).
- `dashboard.spec.ts` – Redirección a login cuando no hay sesión.
- `navigation.spec.ts` – Raíz, forgot-password.

## Nota

El test de “credenciales inválidas” mockea `POST .../auth/login` para no depender del backend real.
