import { app } from "./app";

const PORT = process.env.PORT || 4000;

async function bootstrap() {
  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Parkit backend running on port ${PORT} 🚀`);
  });
}

bootstrap().catch((err) => {
  console.error(`Failed to start server: ${err} ❌ `);
  process.exit(1);
});
