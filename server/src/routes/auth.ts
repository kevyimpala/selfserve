import { Router, type Request, type Response } from "express";
import { requireAuth, type AuthedRequest, signToken } from "../auth.js";
import { getDb } from "../db.js";
import { sendPasswordResetCodeEmail, sendVerificationCodeEmail } from "../services/email.js";

type UserRow = {
  id: number;
  email: string;
  username: string | null;
  password: string;
  age: number | null;
  identity: string | null;
  email_verified: number;
  verification_code: string | null;
  verification_expires_at: string | null;
  password_reset_code: string | null;
  password_reset_expires_at: string | null;
  onboarding_completed: number;
};

export const authRouter = Router();

const generateCode = () => String(Math.floor(100000 + Math.random() * 900000));
const expiresInMinutes = (minutes: number) => new Date(Date.now() + minutes * 60_000).toISOString();

const issueVerificationCode = async (email: string, userId: number) => {
  const db = await getDb();
  const code = generateCode();
  const codeExpiry = expiresInMinutes(15);

  await db.run("UPDATE users SET verification_code = ?, verification_expires_at = ? WHERE id = ?", [
    code,
    codeExpiry,
    userId
  ]);

  const sent = await sendVerificationCodeEmail(email, code);
  if (!sent) {
    console.log(`[email:verification:fallback] to=${email} code=${code}`);
  }
};

const issuePasswordResetCode = async (email: string, userId: number) => {
  const db = await getDb();
  const resetCode = generateCode();
  const resetExpiry = expiresInMinutes(15);

  await db.run("UPDATE users SET password_reset_code = ?, password_reset_expires_at = ? WHERE id = ?", [
    resetCode,
    resetExpiry,
    userId
  ]);

  const sent = await sendPasswordResetCodeEmail(email, resetCode);
  if (!sent) {
    console.log(`[email:reset:fallback] to=${email} code=${resetCode}`);
  }
};

const signupHandler = async (req: Request, res: Response) => {
  const { email, username, password } = req.body as { email?: string; username?: string; password?: string };
  if (!email || !username || !password) {
    return res.status(400).json({ error: "Email, username, and password are required" });
  }

  const normalizedUsername = username.trim().toLowerCase();
  if (!normalizedUsername) {
    return res.status(400).json({ error: "Username is required" });
  }

  const db = await getDb();
  const existing = await db.get<{ id: number }>("SELECT id FROM users WHERE email = ? OR username = ?", [
    email,
    normalizedUsername
  ]);

  if (existing) {
    return res.status(409).json({ error: "Email or username already exists" });
  }

  const insertResult = await db.run(
    "INSERT INTO users (email, username, password, email_verified, onboarding_completed) VALUES (?, ?, ?, 0, 0)",
    [email, normalizedUsername, password]
  );

  const userId = insertResult.lastID;
  if (!userId) {
    return res.status(500).json({ error: "Failed to create account" });
  }

  try {
    await issueVerificationCode(email, userId);
  } catch (error) {
    await db.run("DELETE FROM users WHERE email = ?", [email]);
    return res.status(502).json({ error: error instanceof Error ? error.message : "Could not send verification email" });
  }

  return res.status(201).json({
    message: "Account created. Check your email for your verification code.",
    email
  });
};

authRouter.post("/signup", signupHandler);
authRouter.post("/register", signupHandler);

authRouter.post("/resend-verification", async (req, res) => {
  const { email } = req.body as { email?: string };
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const db = await getDb();
  const user = await db.get<UserRow>("SELECT * FROM users WHERE email = ?", [email]);
  if (!user) {
    return res.status(400).json({ error: "No account found for this email" });
  }

  if (user.email_verified) {
    return res.status(400).json({ error: "Email is already verified" });
  }

  try {
    await issueVerificationCode(user.email, user.id);
  } catch (error) {
    return res.status(502).json({ error: error instanceof Error ? error.message : "Could not resend verification email" });
  }

  return res.json({ message: "Verification code resent" });
});

