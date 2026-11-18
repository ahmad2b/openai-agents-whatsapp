export function createWhatsAppClient(baseUrl: string, apiKey: string) {
  async function request(path: string, init: RequestInit = {}) {
    return fetch(new URL(path, baseUrl), {
      ...init,
      headers: { 'X-Api-Key': apiKey, 'Content-Type': 'application/json', ...init.headers },
      signal: AbortSignal.timeout(15_000),
      redirect: 'error',
    });
  }

  async function sessionStatus(): Promise<string> {
    const response = await request('/api/sessions/default');
    if (response.status === 404) { await response.body?.cancel(); return 'NOT_STARTED'; }
    if (!response.ok) { await response.body?.cancel(); throw new Error('Gateway unavailable'); }
    const data = await response.json() as { status?: unknown };
    const statuses = ['STOPPED', 'STARTING', 'SCAN_QR_CODE', 'WORKING', 'FAILED'];
    return typeof data.status === 'string' && statuses.includes(data.status) ? data.status : 'UNKNOWN';
  }

  return {
    sessionStatus,
    async startSession(): Promise<string> {
      const status = await sessionStatus();
      const path = status === 'NOT_STARTED' ? '/api/sessions'
        : status === 'STOPPED' ? '/api/sessions/default/start'
        : status === 'FAILED' ? '/api/sessions/default/restart' : undefined;
      if (path) {
        const response = await request(path, {
          method: 'POST',
          ...(status === 'NOT_STARTED' ? { body: JSON.stringify({ name: 'default', start: true }) } : {}),
        });
        await response.body?.cancel();
        if (!response.ok) throw new Error('Session could not start');
      }
      return sessionStatus();
    },
    async qr(): Promise<ArrayBuffer> {
      const response = await request('/api/default/auth/qr', { headers: { Accept: 'image/png' } });
      if (!response.ok || !response.headers.get('content-type')?.startsWith('image/png')) {
        await response.body?.cancel();
        throw new Error('QR is not ready');
      }
      const reader = response.body?.getReader();
      if (!reader) throw new Error('QR unavailable');
      try {
        const chunks: Uint8Array[] = [];
        let size = 0;
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          size += value.byteLength;
          if (size > 1024 * 1024) throw new Error('QR response too large');
          chunks.push(value);
        }
        const image = new Uint8Array(size);
        let offset = 0;
        for (const chunk of chunks) { image.set(chunk, offset); offset += chunk.length; }
        if (!Buffer.from(image.subarray(0, 8)).equals(Buffer.from('89504e470d0a1a0a', 'hex'))) {
          throw new Error('QR response invalid');
        }
        return image.buffer;
      } finally { await reader.cancel().catch(() => undefined); }
    },
    async sendText(chatId: string, text: string): Promise<void> {
      const response = await request('/api/sendText', {
        method: 'POST',
        body: JSON.stringify({ session: 'default', chatId, text }),
      });
      // Never log provider response bodies, which may contain private data.
      await response.body?.cancel();
      if (!response.ok) throw new Error('WhatsApp send failed');
    },
  };
}
