import "dotenv/config";

function requiredEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export const env = {
  PORT: Number(process.env.PORT || "3001"),
  JWT_SECRET: requiredEnv("JWT_SECRET", "dev-secret-change-me"),
  DATABASE_URL: requiredEnv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/quiniela")
};
