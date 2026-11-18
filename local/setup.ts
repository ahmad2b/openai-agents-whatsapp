import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { z } from 'zod';
import type { Reply } from '../agent/types.js';
import type { createWhatsAppClient } from '../whatsapp/client.js';
import type { createMessageHandler } from '../whatsapp/messages.js';

// This router is authenticated by index.ts. No arbitrary destinations or commands.
export function createSetupRouter(options: {
  gateway: ReturnType<typeof createWhatsAppClient>;
  handler: ReturnType<typeof createMessageHandler>;
  reply: Reply;
  mode: string;
  model: string | null;
}) {
  const app = new Hono();
  let testing = false;
  app.use('*', async (c, next) => {
    c.header('Cache-Control', 'no-store');
    await next();
  });
  app.use('*', bodyLimit({ maxSize: 4096, onError: c => c.json({ error: 'Request too large' }, 413) }));
  app.get('/status', async c => {
    let session = 'UNAVAILABLE';
    try { session = await options.gateway.sessionStatus(); } catch { /* Report partial backend health. */ }
    return c.json({ mode: options.mode, model: options.model, session, activity: options.handler.activity() });
  });
  app.post('/session', async c => {
    try { return c.json({ session: await options.gateway.startSession() }); }
    catch { return c.json({ error: 'Could not start WhatsApp. Check the WAHA container, then retry.' }, 502); }
  });
  app.get('/qr', async c => {
    try {
      const png = await options.gateway.qr();
      c.header('Content-Type', 'image/png');
      return c.body(png);
    } catch { return c.json({ error: 'QR not ready. Wait for Scan QR status, then generate it again.' }, 409); }
  });
  app.post('/test', async c => {
    if (testing) return c.json({ error: 'Another agent test is running. Try again shortly.' }, 429);
    let body: unknown;
    try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON' }, 400); }
    const parsed = z.object({ text: z.string().trim().min(1).max(1000) }).safeParse(body);
    if (!parsed.success) return c.json({ error: 'Enter a message between 1 and 1,000 characters.' }, 400);
    testing = true;
    try {
      const answer = (await options.reply([{ role: 'user', content: parsed.data.text }], AbortSignal.timeout(60_000))).trim().slice(0, 4000);
      if (!answer) throw new Error('No answer');
      // This test calls the configured agent but never sends a WhatsApp message.
      return c.json({ answer, mode: options.mode });
    } catch { return c.json({ error: 'The agent test failed. Check the backend configuration and try again.' }, 502); }
    finally { testing = false; }
  });
  return app;
}
