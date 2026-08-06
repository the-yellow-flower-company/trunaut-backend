import { Hono } from 'hono';
import { config } from '../config.js';

/**
 * Liveness endpoint. Fly's health checks hit this, and it is the smoke test for
 * every deploy.
 *
 * It reports *configuration* state, never secrets — `database` says whether a
 * connection string is present, never what it is. Once build 2 lands, this
 * gains a real connectivity probe; today there is nothing to connect to.
 */
export const health = new Hono();

health.get('/health', (c) =>
  c.json({
    status: 'ok',
    service: 'trunaut-backend',
    env: config.nodeEnv,
    database: config.databaseUrl ? 'configured' : 'not configured',
    uptimeSeconds: Math.floor(process.uptime()),
  }),
);
