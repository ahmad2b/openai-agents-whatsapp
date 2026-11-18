import { timingSafeEqual } from 'node:crypto';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { createAgentReply } from './agent/agent.js';
import type { Reply } from './agent/types.js';
import { createWhatsAppClient } from './whatsapp/client.js';
import { createMessageHandler } from './whatsapp/messages.js';

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Set ${name} in .env`);
  return value;
}

const token = required('WEBHOOK_TOKEN');
if (token.length < 32) throw new Error('Use a WEBHOOK_TOKEN of at least 32 characters');
const mode = process.env.AGENT_MODE ?? 'echo';
if (mode !== 'echo' && mode !== 'openai') throw new Error('AGENT_MODE must be echo or openai');
if (mode === 'openai') required('OPENAI_API_KEY');
const reply: Reply = mode === 'openai'
  ? createAgentReply(required('OPENAI_MODEL'))
  : async messages => `Echo: ${messages.at(-1)!.content}`;

const client = createWhatsAppClient(required('WAHA_URL'), required('WAHA_API_KEY'));
const handler = createMessageHandler({
  reply,
  sendText: client.sendText,
  allowedChatIds: new Set((process.env.ALLOWED_CHAT_IDS ?? '').split(',').map(id => id.trim()).filter(Boolean)),
});
const app = new Hono();
app.get('/health', c => c.json({ status: 'ok', mode }));
app.use('/webhook', async (c, next) => {
  const received = Buffer.from(c.req.header('X-Webhook-Token') ?? '');
  const expected = Buffer.from(token);
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  await next();
});
app.use('/webhook', bodyLimit({
  maxSize: 64 * 1024,
  onError: c => c.json({ error: 'Webhook too large' }, 413),
}));
app.post('/webhook', async c => {
  let event: unknown;
  try { event = await c.req.json(); }
  catch { return c.json({ error: 'Invalid JSON' }, 400); }
  const status = handler.accept(event);
  // Acknowledge admission immediately; this demo queue is deliberately in memory.
  return c.json({ status }, status === 'busy' ? 503 : 200);
});
app.onError((_error, c) => {
  console.error('Request failed');
  return c.json({ error: 'Request failed' }, 500);
});

serve({ fetch: app.fetch, hostname: '0.0.0.0', port: 3001 });
console.log(`Listening on port 3001 (${mode} mode)`);
