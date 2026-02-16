import cors from "cors";
import express from "express";
import { config } from "./config.js";
import { getDb } from "./db.js";
import { authRouter } from "./routes/auth.js";
import { nutritionRouter } from "./routes/nutrition.js";
import { pantryRouter } from "./routes/pantry.js";
import { uploadsRouter } from "./routes/uploads.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRouter);
app.use("/pantry", pantryRouter);
app.use("/uploads", uploadsRouter);
app.use("/nutrition", nutritionRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const bootstrap = async () => {
  await getDb();
  app.listen(config.port, () => {
    console.log(`HomeCook server listening on port ${config.port}`);
  });
};

bootstrap().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
