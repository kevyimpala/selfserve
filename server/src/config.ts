import "dotenv/config";

export const config = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 3000),
  jwtSecret: process.env.JWT_SECRET ?? "change-me",
  databasePath: process.env.DATABASE_PATH ?? "./homecook.db",
  emailFrom: process.env.EMAIL_FROM ?? "Self Serve <onboarding@resend.dev>",
  resendApiKey: process.env.RESEND_API_KEY ?? ""
};
