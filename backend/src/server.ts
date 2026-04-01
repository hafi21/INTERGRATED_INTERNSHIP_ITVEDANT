import { app } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";

const startServer = async () => {
  await prisma.$connect();

  app.listen(env.PORT, () => {
    console.log(`API server running on http://localhost:${env.PORT}`);
  });
};

startServer().catch(async (error) => {
  console.error("Failed to start server", error);
  await prisma.$disconnect();
  process.exit(1);
});

