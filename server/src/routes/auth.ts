import { Router, type Request, type Response } from "express";
import { requireAuth, type AuthedRequest, signToken } from "../auth.js";
import { getDb } from "../db.js";

export const authRouter = Router();

const signupHandler = async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const db = await getDb();

  try {
    const result = await db.run("INSERT INTO users (email, password) VALUES (?, ?)", [email, password]);
    const userId = result.lastID;
    const token = signToken({ userId, email });
    return res.status(201).json({ token, user: { id: userId, email } });
  } catch {
    return res.status(409).json({ error: "User already exists" });
  }
};

authRouter.post("/signup", signupHandler);
authRouter.post("/register", signupHandler);

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const db = await getDb();
  const user = await db.get<{ id: number; email: string; password: string }>(
    "SELECT id, email, password FROM users WHERE email = ?",
    [email]
  );

  if (!user || user.password !== password) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = signToken({ userId: user.id, email: user.email });
  return res.json({ token, user: { id: user.id, email: user.email } });
});

authRouter.get("/me", requireAuth, async (req: AuthedRequest, res) => {
  return res.json({ user: req.user });
});
