import { app } from "./app";

const PORT = process.env.PORT || 4000;

async function bootstrap() {
  app.listen(PORT, () => {
    console.log(`Parkit backend running on port ${PORT} 🚀`);
  });
}

bootstrap().catch((err) => {
  console.error(`Failed to start server: ${err} ❌ `);
  process.exit(1);
});