authRouter.post("/verify-email", async (req, res) => {
  const { email, code } = req.body as { email?: string; code?: string };
  if (!email || !code) {
    return res.status(400).json({ error: "Email and code are required" });
  }

  const db = await getDb();
  const user = await db.get<UserRow>("SELECT * FROM users WHERE email = ?", [email]);
  if (!user) {
    return res.status(400).json({ error: "Invalid verification request" });
  }

  if (user.email_verified === 0) {
    const isExpired = !user.verification_expires_at || new Date(user.verification_expires_at).getTime() < Date.now();
    if (isExpired || user.verification_code !== code.trim()) {
      return res.status(400).json({ error: "Invalid or expired code" });
    }

    await db.run(
      "UPDATE users SET email_verified = 1, verification_code = NULL, verification_expires_at = NULL WHERE id = ?",
      [user.id]
    );
  }

  const token = signToken({ userId: user.id, email: user.email });
  return res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      onboardingCompleted: Boolean(user.onboarding_completed)
    }
  });
});

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const db = await getDb();
  const user = await db.get<UserRow>("SELECT * FROM users WHERE email = ?", [email]);

  if (!user || user.password !== password) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  if (!user.email_verified) {
    return res.status(403).json({ error: "Please verify your email before logging in" });
  }

  const token = signToken({ userId: user.id, email: user.email });
  return res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      onboardingCompleted: Boolean(user.onboarding_completed)
    }
  });
});

authRouter.post("/forgot-password", async (req, res) => {
  const { email } = req.body as { email?: string };
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const db = await getDb();
  const user = await db.get<UserRow>("SELECT * FROM users WHERE email = ?", [email]);

  if (user) {
    try {
      await issuePasswordResetCode(email, user.id);
    } catch (error) {
      return res.status(502).json({ error: error instanceof Error ? error.message : "Could not send reset email" });
    }
  }

  return res.json({ message: "If that email exists, a reset code has been sent." });
});

authRouter.post("/reset-password", async (req, res) => {
  const { email, code, newPassword } = req.body as { email?: string; code?: string; newPassword?: string };
  if (!email || !code || !newPassword) {
    return res.status(400).json({ error: "Email, code, and newPassword are required" });
  }
  if (newPassword.trim().length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  const db = await getDb();
  const user = await db.get<UserRow>("SELECT * FROM users WHERE email = ?", [email]);
  if (!user) {
    return res.status(400).json({ error: "Invalid reset request" });
  }

  const isExpired =
    !user.password_reset_expires_at || new Date(user.password_reset_expires_at).getTime() < Date.now();
  if (isExpired || user.password_reset_code !== code.trim()) {
    return res.status(400).json({ error: "Invalid or expired code" });
  }

  await db.run(
    "UPDATE users SET password = ?, password_reset_code = NULL, password_reset_expires_at = NULL WHERE id = ?",
    [newPassword, user.id]
  );

  return res.json({ message: "Password updated successfully" });
});

authRouter.post("/profile", requireAuth, async (req: AuthedRequest, res) => {
  const { age, identity } = req.body as { age?: number; identity?: string };
  const parsedAge = Number(age);
  if (!Number.isInteger(parsedAge) || parsedAge < 13 || parsedAge > 120) {
    return res.status(400).json({ error: "Age must be a whole number between 13 and 120" });
  }

  const normalizedIdentity = (identity ?? "").trim();
  if (!normalizedIdentity) {
    return res.status(400).json({ error: "Identity is required" });
  }

  const db = await getDb();
  await db.run("UPDATE users SET age = ?, identity = ?, onboarding_completed = 1 WHERE id = ?", [
    parsedAge,
    normalizedIdentity,
    req.user!.userId
  ]);

  return res.json({
    profile: {
      age: parsedAge,
      identity: normalizedIdentity,
      onboardingCompleted: true
    }
  });
});

authRouter.get("/me", requireAuth, async (req: AuthedRequest, res) => {
  const db = await getDb();
  const user = await db.get<UserRow>("SELECT * FROM users WHERE id = ?", [req.user!.userId]);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  return res.json({
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      age: user.age,
      identity: user.identity,
      emailVerified: Boolean(user.email_verified),
      onboardingCompleted: Boolean(user.onboarding_completed)
    }
  });
});
