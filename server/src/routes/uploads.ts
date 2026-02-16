import { Router } from "express";
import { requireAuth, type AuthedRequest } from "../auth.js";
import { getDb } from "../db.js";
import { parseImageIngredients } from "../services/vision.js";

export const uploadsRouter = Router();

uploadsRouter.post("/", requireAuth, async (req: AuthedRequest, res) => {
  const { imageBase64 } = req.body as { imageBase64?: string };
  if (!imageBase64) {
    return res.status(400).json({ error: "imageBase64 is required" });
  }

  const ingredients = await parseImageIngredients(imageBase64);
  const db = await getDb();
  const result = await db.run("INSERT INTO uploads (user_id, image_base64, ingredients_json) VALUES (?, ?, ?)", [
    req.user!.userId,
    imageBase64,
    JSON.stringify(ingredients)
  ]);

  return res.status(201).json({ id: result.lastID, ingredients });
});

uploadsRouter.get("/:id", requireAuth, async (req: AuthedRequest, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid upload id" });
  }

  const db = await getDb();
  const row = await db.get<{ id: number; image_base64: string; ingredients_json: string; created_at: string }>(
    "SELECT id, image_base64, ingredients_json, created_at FROM uploads WHERE id = ? AND user_id = ?",
    [id, req.user!.userId]
  );

  if (!row) {
    return res.status(404).json({ error: "Upload not found" });
  }

  return res.json({
    id: row.id,
    imageBase64: row.image_base64,
    ingredients: JSON.parse(row.ingredients_json) as string[],
    createdAt: row.created_at
  });
});
