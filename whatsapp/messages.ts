import { z } from 'zod';
import type { Message, Reply } from '../agent/types.js';

const incomingMessage = z.object({
  event: z.literal('message'),
  session: z.literal('default'),
  payload: z.object({
    id: z.string().min(1).max(512),
    from: z.string().regex(/^\d+@(c\.us|lid)$/),
    fromMe: z.literal(false),
    timestamp: z.number().int().positive(), // WAHA message time is in seconds.
    hasMedia: z.literal(false),
    body: z.string().trim().min(1).max(4000),
  }),
});

export function createMessageHandler(options: {
  reply: Reply;
  sendText: (chatId: string, text: string) => Promise<void>;
  allowedChatIds: Set<string>;
}) {
  const startedAt = Math.floor(Date.now() / 1000);
  const histories = new Map<string, Message[]>();
  const seen = new Map<string, number>();
  const queue: Array<z.infer<typeof incomingMessage>['payload']> = [];
  let running = false;

  // A single bounded queue keeps the walkthrough small and preserves chat order.
  async function drain() {
    if (running) return;
    running = true;
    try {
      while (queue.length) {
        const message = queue.shift()!;
        const previous = histories.get(message.from) ?? [];
        const input: Message[] = [...previous, { role: 'user', content: message.body }];
        let answer: string;
        try {
          answer = (await options.reply(input, AbortSignal.timeout(60_000))).trim().slice(0, 4000);
          if (!answer) throw new Error('Empty reply');
        } catch {
          console.error('Agent failed; no reply sent. Send a new message to try again.');
          continue;
        }
        try {
          // The destination comes only from the validated inbound message.
          await options.sendText(message.from, answer);
        } catch {
          // A timeout may mean WAHA sent it. Blind retries can duplicate replies.
          console.error('Delivery uncertain; not retrying automatically.');
          continue;
        }
        // Keep five complete turns per chat, up to 100 chats, in process memory.
        histories.delete(message.from);
        const completed: Message[] = [...input, { role: 'assistant', content: answer }];
        histories.set(message.from, completed.slice(-10));
        if (histories.size > 100) histories.delete(histories.keys().next().value!);
      }
    } finally {
      running = false;
    }
  }

  return {
    accept(event: unknown): 'accepted' | 'ignored' | 'busy' {
      const parsed = incomingMessage.safeParse(event);
      if (!parsed.success) return 'ignored';
      const message = parsed.data.payload;
      const now = Date.now();
      if (message.timestamp < startedAt || message.timestamp > now / 1000 + 30) return 'ignored';
      if (options.allowedChatIds.size && !options.allowedChatIds.has(message.from)) return 'ignored';

      for (const [id, expiresAt] of seen) if (expiresAt <= now) seen.delete(id);
      const key = `${message.from}:${message.id}`;
      if (seen.has(key)) return 'ignored';
      // Refuse new work when full instead of evicting duplicate protection early.
      if (queue.length >= 20 || seen.size >= 1000) return 'busy';
      seen.set(key, now + 60 * 60 * 1000);
      queue.push(message);
      void drain();
      return 'accepted';
    },
  };
}
