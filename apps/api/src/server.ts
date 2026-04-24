import { app } from "./app";

const PORT = process.env.PORT || 4000;

async function bootstrap() {
  app.listen(Number(PORT), '0.0.0.0', () => {
  });
}

bootstrap().catch((_err) => {
  process.exit(1);
});
