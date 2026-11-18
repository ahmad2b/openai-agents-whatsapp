export function createWhatsAppClient(baseUrl: string, apiKey: string) {
  return {
    async sendText(chatId: string, text: string): Promise<void> {
      const response = await fetch(new URL('/api/sendText', baseUrl), {
        method: 'POST',
        headers: { 'X-Api-Key': apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ session: 'default', chatId, text }),
        signal: AbortSignal.timeout(15_000),
        redirect: 'error',
      });
      // Never log provider response bodies, which may contain private data.
      await response.body?.cancel();
      if (!response.ok) throw new Error('WhatsApp send failed');
    },
  };
}
