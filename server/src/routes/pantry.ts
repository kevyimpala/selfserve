import { Router } from "express";
import { requireAuth, type AuthedRequest } from "../auth.js";
import { getDb } from "../db.js";

export const pantryRouter = Router();

pantryRouter.get("/", requireAuth, async (req: AuthedRequest, res) => {
  const db = await getDb();
  const items = await db.all<{ id: number; name: string; quantity: number; created_at: string }[]>(
    "SELECT id, name, quantity, created_at FROM pantry_items WHERE user_id = ? ORDER BY created_at DESC",
    [req.user!.userId]
  );

  return res.json({ items });
});

pantryRouter.post("/", requireAuth, async (req: AuthedRequest, res) => {
  const { name, quantity } = req.body as { name?: string; quantity?: number };
  if (!name) {
    return res.status(400).json({ error: "name is required" });
  }

  const safeQuantity = Number.isFinite(quantity) ? Number(quantity) : 1;
  const db = await getDb();

  const result = await db.run("INSERT INTO pantry_items (user_id, name, quantity) VALUES (?, ?, ?)", [
    req.user!.userId,
    name,
    safeQuantity
  ]);

  return res.status(201).json({
    item: {
      id: result.lastID,
      name,
      quantity: safeQuantity
    }
  });
});

pantryRouter.delete("/", requireAuth, async (req: AuthedRequest, res) => {
  const { id, name } = req.body as { id?: number; name?: string };
  if (!id && !name) {
    return res.status(400).json({ error: "Provide id or name to delete" });
  }

  const db = await getDb();

  if (id) {
    const result = await db.run("DELETE FROM pantry_items WHERE id = ? AND user_id = ?", [id, req.user!.userId]);
    return res.json({ deleted: result.changes ?? 0 });
  }

  const result = await db.run("DELETE FROM pantry_items WHERE name = ? AND user_id = ?", [name, req.user!.userId]);
  return res.json({ deleted: result.changes ?? 0 });
});
