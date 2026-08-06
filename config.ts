/**
 * Environment configuration, validated once at boot.
 *
 * Deliberately fails loudly and immediately on a missing required variable
 * rather than throwing on the first request that needs it. A container that
 * refuses to start is a deploy that visibly fails; a container that starts and
 * 500s on one route is an outage you find out about from a user.
 */

class ConfigError extends Error {}

function required(name: string): string {
  const value = process.env[name];
  if (value === undefined || value.trim() === '') {
    throw new ConfigError(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optional(name: string): string | undefined {
  const value = process.env[name];
  return value === undefined || value.trim() === '' ? undefined : value;
}

function port(): number {
  const raw = optional('PORT') ?? '8080';
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 65535) {
    throw new ConfigError(`PORT must be a valid port number, got: ${raw}`);
  }
  return parsed;
}

export const config = {
  nodeEnv: optional('NODE_ENV') ?? 'development',
  port: port(),

  /**
   * Supabase Postgres connection string.
   *
   * Optional at this build because nothing reads the database yet — the health
   * check only reports whether it is present. **Build 2 makes this required**,
   * at which point `optional` becomes `required` here and a deploy without it
   * will refuse to boot.
   */
  databaseUrl: optional('DATABASE_URL'),
} as const;

export const isProduction = config.nodeEnv === 'production';

export { ConfigError, required };
