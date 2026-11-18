import { mkdir, writeFile } from 'node:fs/promises';

const command = process.argv[2];
if (!['start', 'status', 'qr'].includes(command)) {
  console.error('Usage: npm run whatsapp -- start|status|qr');
  process.exit(1);
}
const base = process.env.WAHA_URL ?? 'http://localhost:3000';
const key = process.env.WAHA_API_KEY;
if (!key) throw new Error('Run npm run setup first');

async function request(path, init = {}) {
  return fetch(new URL(path, base), {
    ...init,
    headers: { 'X-Api-Key': key, 'Content-Type': 'application/json', ...init.headers },
    signal: AbortSignal.timeout(30_000),
    redirect: 'error',
  });
}

try {
  if (command === 'qr') {
    const response = await request('/api/default/auth/qr', { headers: { Accept: 'image/png' } });
    if (!response.ok) throw new Error('QR unavailable. Check status; wait for SCAN_QR_CODE.');
    if (!response.headers.get('content-type')?.startsWith('image/png')) throw new Error('QR response was not a PNG');
    await mkdir('.local', { recursive: true, mode: 0o700 });
    await writeFile('.local/qr.png', Buffer.from(await response.arrayBuffer()), { mode: 0o600 });
    console.log('Open .local/qr.png privately. In WhatsApp, choose Linked devices → Link a device.');
  } else {
    let response = await request('/api/sessions/default');
    if (command === 'start') {
      if (response.status === 404) {
        response = await request('/api/sessions', {
          method: 'POST', body: JSON.stringify({ name: 'default', start: true }),
        });
      } else if (response.ok && (await response.clone().json()).status === 'STOPPED') {
        response = await request('/api/sessions/default/start', { method: 'POST' });
      }
    }
    if (!response.ok) throw new Error('WAHA request failed. Check that the container is running and the API key matches.');
    const session = await response.json();
    console.log(`Session: ${session.status ?? 'starting'}. Run the status command again if starting.`);
  }
} catch (error) {
  // Do not print request objects, provider response bodies or private credentials.
  console.error(error instanceof TypeError ? 'Cannot reach WAHA. Check Docker and WAHA_URL.' : error.message);
  process.exitCode = 1;
}
