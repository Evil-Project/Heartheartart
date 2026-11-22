export function databaseUrlFromEnv(): string {
  const configured = process.env.DATABASE_URL?.trim();
  if (configured) return configured;

  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const hostPort = process.env.DB_HOST_PORT;
  const name = process.env.DB_NAME;
  if (!user || password == null || !hostPort || !name) {
    throw new Error(
      "Database configuration is missing. Set DATABASE_URL or DB_USER, DB_PASSWORD, DB_HOST_PORT, and DB_NAME.",
    );
  }

  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${hostPort}/${encodeURIComponent(name)}`;
}
