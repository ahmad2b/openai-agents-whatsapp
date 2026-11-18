import { Agent, assistant, run, setTracingDisabled, user } from '@openai/agents';
import type { Reply } from './types.js';

export function createAgentReply(model: string): Reply {
  // Avoid exporting conversation content to the SDK tracing service.
  setTracingDisabled(true);
  const agent = new Agent({
    name: 'WhatsApp assistant',
    model,
    instructions: 'You are a helpful assistant chatting on WhatsApp. Give clear, concise answers. You have no tools and cannot take actions outside this conversation.',
    modelSettings: { maxTokens: 1024, store: false },
  });

  return async (messages, signal) => {
    const input = messages.map(message => message.role === 'user'
      ? user(message.content)
      : assistant(message.content));
    const result = await run(agent, input, { signal, maxTurns: 2 });
    if (typeof result.finalOutput !== 'string' || !result.finalOutput.trim()) {
      throw new Error('Agent returned no text');
    }
    return result.finalOutput;
  };
}
