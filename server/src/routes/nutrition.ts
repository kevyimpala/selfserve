import { Router } from "express";
import { requireAuth } from "../auth.js";
import { lookupBarcode } from "../services/nutrition.js";

export const nutritionRouter = Router();

nutritionRouter.post("/barcode", requireAuth, async (req, res) => {
  const { barcode } = req.body as { barcode?: string };
  if (!barcode) {
    return res.status(400).json({ error: "barcode is required" });
  }

  const result = await lookupBarcode(barcode);
  return res.json(result);
});
