export type Message = { role: 'user' | 'assistant'; content: string };

// WhatsApp identifiers and credentials stay outside this interface.
export type Reply = (messages: Message[], signal: AbortSignal) => Promise<string>;
