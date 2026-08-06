import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { config } from './config.js';
import { health } from './routes/health.js';

const app = new Hono();

app.route('/', health);

/**
 * Unhandled errors must never leak internals to a client. The message goes to
 * the logs; the caller gets a shape the app can render.
 */
app.onError((err, c) => {
  console.error('[error]', err);
  return c.json({ error: 'internal_error' }, 500);
});

app.notFound((c) => c.json({ error: 'not_found' }, 404));

const server = serve({ fetch: app.fetch, port: config.port }, (info) => {
  console.log(`[boot] trunaut-backend listening on :${info.port} (${config.nodeEnv})`);
});

/**
 * Fly sends SIGTERM before replacing a machine. Closing the server lets
 * in-flight requests finish instead of being cut mid-response — which matters
 * more here than usual, since build 5 adds long-lived SSE chat streams.
 */
for (const signal of ['SIGTERM', 'SIGINT'] as const) {
  process.on(signal, () => {
    console.log(`[shutdown] ${signal} received, draining`);
    server.close(() => process.exit(0));
  });
}
